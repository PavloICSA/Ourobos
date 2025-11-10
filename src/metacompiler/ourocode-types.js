/**
 * Ourocode Type Definitions
 * 
 * Ourocode is a symbolic intermediate representation that unifies
 * multiple programming languages (ALGOL, Lisp, Pascal, Rust, Go, Fortran)
 * into a single executable format.
 * 
 * Inspired by LLVM IR but designed for organism rule representation.
 */

/**
 * Ourocode Module
 * Top-level container for compiled organism code
 */
export class OurocodeModule {
  constructor(name, version, source) {
    this.name = name;           // Module name (e.g., "organism_rules")
    this.version = version;     // Version string (e.g., "1.0")
    this.source = source;       // Source language: 'algol' | 'lisp' | 'pascal' | 'rust' | 'go' | 'fortran'
    this.types = new Map();     // Type definitions: Map<string, OurocodeType>
    this.functions = new Map(); // Function definitions: Map<string, OurocodeFunction>
  }
}

/**
 * Ourocode Type System
 */
export class OurocodeType {
  constructor(kind, fields = null) {
    this.kind = kind; // 'f64' | 'i32' | 'bool' | 'struct' | 'array'
    this.fields = fields; // For struct types: Array<{name: string, type: string}>
  }
}

/**
 * Ourocode Function
 * Represents a compiled function with parameters, return type, and basic blocks
 */
export class OurocodeFunction {
  constructor(name, params, returnType) {
    this.name = name;           // Function name (e.g., "@mutate_rule")
    this.params = params;       // Array<{name: string, type: string}>
    this.returnType = returnType; // Return type string (e.g., "%state")
    this.blocks = new Map();    // Basic blocks: Map<string, OurocodeBlock>
  }
}

/**
 * Ourocode Basic Block
 * A sequence of instructions with a label
 */
export class OurocodeBlock {
  constructor(label) {
    this.label = label;         // Block label (e.g., "entry", "high_pop", "merge")
    this.instructions = [];     // Array<OurocodeInstruction>
  }
}

/**
 * Ourocode Instruction Types
 * 
 * Supported instructions:
 * - const: Load constant value
 * - extract: Extract field from struct
 * - insert: Insert value into struct field
 * - gt, lt, eq, ge, le, ne: Comparison operations
 * - add, sub, mul, div: Arithmetic operations
 * - br: Conditional or unconditional branch
 * - phi: SSA phi node for merging values
 * - call: Function call
 * - ret: Return from function
 */

export class ConstInstruction {
  constructor(dest, value) {
    this.op = 'const';
    this.dest = dest;   // Destination variable name
    this.value = value; // Constant value (number)
  }
}

export class ExtractInstruction {
  constructor(dest, struct, index) {
    this.op = 'extract';
    this.dest = dest;     // Destination variable name
    this.struct = struct; // Source struct variable name
    this.index = index;   // Field index (number)
  }
}

export class InsertInstruction {
  constructor(dest, struct, index, value) {
    this.op = 'insert';
    this.dest = dest;     // Destination variable name
    this.struct = struct; // Source struct variable name
    this.index = index;   // Field index (number)
    this.value = value;   // Value to insert (variable name)
  }
}

export class BinaryOpInstruction {
  constructor(op, dest, left, right) {
    this.op = op; // 'gt' | 'lt' | 'eq' | 'ge' | 'le' | 'ne' | 'add' | 'sub' | 'mul' | 'div'
    this.dest = dest;   // Destination variable name
    this.left = left;   // Left operand variable name
    this.right = right; // Right operand variable name
  }
}

export class BranchInstruction {
  constructor(cond, trueLabel, falseLabel = null) {
    this.op = 'br';
    this.cond = cond;           // Condition variable name (null for unconditional)
    this.trueLabel = trueLabel; // Target label if true (or unconditional target)
    this.falseLabel = falseLabel; // Target label if false (null for unconditional)
  }
}

export class PhiInstruction {
  constructor(dest, values) {
    this.op = 'phi';
    this.dest = dest;     // Destination variable name
    this.values = values; // Array<[value, label]> - incoming values from different blocks
  }
}

export class CallInstruction {
  constructor(dest, func, args) {
    this.op = 'call';
    this.dest = dest;   // Destination variable name (null if void)
    this.func = func;   // Function name to call
    this.args = args;   // Array of argument variable names
  }
}

export class ReturnInstruction {
  constructor(value) {
    this.op = 'ret';
    this.value = value; // Return value variable name (null for void)
  }
}

/**
 * Ourocode Instruction Set Documentation
 * 
 * CONST - Load constant value
 *   %dest = const <value>
 *   Example: %rate = const 0.05
 * 
 * EXTRACT - Extract field from struct
 *   %dest = extract %struct, <index>
 *   Example: %pop = extract %state, 0
 * 
 * INSERT - Insert value into struct field
 *   %dest = insert %struct, <index>, %value
 *   Example: %new_state = insert %state, 2, %rate
 * 
 * GT, LT, EQ, GE, LE, NE - Comparison operations
 *   %dest = <op> %left, %right
 *   Example: %cond = gt %pop, 100.0
 * 
 * ADD, SUB, MUL, DIV - Arithmetic operations
 *   %dest = <op> %left, %right
 *   Example: %sum = add %a, %b
 * 
 * BR - Branch (conditional or unconditional)
 *   br %cond, label %true, label %false  (conditional)
 *   br label %target                      (unconditional)
 *   Example: br %cond, label %high_pop, label %low_pop
 * 
 * PHI - SSA phi node (merge values from different control flow paths)
 *   %dest = phi [%val1, %label1], [%val2, %label2], ...
 *   Example: %rate = phi [%rate1, %high_pop], [%rate2, %low_pop]
 * 
 * CALL - Function call
 *   %dest = call @function(%arg1, %arg2, ...)
 *   Example: %result = call @helper(%x, %y)
 * 
 * RET - Return from function
 *   ret %value
 *   Example: ret %new_state
 */

/**
 * Standard Organism State Type
 * This is the default type used for organism state across all languages
 */
export function createOrganismStateType() {
  return new OurocodeType('struct', [
    { name: 'population', type: 'f64' },
    { name: 'energy', type: 'f64' },
    { name: 'mutation_rate', type: 'f64' }
  ]);
}

/**
 * Helper function to create a new Ourocode module with standard types
 */
export function createOurocodeModule(name, source) {
  const module = new OurocodeModule(name, '1.0', source);
  
  // Add standard organism state type
  module.types.set('%state', createOrganismStateType());
  
  return module;
}
