// Lisp Interpreter
// Evaluates Lisp expressions with lexical scoping and self-modification capability

import { parse, ParseError } from './parser.js';

/**
 * Environment for variable bindings with lexical scoping
 */
class Environment {
  constructor(parent = null, bindings = {}) {
    this.parent = parent;
    this.bindings = { ...bindings };
  }

  /**
   * Get a variable value, searching up the scope chain
   */
  get(name) {
    if (name in this.bindings) {
      return this.bindings[name];
    }
    
    if (this.parent) {
      return this.parent.get(name);
    }
    
    throw new Error(`Undefined variable: ${name}`);
  }

  /**
   * Set a variable value in the current scope
   */
  define(name, value) {
    this.bindings[name] = value;
  }

  /**
   * Update a variable value, searching up the scope chain
   */
  set(name, value) {
    if (name in this.bindings) {
      this.bindings[name] = value;
      return value;
    }
    
    if (this.parent) {
      return this.parent.set(name, value);
    }
    
    throw new Error(`Undefined variable: ${name}`);
  }

  /**
   * Create a new child environment
   */
  extend(bindings = {}) {
    return new Environment(this, bindings);
  }
}

/**
 * Lambda function representation
 */
class Lambda {
  constructor(params, body, env) {
    this.params = params;
    this.body = body;
    this.env = env;
  }
}

/**
 * Lisp Interpreter with core forms and operations
 */
export class LispInterpreter {
  constructor(options = {}) {
    this.maxOperations = options.maxOperations || 10000;
    this.timeout = options.timeout || 100; // milliseconds
    this.operationCount = 0;
    this.startTime = 0;
    
    // Bridge functions for JavaScript and WASM interop
    this.jsFunctions = new Map();
    this.wasmModules = new Map();
    
    // Whitelist of allowed JS functions (can be extended)
    this.allowedJSFunctions = new Set([
      'log',
      'get-entropy',
      'random'
    ]);
    
    this.globalEnv = this.createGlobalEnvironment();
  }

  /**
   * Create the global environment with built-in functions
   * This environment is sandboxed and does not have access to global JavaScript scope
   */
  createGlobalEnvironment() {
    const env = new Environment();
    
    // Arithmetic operations
    env.define('+', (...args) => args.reduce((a, b) => a + b, 0));
    env.define('-', (...args) => args.length === 1 ? -args[0] : args.reduce((a, b) => a - b));
    env.define('*', (...args) => args.reduce((a, b) => a * b, 1));
    env.define('/', (...args) => args.reduce((a, b) => a / b));
    
    // Comparison operations
    env.define('<', (a, b) => a < b);
    env.define('>', (a, b) => a > b);
    env.define('=', (a, b) => a === b);
    env.define('<=', (a, b) => a <= b);
    env.define('>=', (a, b) => a >= b);
    
    // List operations
    env.define('car', (list) => {
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('car: expected non-empty list');
      }
      return list[0];
    });
    
