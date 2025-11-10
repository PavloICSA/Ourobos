/**
 * Ourocode Executor
 * 
 * Interprets and executes Ourocode intermediate representation.
 * Provides runtime execution of compiled organism rules.
 */

export class ExecutionError extends Error {
  constructor(message, instruction) {
    super(message);
    this.name = 'ExecutionError';
    this.instruction = instruction;
  }
}

export class OurocodeExecutor {
  constructor(options = {}) {
    this.modules = new Map();
    this.maxInstructions = options.maxInstructions || 100000;
    this.maxMemory = options.maxMemory || 10 * 1024 * 1024; // 10MB
    this.timeout = options.timeout || 1000; // 1 second
    this.instructionCount = 0;
    this.startTime = 0;
  }
  
  /**
   * Load Ourocode module into executor
   * @param {OurocodeModule} module
   */
  loadModule(module) {
    this.modules.set(module.name, module);
  }
  
  /**
   * Execute a function from a loaded module
   * @param {string} moduleName - Name of the module
   * @param {string} functionName - Name of the function (e.g., '@mutate_rule')
   * @param {Array} args - Function arguments
   * @returns {any} Function return value
   */
  execute(moduleName, functionName, args) {
    // Reset execution counters
    this.instructionCount = 0;
    this.startTime = Date.now();
    
    // Get module
    const module = this.modules.get(moduleName);
    if (!module) {
      throw new ExecutionError(`Module not found: ${moduleName}`);
    }
    
    // Get function
    const func = module.functions.get(functionName);
    if (!func) {
      throw new ExecutionError(`Function not found: ${functionName}`);
    }
    
    // Validate argument count
    if (args.length !== func.params.length) {
      throw new ExecutionError(
        `Expected ${func.params.length} arguments, got ${args.length}`
      );
    }
    
    // Execute function
    return this.interpretFunction(func, args);
  }
  
  /**
   * Interpret a function with given arguments
   * @param {OurocodeFunction} func
   * @param {Array} args
   * @returns {any}
   */
  interpretFunction(func, args) {
    // Create execution environment
    const env = new Map();
    
    // Bind parameters to arguments
    func.params.forEach((param, i) => {
      env.set(param.name, args[i]);
    });
    
    // Start execution from entry block
    let currentBlockLabel = 'entry';
    let previousBlockLabel = null;
    
    while (currentBlockLabel) {
      // Check execution limits
      this.checkLimits();
      
      // Get current block
      const block = func.blocks.get(currentBlockLabel);
      if (!block) {
        throw new ExecutionError(`Block not found: ${currentBlockLabel}`);
      }
      
      // Execute instructions in block
      for (const instr of block.instructions) {
        const result = this.executeInstruction(instr, env, previousBlockLabel);
        
        // Handle control flow
        if (result.type === 'branch') {
          previousBlockLabel = currentBlockLabel;
          currentBlockLabel = result.target;
          break; // Exit instruction loop, continue with new block
        } else if (result.type === 'return') {
          return result.value;
        }
        
        // Continue to next instruction
      }
      
      // If we reach here without branching or returning, there's an error
      if (currentBlockLabel === block.label) {
        throw new ExecutionError(`Block ${block.label} does not end with terminator`);
      }
    }
    
    throw new ExecutionError('Function did not return a value');
  }
  
  /**
   * Execute a single instruction
   * @param {Object} instr - Instruction to execute
   * @param {Map} env - Execution environment (variable bindings)
   * @param {string} previousBlock - Label of previous block (for phi nodes)
   * @returns {Object} Execution result: {type: 'continue'|'branch'|'return', ...}
   */
  executeInstruction(instr, env, previousBlock = null) {
    this.instructionCount++;
    
    switch (instr.op) {
      case 'const':
        return this.executeConst(instr, env);
      
      case 'extract':
        return this.executeExtract(instr, env);
      
      case 'insert':
        return this.executeInsert(instr, env);
      
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
        return this.executeBinaryOp(instr, env);
      
      case 'br':
        return this.executeBranch(instr, env);
      
      case 'phi':
        return this.executePhi(instr, env, previousBlock);
      
      case 'ret':
        return this.executeReturn(instr, env);
      
      default:
        throw new ExecutionError(`Unknown instruction: ${instr.op}`, instr);
    }
  }
  
  /**
   * Execute CONST instruction
   */
  executeConst(instr, env) {
    env.set(instr.dest, instr.value);
    return { type: 'continue' };
  }
  
  /**
   * Execute EXTRACT instruction
   */
  executeExtract(instr, env) {
    const struct = env.get(instr.struct);
    if (!struct) {
      throw new ExecutionError(`Undefined variable: ${instr.struct}`, instr);
    }
    
    if (!Array.isArray(struct)) {
      throw new ExecutionError(`Cannot extract from non-struct: ${instr.struct}`, instr);
    }
    
    if (instr.index < 0 || instr.index >= struct.length) {
      throw new ExecutionError(`Index out of bounds: ${instr.index}`, instr);
    }
    
    env.set(instr.dest, struct[instr.index]);
    return { type: 'continue' };
  }
  
