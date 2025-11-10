# Ourocode Specification

Complete specification for Ourocode, the intermediate representation used by OuroborOS-Chimera's meta-compiler.

## Table of Contents

- [Overview](#overview)
- [Design Goals](#design-goals)
- [Syntax](#syntax)
- [Type System](#type-system)
- [Instructions](#instructions)
- [Control Flow](#control-flow)
- [Examples](#examples)
- [Validation Rules](#validation-rules)

---

## Overview

**Ourocode** is a symbolic intermediate representation (IR) that unifies multiple programming languages (Pascal, Lisp, ALGOL, Rust, Go, Fortran) into a single executable format. It is inspired by LLVM IR but designed specifically for organism mutation code.

### Key Features

- **Language-agnostic**: Compiles from any supported source language
- **Human-readable**: Text-based format with clear syntax
- **Verifiable**: Can be validated on-chain via smart contracts
- **Executable**: Can be interpreted or JIT-compiled
- **Hashable**: Cryptographic hashing for blockchain storage

---

## Design Goals

1. **Simplicity**: Easy to generate from source languages
2. **Safety**: Bounded execution, no infinite loops
3. **Portability**: Runs across all runtime layers (Rust, Go, Fortran, Lisp)
4. **Verifiability**: Syntax and semantics can be checked on-chain
5. **Expressiveness**: Supports organism mutation logic

---

## Syntax

### Module Structure

```
@module <name>
@version <version>
@source <language>

<type_definitions>

<function_definitions>
```

### Comments

```
; This is a comment
```

### Identifiers

- Module names: `@module_name`
- Type names: `%type_name`
- Function names: `@function_name`
- Variable names: `%variable_name`
- Block labels: `label_name`

---

## Type System

### Primitive Types

| Type | Description | Size |
|------|-------------|------|
| `i32` | 32-bit signed integer | 4 bytes |
| `i64` | 64-bit signed integer | 8 bytes |
| `f32` | 32-bit floating point | 4 bytes |
| `f64` | 64-bit floating point | 8 bytes |
| `bool` | Boolean | 1 byte |

### Composite Types

#### Struct

```
%state = type { f64, f64, f64 }
```

Defines a structure with three f64 fields.

#### Array

```
%vector = type [10 x f64]
```

Defines an array of 10 f64 values.

### Type Definitions

```
%state = type { f64, f64, f64 }
%vector = type [10 x f64]
%matrix = type [10 x [10 x f64]]
```

---

## Instructions

### Arithmetic

#### `add`
Add two values.

```
%result = add %a, %b
```

#### `sub`
Subtract two values.

```
%result = sub %a, %b
```

#### `mul`
Multiply two values.

```
%result = mul %a, %b
```

#### `div`
Divide two values.

```
%result = div %a, %b
```

---

### Comparison

#### `gt`
Greater than comparison.

```
%result = gt %a, %b
```

#### `lt`
Less than comparison.

```
%result = lt %a, %b
```

#### `eq`
Equality comparison.

```
%result = eq %a, %b
```

#### `ne`
Not equal comparison.

```
%result = ne %a, %b
```

---

### Memory Operations

#### `const`
Load a constant value.

```
%value = const 42.0
```

#### `extract`
Extract field from struct.

```
%field = extract %struct, 0
```

Extracts field at index 0 from struct.

#### `insert`
Insert value into struct field.

```
%new_struct = insert %struct, 2, %value
```

Inserts `%value` into field 2 of `%struct`.

---

### Control Flow

#### `br`
Conditional branch.

```
br %condition, label %true_block, label %false_block
```

If `%condition` is true, jump to `%true_block`, otherwise jump to `%false_block`.

#### `jmp`
Unconditional jump.

```
jmp label %target_block
```

#### `phi`
PHI node for merging values from different paths.

```
%result = phi [%value1, %block1], [%value2, %block2]
```

#### `ret`
Return from function.

```
ret %value
```

---

### Function Calls

#### `call`
Call a function.

```
%result = call @function_name(%arg1, %arg2)
```

---

## Control Flow

### Basic Blocks

Functions are organized into basic blocks:

```
define @function_name(%param: %type) -> %return_type {
entry:
  ; Instructions
  br %cond, label %block1, label %block2

block1:
  ; Instructions
  jmp label %merge

block2:
  ; Instructions
  jmp label %merge

merge:
  %result = phi [%val1, %block1], [%val2, %block2]
  ret %result
}
```

### Rules

1. Each block must end with a terminator (`br`, `jmp`, `ret`)
2. First block must be named `entry`
3. All referenced blocks must exist
4. PHI nodes must reference predecessor blocks

---

## Examples

### Example 1: Simple Mutation Rule

**ALGOL Source:**
```algol
IF population > 100 THEN
  mutation_rate := 0.05
ELSE
  mutation_rate := 0.1
```

**Ourocode:**
```
@module mutation_rule
@version 1.0
@source algol

%state = type { f64, f64, f64 }

define @mutate(%s: %state) -> %state {
entry:
  %pop = extract %s, 0
  %threshold = const 100.0
  %cond = gt %pop, %threshold
  br %cond, label %high_pop, label %low_pop

high_pop:
  %rate1 = const 0.05
  jmp label %merge

low_pop:
  %rate2 = const 0.1
  jmp label %merge

merge:
  %final_rate = phi [%rate1, %high_pop], [%rate2, %low_pop]
  %new_state = insert %s, 2, %final_rate
  ret %new_state
}
```

---

### Example 2: Energy-Based Growth

**Lisp Source:**
```lisp
(if (< energy 20)
    (set growth-rate 0.1)
    (set growth-rate 0.5))
```

**Ourocode:**
```
@module energy_growth
@version 1.0
@source lisp

%state = type { f64, f64, f64 }

define @adjust_growth(%s: %state) -> %state {
entry:
  %energy = extract %s, 1
  %threshold = const 20.0
  %cond = lt %energy, %threshold
  br %cond, label %low_energy, label %high_energy

low_energy:
  %rate1 = const 0.1
  jmp label %merge

high_energy:
  %rate2 = const 0.5
  jmp label %merge

merge:
  %growth_rate = phi [%rate1, %low_energy], [%rate2, %high_energy]
  ; Assume growth_rate is stored in a separate field
  ret %s
}
```

---

### Example 3: Complex Mutation with Multiple Conditions

**ALGOL Source:**
```algol
IF population > 100 AND energy > 50 THEN
  mutation_rate := 0.05
ELSE IF population < 50 THEN
  mutation_rate := 0.2
ELSE
  mutation_rate := 0.1
```

**Ourocode:**
```
@module complex_mutation
@version 1.0
@source algol

%state = type { f64, f64, f64 }

define @complex_mutate(%s: %state) -> %state {
entry:
  %pop = extract %s, 0
  %energy = extract %s, 1
  
  %pop_threshold = const 100.0
  %energy_threshold = const 50.0
  %low_pop_threshold = const 50.0
  
  %pop_high = gt %pop, %pop_threshold
  %energy_high = gt %energy, %energy_threshold
  %cond1 = and %pop_high, %energy_high
  
  br %cond1, label %case1, label %check_case2

check_case2:
  %pop_low = lt %pop, %low_pop_threshold
  br %pop_low, label %case2, label %case3

case1:
  %rate1 = const 0.05
  jmp label %merge

case2:
  %rate2 = const 0.2
  jmp label %merge

case3:
  %rate3 = const 0.1
  jmp label %merge

merge:
  %final_rate = phi [%rate1, %case1], [%rate2, %case2], [%rate3, %case3]
  %new_state = insert %s, 2, %final_rate
  ret %new_state
}
```

---

### Example 4: Function Calls

**Ourocode:**
```
@module with_functions
@version 1.0
@source algol

%state = type { f64, f64, f64 }

define @calculate_rate(%pop: f64, %energy: f64) -> f64 {
entry:
  %sum = add %pop, %energy
  %divisor = const 100.0
  %rate = div %sum, %divisor
  ret %rate
}

define @mutate(%s: %state) -> %state {
entry:
  %pop = extract %s, 0
  %energy = extract %s, 1
  
  %rate = call @calculate_rate(%pop, %energy)
  %new_state = insert %s, 2, %rate
  ret %new_state
}
```

---

## Validation Rules

### Syntax Rules

1. **Module header required**: Must start with `@module`, `@version`, `@source`
2. **Type definitions before functions**: All types must be defined before use
3. **Function signature**: Must specify parameter types and return type
4. **Block structure**: Functions must contain at least one block named `entry`
5. **Terminator required**: Each block must end with `br`, `jmp`, or `ret`

### Semantic Rules

1. **Type consistency**: Operations must use compatible types
2. **Variable definition**: Variables must be defined before use
3. **Block references**: All referenced blocks must exist
4. **PHI predecessors**: PHI nodes must reference valid predecessor blocks
5. **Return type**: Return value must match function return type
6. **No infinite loops**: All loops must have termination conditions

### Safety Rules

1. **Bounded execution**: Maximum instruction count (default: 100,000)
2. **Memory limits**: Maximum memory allocation (default: 10MB)
3. **Timeout**: Maximum execution time (default: 1 second)
4. **No external calls**: Cannot call external functions (except whitelisted)
5. **No I/O operations**: Cannot perform file or network I/O

---

## Validation Algorithm

```javascript
function validate(module) {
  // 1. Check module header
  if (!module.name || !module.version || !module.source) {
    return { valid: false, error: 'Missing module header' };
  }
  
  // 2. Check type definitions
  for (const [name, type] of module.types) {
    if (!isValidType(type)) {
      return { valid: false, error: `Invalid type: ${name}` };
    }
  }
  
  // 3. Check functions
  for (const [name, func] of module.functions) {
    // Check entry block exists
    if (!func.blocks.has('entry')) {
      return { valid: false, error: `Function ${name} missing entry block` };
    }
    
    // Check all blocks
    for (const [label, block] of func.blocks) {
      // Check terminator
      const lastInstr = block.instructions[block.instructions.length - 1];
      if (!isTerminator(lastInstr)) {
        return { valid: false, error: `Block ${label} missing terminator` };
      }
      
      // Check all instructions
      for (const instr of block.instructions) {
        if (!isValidInstruction(instr, func)) {
          return { valid: false, error: `Invalid instruction in ${label}` };
        }
      }
    }
  }
  
  return { valid: true };
}
```

---

## Execution Model

### Interpreter

Ourocode can be interpreted directly:

```javascript
class OurocodeInterpreter {
  execute(module, functionName, args) {
    const func = module.functions.get(functionName);
    const env = new Map();
    
    // Bind parameters
    func.params.forEach((param, i) => {
      env.set(param.name, args[i]);
    });
    
    // Execute blocks
    let currentBlock = 'entry';
    while (currentBlock) {
      const block = func.blocks.get(currentBlock);
      currentBlock = this.executeBlock(block, env);
    }
    
    return env.get('__return__');
  }
  
  executeBlock(block, env) {
    for (const instr of block.instructions) {
      const result = this.executeInstruction(instr, env);
      if (result.type === 'branch') {
        return result.target;
      } else if (result.type === 'return') {
        env.set('__return__', result.value);
        return null;
      }
    }
  }
}
```

### JIT Compilation

For performance, Ourocode can be JIT-compiled to WebAssembly:

```javascript
class OurocodeJIT {
  compile(module) {
    const wasmModule = new WebAssembly.Module(
      this.generateWASM(module)
    );
    return new WebAssembly.Instance(wasmModule);
  }
  
  generateWASM(module) {
    // Convert Ourocode to WASM bytecode
    // ...
  }
}
```

---

## Hashing

Ourocode modules are hashed for blockchain storage:

```javascript
async function hashOurocode(module) {
  const serialized = serializeOurocode(module);
  const encoder = new TextEncoder();
  const data = encoder.encode(serialized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

---

## Future Extensions

Potential future additions to Ourocode:

1. **Vector operations**: SIMD instructions for parallel computation
2. **Memory management**: Explicit allocation and deallocation
3. **Exception handling**: Try-catch blocks
4. **Concurrency**: Parallel execution primitives
5. **Optimization hints**: Annotations for JIT compiler

---

## See Also

- [Meta-Compiler Implementation](../src/metacompiler/meta-compiler.js)
- [Ourocode Executor](../src/metacompiler/ourocode-executor.js)
- [Validation Tests](../tests/ourocode-validation.test.js)
- [Architecture Overview](ARCHITECTURE.md)