    env.define('cdr', (list) => {
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('cdr: expected non-empty list');
      }
      return list.slice(1);
    });
    
    env.define('cons', (item, list) => {
      if (!Array.isArray(list)) {
        throw new Error('cons: second argument must be a list');
      }
      return [item, ...list];
    });
    
    env.define('list', (...args) => args);
    
    env.define('length', (list) => {
      if (!Array.isArray(list)) {
        throw new Error('length: expected list');
      }
      return list.length;
    });
    
    env.define('null?', (list) => Array.isArray(list) && list.length === 0);
    
    // Boolean operations
    env.define('not', (x) => !x);
    env.define('and', (...args) => args.every(x => x));
    env.define('or', (...args) => args.some(x => x));
    
    // Type predicates
    env.define('number?', (x) => typeof x === 'number');
    env.define('string?', (x) => typeof x === 'string');
    env.define('list?', (x) => Array.isArray(x));
    env.define('procedure?', (x) => typeof x === 'function' || x instanceof Lambda);
    
    // Bridge primitives
    env.define('call-js', (funcName, ...args) => this.callJS(funcName, ...args));
    env.define('call-wasm', (moduleName, funcName, ...args) => this.callWASM(moduleName, funcName, ...args));
    
    return env;
  }

  /**
   * Register a JavaScript function that can be called from Lisp
   */
  registerJSFunction(name, func) {
    if (typeof func !== 'function') {
      throw new Error(`registerJSFunction: ${name} must be a function`);
    }
    this.jsFunctions.set(name, func);
    this.allowedJSFunctions.add(name);
  }

  /**
   * Register a WASM module that can be called from Lisp
   */
  registerWASMModule(name, module) {
    if (!module || typeof module !== 'object') {
      throw new Error(`registerWASMModule: ${name} must be an object`);
    }
    this.wasmModules.set(name, module);
  }

  /**
   * Call a JavaScript function from Lisp (with whitelist validation)
   */
  callJS(funcName, ...args) {
    // Validate function name is in whitelist
    if (!this.allowedJSFunctions.has(funcName)) {
      throw new Error(`call-js: function '${funcName}' is not in the whitelist`);
    }
    
    // Get the registered function
    const func = this.jsFunctions.get(funcName);
    if (!func) {
      throw new Error(`call-js: function '${funcName}' is not registered`);
    }
    
    // Call the function
    try {
      return func(...args);
    } catch (error) {
      throw new Error(`call-js: error calling '${funcName}': ${error.message}`);
    }
  }

  /**
   * Call a WASM module function from Lisp
   */
  callWASM(moduleName, funcName, ...args) {
    // Get the registered module
    const module = this.wasmModules.get(moduleName);
    if (!module) {
      throw new Error(`call-wasm: module '${moduleName}' is not registered`);
    }
    
    // Get the function from the module
    const func = module[funcName];
    if (typeof func !== 'function') {
      throw new Error(`call-wasm: function '${funcName}' not found in module '${moduleName}'`);
    }
    
    // Call the function
    try {
      return func(...args);
    } catch (error) {
      throw new Error(`call-wasm: error calling '${moduleName}.${funcName}': ${error.message}`);
    }
  }

  /**
   * Check execution limits (operation count and timeout)
   */
  checkLimits() {
    // Check operation count
    this.operationCount++;
    if (this.operationCount > this.maxOperations) {
      throw new Error('Execution limit exceeded: too many operations');
    }
    
    // Check timeout
    const elapsed = Date.now() - this.startTime;
    if (elapsed > this.timeout) {
      throw new Error(`Execution timeout: exceeded ${this.timeout}ms limit`);
    }
  }

  /**
   * Evaluate Lisp code
   */
  eval(code, env = this.globalEnv) {
    // Reset counters and start timer
    this.operationCount = 0;
    this.startTime = Date.now();
    
    try {
      // Parse the code
      const expressions = parse(code);
      
      // Evaluate all expressions and return the last result
      let result = null;
      for (const expr of expressions) {
        result = this.evalExpression(expr, env);
      }
      
      return result;
    } catch (error) {
      // Reset counters on error
      this.operationCount = 0;
      throw error;
    }
  }

  /**
   * Evaluate a single expression
   */
  evalExpression(expr, env) {
    // Check execution limits
    this.checkLimits();
    
    // Self-evaluating expressions (numbers, strings)
    if (typeof expr === 'number' || typeof expr === 'string') {
      return expr;
    }
    
    // Symbols (variable lookup)
    if (expr && expr.type === 'symbol') {
      return env.get(expr.value);
    }
    
    // Lists (function calls or special forms)
    if (Array.isArray(expr)) {
      if (expr.length === 0) {
        return [];
      }
      
      const first = expr[0];
      
      // Special forms
      if (first && first.type === 'symbol') {
        switch (first.value) {
          case 'def':
            return this.evalDef(expr, env);
          
          case 'lambda':
            return this.evalLambda(expr, env);
          
          case 'if':
            return this.evalIf(expr, env);
          
          case 'let':
            return this.evalLet(expr, env);
          
          case 'set!':
            return this.evalSet(expr, env);
          
          case 'begin':
            return this.evalBegin(expr, env);
          
          case 'quote':
            return this.evalQuote(expr, env);
        }
      }
      
      // Function application
      return this.evalApplication(expr, env);
    }
    
    throw new Error(`Cannot evaluate: ${JSON.stringify(expr)}`);
  }

  /**
   * Evaluate (def name value)
   */
  evalDef(expr, env) {
    if (expr.length !== 3) {
      throw new Error('def: expected (def name value)');
    }
    
    const name = expr[1];
    if (!name || name.type !== 'symbol') {
      throw new Error('def: name must be a symbol');
    }
    
    const value = this.evalExpression(expr[2], env);
    env.define(name.value, value);
    return value;
  }

  /**
   * Evaluate (lambda (params...) body)
   */
  evalLambda(expr, env) {
    if (expr.length !== 3) {
      throw new Error('lambda: expected (lambda (params...) body)');
    }
    
    const params = expr[1];
    if (!Array.isArray(params)) {
      throw new Error('lambda: parameters must be a list');
    }
    
    const paramNames = params.map(p => {
      if (!p || p.type !== 'symbol') {
        throw new Error('lambda: parameter names must be symbols');
      }
      return p.value;
    });
    
    const body = expr[2];
    return new Lambda(paramNames, body, env);
  }

  /**
   * Evaluate (if condition then-expr else-expr)
   */
  evalIf(expr, env) {
    if (expr.length !== 4 && expr.length !== 3) {
      throw new Error('if: expected (if condition then-expr [else-expr])');
    }
    
    const condition = this.evalExpression(expr[1], env);
    
    if (condition) {
      return this.evalExpression(expr[2], env);
    } else if (expr.length === 4) {
      return this.evalExpression(expr[3], env);
    }
    
    return null;
  }

  /**
   * Evaluate (let ((name value)...) body)
   */
  evalLet(expr, env) {
    if (expr.length !== 3) {
      throw new Error('let: expected (let ((name value)...) body)');
    }
    
    const bindings = expr[1];
    if (!Array.isArray(bindings)) {
      throw new Error('let: bindings must be a list');
    }
    
    const newEnv = env.extend();
    
    for (const binding of bindings) {
      if (!Array.isArray(binding) || binding.length !== 2) {
        throw new Error('let: each binding must be (name value)');
      }
      
      const name = binding[0];
      if (!name || name.type !== 'symbol') {
        throw new Error('let: binding name must be a symbol');
      }
      
      const value = this.evalExpression(binding[1], env);
      newEnv.define(name.value, value);
    }
    
    return this.evalExpression(expr[2], newEnv);
  }

  /**
   * Evaluate (set! name value)
   */
  evalSet(expr, env) {
    if (expr.length !== 3) {
      throw new Error('set!: expected (set! name value)');
    }
    
    const name = expr[1];
    if (!name || name.type !== 'symbol') {
      throw new Error('set!: name must be a symbol');
    }
    
    const value = this.evalExpression(expr[2], env);
    return env.set(name.value, value);
  }

  /**
   * Evaluate (begin expr1 expr2 ...)
   */
  evalBegin(expr, env) {
    if (expr.length < 2) {
      throw new Error('begin: expected at least one expression');
    }
    
    let result = null;
    for (let i = 1; i < expr.length; i++) {
      result = this.evalExpression(expr[i], env);
    }
    
    return result;
  }

  /**
   * Evaluate (quote expr)
   */
  evalQuote(expr, env) {
    if (expr.length !== 2) {
      throw new Error('quote: expected (quote expr)');
    }
    
    return expr[1];
  }

  /**
   * Evaluate function application
   */
  evalApplication(expr, env) {
    // Evaluate the function
    const func = this.evalExpression(expr[0], env);
    
    // Evaluate the arguments
    const args = expr.slice(1).map(arg => this.evalExpression(arg, env));
    
    // Apply the function
    if (typeof func === 'function') {
      return func(...args);
    }
    
    if (func instanceof Lambda) {
      if (args.length !== func.params.length) {
        throw new Error(`Function expects ${func.params.length} arguments, got ${args.length}`);
      }
      
      // Create new environment with parameters bound to arguments
      const bindings = {};
      for (let i = 0; i < func.params.length; i++) {
        bindings[func.params[i]] = args[i];
      }
      
      const newEnv = func.env.extend(bindings);
      return this.evalExpression(func.body, newEnv);
    }
    
    throw new Error(`Not a function: ${JSON.stringify(func)}`);
  }

  /**
   * Get the current environment
   */
  getEnvironment() {
    return this.globalEnv;
  }

  /**
   * Define a variable in the global environment
   */
  define(name, value) {
    this.globalEnv.define(name, value);
  }

  /**
   * Reset the interpreter to initial state
   */
  reset() {
    this.globalEnv = this.createGlobalEnvironment();
  }
}

export { Environment, Lambda };
