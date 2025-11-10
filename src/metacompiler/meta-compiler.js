/**
 * Meta-Compiler for OuroborOS-Chimera
 * 
 * Compiles multiple source languages (ALGOL, Lisp, Pascal, Rust, Go, Fortran)
 * into unified Ourocode intermediate representation.
 */

import { Lexer } from '../algol/lexer.js';
import { Parser } from '../algol/parser.js';
import { parse as parseLisp } from '../lisp/parser.js';
import {
  createOurocodeModule,
  OurocodeFunction,
  OurocodeBlock,
  ConstInstruction,
  ExtractInstruction,
  InsertInstruction,
  BinaryOpInstruction,
  BranchInstruction,
  PhiInstruction,
  ReturnInstruction
} from './ourocode-types.js';

export class MetaCompiler {
  constructor() {
    this.blockCounter = 0;
    this.varCounter = 0;
  }
  
  /**
   * Compile source code to Ourocode
   * @param {string} source - Source code
   * @param {string} language - Source language: 'algol' | 'lisp' | 'pascal' | 'rust' | 'go' | 'fortran'
   * @returns {OurocodeModule}
   */
  compile(source, language) {
    switch (language.toLowerCase()) {
      case 'algol':
        return this.compileALGOL(source);
      case 'lisp':
        return this.compileLisp(source);
      case 'pascal':
        return this.compilePascal(source);
      case 'rust':
        return this.compileRust(source);
      case 'go':
        return this.compileGo(source);
      case 'fortran':
        return this.compileFortran(source);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
  
  /**
   * Compile ALGOL to Ourocode
   * Uses existing ALGOL compiler to get AST, then converts to Ourocode
   */
  compileALGOL(source) {
    // Phase 1: Parse ALGOL to get tokens
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    
    // Phase 2: Parse tokens to AST
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    // Phase 3: Convert AST to Ourocode
    return this.astToOurocode(ast, 'algol');
  }
  
  /**
   * Compile Lisp to Ourocode
   * Parses Lisp s-expressions and converts to Ourocode
   */
  compileLisp(source) {
    // Phase 1: Parse Lisp to AST
    const ast = parseLisp(source);
    
    // Phase 2: Convert to Ourocode-compatible AST structure
    const normalizedAST = this.normalizeLispAST(ast);
    
    // Phase 3: Convert to Ourocode
    return this.astToOurocode(normalizedAST, 'lisp');
  }
  
  /**
   * Compile Pascal to Ourocode (stub for future implementation)
   */
  compilePascal(source) {
    throw new Error('Pascal compilation not yet implemented');
  }
  
  /**
   * Compile Rust to Ourocode (stub for future implementation)
   */
  compileRust(source) {
    throw new Error('Rust compilation not yet implemented');
  }
  
  /**
   * Compile Go to Ourocode (stub for future implementation)
   */
  compileGo(source) {
    throw new Error('Go compilation not yet implemented');
  }
  
  /**
   * Compile Fortran to Ourocode (stub for future implementation)
   */
  compileFortran(source) {
    throw new Error('Fortran compilation not yet implemented');
  }
  
  /**
   * Convert AST to Ourocode module
   * @param {ASTNode} ast - Abstract syntax tree
   * @param {string} source - Source language
   * @returns {OurocodeModule}
   */
  astToOurocode(ast, source) {
    // Reset counters for fresh compilation
    this.blockCounter = 0;
    this.varCounter = 0;
    
    // Create module with standard types
    const module = createOurocodeModule('organism_rules', source);
    
    // Create main mutation function
    const func = new OurocodeFunction(
      '@mutate_rule',
      [{ name: '%s', type: '%state' }],
      '%state'
    );
    
    // Create entry block
    const entryBlock = new OurocodeBlock('entry');
    
    // Extract state fields at the beginning
    entryBlock.instructions.push(
      new ExtractInstruction('%pop', '%s', 0),
      new ExtractInstruction('%energy', '%s', 1),
      new ExtractInstruction('%rate', '%s', 2)
    );
    
    // Convert AST statements to Ourocode instructions
    const context = {
      func,
      currentBlock: entryBlock,
      variables: new Map([
        ['population', '%pop'],
        ['energy', '%energy'],
        ['mutation_rate', '%rate']
      ])
    };
    
    this.convertStatements(ast, context);
    
    // Ensure the final block returns the state
    const finalState = context.variables.get('__state__') || '%s';
    if (!this.blockEndsWithTerminator(context.currentBlock)) {
      context.currentBlock.instructions.push(
        new ReturnInstruction(finalState)
      );
    }
    
    // Add entry block to function
    func.blocks.set('entry', entryBlock);
    
    // Add function to module
    module.functions.set('@mutate_rule', func);
    
    return module;
  }
  
  /**
   * Convert AST statements to Ourocode instructions
   */
  convertStatements(ast, context) {
    if (ast.type === 'Program') {
      // Convert each statement in the program
      for (const stmt of ast.statements) {
        const result = this.convertStatement(stmt, context);
        // Update state reference if statement modified it
        if (result) {
          context.variables.set('__state__', result);
        }
      }
    } else {
      // Single statement
      const result = this.convertStatement(ast, context);
      if (result) {
        context.variables.set('__state__', result);
      }
    }
  }
  
  /**
   * Convert a single AST statement to Ourocode
   */
  convertStatement(node, context) {
    switch (node.type) {
      case 'Assignment':
        return this.convertAssignment(node, context);
      case 'If':
        return this.convertIf(node, context);
      case 'While':
        return this.convertWhile(node, context);
      case 'Block':
        return this.convertBlock(node, context);
      default:
        throw new Error(`Unsupported statement type: ${node.type}`);
    }
  }
  
  /**
   * Convert assignment to Ourocode
   * identifier := expression  =>  insert into state
   */
  convertAssignment(node, context) {
    // Evaluate expression
    const exprVar = this.convertExpression(node.expression, context);
    
    // Map identifier to state field index
    const fieldIndex = this.getStateFieldIndex(node.identifier);
    
    // Generate insert instruction
    const newStateVar = this.freshVar();
    context.currentBlock.instructions.push(
      new InsertInstruction(newStateVar, '%s', fieldIndex, exprVar)
    );
    
    // Update state reference
    context.variables.set('__state__', newStateVar);
    
    return newStateVar;
  }
  
  /**
   * Convert if statement to Ourocode with branching
   */
  convertIf(node, context) {
    // Evaluate condition
    const condVar = this.convertExpression(node.condition, context);
    
    // Create blocks for then, else, and merge
    const thenLabel = this.freshLabel('then');
    const elseLabel = this.freshLabel('else');
    const mergeLabel = this.freshLabel('merge');
    
    const thenBlock = new OurocodeBlock(thenLabel);
    const elseBlock = new OurocodeBlock(elseLabel);
    const mergeBlock = new OurocodeBlock(mergeLabel);
    
    // Add conditional branch to current block
    context.currentBlock.instructions.push(
      new BranchInstruction(condVar, thenLabel, elseLabel)
    );
    
    // Convert then branch
    const thenContext = { ...context, currentBlock: thenBlock };
    this.convertStatement(node.thenBranch, thenContext);
    const thenResult = thenContext.variables.get('__state__') || '%s';
    
    // Add unconditional branch to merge from the final then block
    // (which might have changed if there was a nested IF)
    thenContext.currentBlock.instructions.push(new BranchInstruction(null, mergeLabel, null));
    
    // Convert else branch
    const elseContext = { ...context, currentBlock: elseBlock };
    if (node.elseBranch) {
      this.convertStatement(node.elseBranch, elseContext);
    }
    const elseResult = elseContext.variables.get('__state__') || '%s';
    
    // Add unconditional branch to merge from the final else block
    // (which might have changed if there was a nested IF)
    elseContext.currentBlock.instructions.push(new BranchInstruction(null, mergeLabel, null));
    
    // Create phi node in merge block for state
    const mergedState = this.freshVar();
    mergeBlock.instructions.push(
      new PhiInstruction(mergedState, [
        [thenResult, thenLabel],
        [elseResult, elseLabel]
      ])
    );
    
    // Add blocks to function
    context.func.blocks.set(thenLabel, thenBlock);
    context.func.blocks.set(elseLabel, elseBlock);
    context.func.blocks.set(mergeLabel, mergeBlock);
    
    // Update context to continue with merge block
    context.currentBlock = mergeBlock;
    context.variables.set('__state__', mergedState);
    
    return mergedState;
  }
  
  /**
   * Convert while loop to Ourocode (simplified - no actual loop for now)
   */
  convertWhile(node, context) {
    // For now, treat while as a simple conditional
    // Full loop support would require more complex control flow
    return this.convertIf(
      {
        type: 'If',
        condition: node.condition,
        thenBranch: node.body,
        elseBranch: null
      },
      context
    );
  }
  
  /**
   * Convert block to Ourocode
   */
  convertBlock(node, context) {
    for (const stmt of node.statements) {
      this.convertStatement(stmt, context);
    }
  }
  
  /**
   * Convert expression to Ourocode, returns variable name
   */
  convertExpression(node, context) {
    switch (node.type) {
      case 'BinaryOp':
        return this.convertBinaryOp(node, context);
      case 'UnaryOp':
        return this.convertUnaryOp(node, context);
      case 'Number':
        return this.convertNumber(node, context);
      case 'Identifier':
        return this.convertIdentifier(node, context);
      default:
        throw new Error(`Unsupported expression type: ${node.type}`);
    }
  }
  
  /**
   * Convert binary operation to Ourocode
   */
  convertBinaryOp(node, context) {
    const left = this.convertExpression(node.left, context);
    const right = this.convertExpression(node.right, context);
    
    const op = this.mapOperatorToOurocode(node.operator);
    const dest = this.freshVar();
    
    context.currentBlock.instructions.push(
      new BinaryOpInstruction(op, dest, left, right)
    );
    
    return dest;
  }
  
  /**
   * Convert unary operation to Ourocode
   */
  convertUnaryOp(node, context) {
    const operand = this.convertExpression(node.operand, context);
    
    if (node.operator === 'MINUS') {
      // Unary minus: 0 - operand
      const zero = this.freshVar();
      const dest = this.freshVar();
      
      context.currentBlock.instructions.push(
        new ConstInstruction(zero, 0),
        new BinaryOpInstruction('sub', dest, zero, operand)
      );
      
      return dest;
    }
    
    throw new Error(`Unsupported unary operator: ${node.operator}`);
  }
  
  /**
   * Convert number literal to Ourocode
   */
  convertNumber(node, context) {
    const dest = this.freshVar();
    context.currentBlock.instructions.push(
      new ConstInstruction(dest, node.value)
    );
    return dest;
  }
  
  /**
   * Convert identifier to Ourocode variable
   */
  convertIdentifier(node, context) {
    const varName = context.variables.get(node.name);
    if (!varName) {
      throw new Error(`Undefined variable: ${node.name}`);
    }
    return varName;
  }
  
  /**
   * Normalize Lisp AST to match ALGOL AST structure
   */
  normalizeLispAST(ast) {
    // Convert Lisp s-expressions to AST nodes compatible with ALGOL
    // This is a simplified version - full implementation would handle all Lisp forms
    
    if (ast.length === 0) {
      return { type: 'Program', statements: [] };
    }
    
    const statements = ast.map(expr => this.normalizeLispExpression(expr));
    
    return {
      type: 'Program',
      statements: statements.filter(s => s !== null)
    };
  }
  
  /**
   * Normalize a single Lisp expression
   */
  normalizeLispExpression(expr) {
    // Handle arrays (s-expressions)
    if (Array.isArray(expr)) {
      if (expr.length === 0) return null;
      
      const op = expr[0];
      
      // Handle set! (assignment)
      if (op.type === 'symbol' && op.value === 'set!') {
        return {
          type: 'Assignment',
          identifier: expr[1].value,
          expression: this.normalizeLispExpression(expr[2])
        };
      }
      
      // Handle if
      if (op.type === 'symbol' && op.value === 'if') {
        return {
          type: 'If',
          condition: this.normalizeLispExpression(expr[1]),
          thenBranch: this.normalizeLispExpression(expr[2]),
          elseBranch: expr[3] ? this.normalizeLispExpression(expr[3]) : null
        };
      }
      
      // Handle binary operators
      if (op.type === 'symbol' && ['+', '-', '*', '/', '>', '<', '=', '>=', '<=', '!='].includes(op.value)) {
        return {
          type: 'BinaryOp',
          operator: this.mapLispOperator(op.value),
          left: this.normalizeLispExpression(expr[1]),
          right: this.normalizeLispExpression(expr[2])
        };
      }
      
      return null;
    }
    
    // Handle atoms
    if (typeof expr === 'number') {
      return { type: 'Number', value: expr };
    }
    
    if (expr.type === 'symbol') {
      return { type: 'Identifier', name: expr.value };
    }
    
    return null;
  }
  
  /**
   * Map Lisp operator to token type
   */
  mapLispOperator(op) {
    const map = {
      '+': 'PLUS',
      '-': 'MINUS',
      '*': 'MULTIPLY',
      '/': 'DIVIDE',
      '>': 'GT',
      '<': 'LT',
      '=': 'EQ',
      '>=': 'GE',
      '<=': 'LE',
      '!=': 'NE'
    };
    return map[op] || op;
  }
  
  /**
   * Map ALGOL operator token to Ourocode operation
   */
  mapOperatorToOurocode(tokenType) {
    const map = {
      'PLUS': 'add',
      'MINUS': 'sub',
      'MULTIPLY': 'mul',
      'DIVIDE': 'div',
      'GT': 'gt',
      'LT': 'lt',
      'EQ': 'eq',
      'GE': 'ge',
      'LE': 'le',
      'NE': 'ne'
    };
    return map[tokenType] || tokenType.toLowerCase();
  }
  
  /**
   * Get state field index by name
   */
  getStateFieldIndex(fieldName) {
    const fieldMap = {
      'population': 0,
      'energy': 1,
      'mutation_rate': 2
    };
    
    const index = fieldMap[fieldName];
    if (index === undefined) {
      throw new Error(`Unknown state field: ${fieldName}`);
    }
    
    return index;
  }
  
  /**
   * Generate fresh variable name
   */
  freshVar() {
    return `%v${this.varCounter++}`;
  }
  
  /**
   * Generate fresh block label
   */
  freshLabel(prefix = 'block') {
    return `${prefix}${this.blockCounter++}`;
  }
  
  /**
   * Serialize Ourocode module to text
   * @param {OurocodeModule} module
   * @returns {string}
   */
  serialize(module) {
    let output = '';
    
    // Module header
    output += `@module ${module.name}\n`;
    output += `@version ${module.version}\n`;
    output += `@source ${module.source}\n\n`;
    
    // Type definitions
    for (const [name, type] of module.types) {
      output += this.serializeType(name, type);
    }
    output += '\n';
    
    // Function definitions
    for (const [name, func] of module.functions) {
      output += this.serializeFunction(func);
    }
    
    return output;
  }
  
  /**
   * Serialize type definition
   */
  serializeType(name, type) {
    if (type.kind === 'struct') {
      const fields = type.fields.map(f => f.type).join(', ');
      return `${name} = type { ${fields} }\n`;
    }
    return `${name} = type ${type.kind}\n`;
  }
  
  /**
   * Serialize function definition
   */
  serializeFunction(func) {
    let output = '';
    
    // Function signature
    const params = func.params.map(p => `${p.name}: ${p.type}`).join(', ');
    output += `define ${func.name}(${params}) -> ${func.returnType} {\n`;
    
    // Serialize entry block first
    if (func.blocks.has('entry')) {
      output += this.serializeBlock(func.blocks.get('entry'));
    }
    
    // Then serialize other blocks
    for (const [label, block] of func.blocks) {
      if (label !== 'entry') {
        output += this.serializeBlock(block);
      }
    }
    
    output += '}\n';
    
    return output;
  }
  
  /**
   * Serialize basic block
   */
  serializeBlock(block) {
    let output = `${block.label}:\n`;
    
    for (const instr of block.instructions) {
      output += '  ' + this.serializeInstruction(instr) + '\n';
    }
    
    return output;
  }
  
  /**
   * Serialize instruction
   */
  serializeInstruction(instr) {
    switch (instr.op) {
      case 'const':
        return `${instr.dest} = const ${instr.value}`;
      
      case 'extract':
        return `${instr.dest} = extract ${instr.struct}, ${instr.index}`;
      
      case 'insert':
        return `${instr.dest} = insert ${instr.struct}, ${instr.index}, ${instr.value}`;
      
      case 'add':
      case 'sub':
      case 'mul':
      case 'div':
      case 'gt':
      case 'lt':
      case 'eq':
      case 'ge':
      case 'le':
      case 'ne':
        return `${instr.dest} = ${instr.op} ${instr.left}, ${instr.right}`;
      
      case 'br':
        if (instr.cond) {
          return `br ${instr.cond}, label ${instr.trueLabel}, label ${instr.falseLabel}`;
        } else {
          return `br label ${instr.trueLabel}`;
        }
      
      case 'phi':
        const values = instr.values.map(([val, label]) => `[${val}, ${label}]`).join(', ');
        return `${instr.dest} = phi ${values}`;
      
      case 'ret':
        return `ret ${instr.value}`;
      
      default:
        return `; Unknown instruction: ${instr.op}`;
    }
  }
  
  /**
   * Check if block ends with terminator instruction
   */
  blockEndsWithTerminator(block) {
    if (block.instructions.length === 0) return false;
    const lastInstr = block.instructions[block.instructions.length - 1];
    return lastInstr.op === 'br' || lastInstr.op === 'ret';
  }
  
  /**
   * Generate SHA-256 hash of Ourocode module
   * @param {OurocodeModule} module
   * @returns {Promise<string>} Hex-encoded hash
   */
  async hash(module) {
    const serialized = this.serialize(module);
    const encoder = new TextEncoder();
    const data = encoder.encode(serialized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Validate Ourocode module
   * @param {OurocodeModule} module
   * @returns {boolean}
   */
  validate(module) {
    try {
      // Check module structure
      if (!module.name || !module.version || !module.source) {
        return false;
      }
      
      // Validate each function
      for (const [name, func] of module.functions) {
        if (!this.validateFunction(func)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }
  
  /**
   * Validate function
   */
  validateFunction(func) {
    // Check that all blocks end with terminators
    for (const [label, block] of func.blocks) {
      if (!this.blockEndsWithTerminator(block)) {
        console.error(`Block ${label} does not end with terminator`);
        return false;
      }
    }
    
    // Check that all branch targets exist
    for (const [label, block] of func.blocks) {
      for (const instr of block.instructions) {
        if (instr.op === 'br') {
          if (instr.trueLabel && !func.blocks.has(instr.trueLabel)) {
            console.error(`Branch target ${instr.trueLabel} does not exist`);
            return false;
          }
          if (instr.falseLabel && !func.blocks.has(instr.falseLabel)) {
            console.error(`Branch target ${instr.falseLabel} does not exist`);
            return false;
          }
        }
      }
    }
    
    return true;
  }
}