  /**
   * Execute INSERT instruction
   */
  executeInsert(instr, env) {
    const struct = env.get(instr.struct);
    if (!struct) {
      throw new ExecutionError(`Undefined variable: ${instr.struct}`, instr);
    }
    
    if (!Array.isArray(struct)) {
      throw new ExecutionError(`Cannot insert into non-struct: ${instr.struct}`, instr);
    }
    
    const value = env.get(instr.value);
    if (value === undefined) {
      throw new ExecutionError(`Undefined variable: ${instr.value}`, instr);
    }
    
    // Create new struct with updated value (immutable)
    const newStruct = [...struct];
    newStruct[instr.index] = value;
    
    env.set(instr.dest, newStruct);
    return { type: 'continue' };
  }
  
  /**
   * Execute binary operation
   */
  executeBinaryOp(instr, env) {
    const left = env.get(instr.left);
    const right = env.get(instr.right);
    
    if (left === undefined) {
      throw new ExecutionError(`Undefined variable: ${instr.left}`, instr);
    }
    if (right === undefined) {
      throw new ExecutionError(`Undefined variable: ${instr.right}`, instr);
    }
    
    let result;
    
    switch (instr.op) {
      case 'add':
        result = left + right;
        break;
      case 'sub':
        result = left - right;
        break;
      case 'mul':
        result = left * right;
        break;
      case 'div':
        if (right === 0) {
          throw new ExecutionError('Division by zero', instr);
        }
        result = left / right;
        break;
      case 'gt':
        result = left > right;
        break;
      case 'lt':
        result = left < right;
        break;
      case 'eq':
        result = left === right;
        break;
      case 'ge':
        result = left >= right;
        break;
      case 'le':
        result = left <= right;
        break;
      case 'ne':
        result = left !== right;
        break;
      default:
        throw new ExecutionError(`Unknown binary operation: ${instr.op}`, instr);
    }
    
    env.set(instr.dest, result);
    return { type: 'continue' };
  }
  
  /**
   * Execute BRANCH instruction
   */
  executeBranch(instr, env) {
    // Unconditional branch
    if (!instr.cond) {
      return {
        type: 'branch',
        target: instr.trueLabel
      };
    }
    
    // Conditional branch
    const cond = env.get(instr.cond);
    if (cond === undefined) {
      throw new ExecutionError(`Undefined variable: ${instr.cond}`, instr);
    }
    
    return {
      type: 'branch',
      target: cond ? instr.trueLabel : instr.falseLabel
    };
  }
  
  /**
   * Execute PHI instruction
   * Selects the value based on which block we came from
   */
  executePhi(instr, env, previousBlock) {
    // Find the value corresponding to the previous block
    for (const [value, label] of instr.values) {
      if (label === previousBlock) {
        const val = env.get(value);
        if (val !== undefined) {
          env.set(instr.dest, val);
          return { type: 'continue' };
        }
      }
    }
    
    // If no match found, try to find any defined value
    for (const [value, label] of instr.values) {
      const val = env.get(value);
      if (val !== undefined) {
        env.set(instr.dest, val);
        return { type: 'continue' };
      }
    }
    
    throw new ExecutionError(`No defined value in phi node`, instr);
  }
  
  /**
   * Execute RETURN instruction
   */
  executeReturn(instr, env) {
    const value = env.get(instr.value);
    if (value === undefined) {
      throw new ExecutionError(`Undefined variable: ${instr.value}`, instr);
    }
    
    return {
      type: 'return',
      value: value
    };
  }
  
  /**
   * Check execution limits to prevent infinite loops and resource exhaustion
   */
  checkLimits() {
    // Check instruction count
    if (this.instructionCount > this.maxInstructions) {
      throw new ExecutionError(
        `Instruction limit exceeded: ${this.maxInstructions}`
      );
    }
    
    // Check timeout
    const elapsed = Date.now() - this.startTime;
    if (elapsed > this.timeout) {
      throw new ExecutionError(
        `Execution timeout: ${this.timeout}ms`
      );
    }
  }
  
  /**
   * Get execution statistics
   */
  getStats() {
    return {
      instructionCount: this.instructionCount,
      elapsedTime: Date.now() - this.startTime,
      loadedModules: this.modules.size
    };
  }
  
  /**
   * Reset executor state
   */
  reset() {
    this.instructionCount = 0;
    this.startTime = 0;
  }
  
  /**
   * Unload a module
   */
  unloadModule(moduleName) {
    return this.modules.delete(moduleName);
  }
  
  /**
   * Clear all loaded modules
   */
  clearModules() {
    this.modules.clear();
  }
}

/**
 * Helper function to create organism state array
 * @param {number} population
 * @param {number} energy
 * @param {number} mutationRate
 * @returns {Array}
 */
export function createOrganismState(population, energy, mutationRate) {
  return [population, energy, mutationRate];
}

/**
 * Helper function to extract state fields
 * @param {Array} state
 * @returns {Object}
 */
export function extractStateFields(state) {
  return {
    population: state[0],
    energy: state[1],
    mutationRate: state[2]
  };
}
