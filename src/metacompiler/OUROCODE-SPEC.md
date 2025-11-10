# Ourocode Specification

## Overview

Ourocode is a symbolic intermediate representation (IR) designed to unify multiple programming languages into a single executable format for the OuroborOS-Chimera organism. It serves as a compilation target for ALGOL, Lisp, Pascal, Rust, Go, and Fortran, enabling polyglot organism rules.

## Design Philosophy

- **Language-Agnostic**: Ourocode abstracts away language-specific details while preserving semantic meaning
- **SSA Form**: Uses Static Single Assignment for clear data flow
- **Type-Safe**: Explicit type system prevents runtime errors
- **Verifiable**: Syntax and semantic rules can be validated before execution
- **Blockchain-Ready**: Deterministic serialization for on-chain validation

## Module Structure

```
@module <name>
@version <version>
@source <language>

; Type definitions
%type_name = type { field1: type, field2: type, ... }

; Function definitions
define @function_name(%param1: %type, ...) -> %return_type {
  label:
    instruction1
    instruction2
    ...
}
```

## Type System

### Primitive Types

- `f64` - 64-bit floating point number
- `i32` - 32-bit signed integer
- `bool` - Boolean value (true/false)

### Composite Types

- `struct` - Structure with named fields
  ```
  %state = type { f64, f64, f64 }
  ```

- `array` - Fixed-size array (future)
  ```
  %vector = type [10 x f64]
  ```

## Instruction Set

### Constants

**CONST** - Load constant value
```
%dest = const <value>
```
Example:
```
%rate = const 0.05
%threshold = const 100.0
```

### Struct Operations

**EXTRACT** - Extract field from struct
```
%dest = extract %struct, <index>
```
Example:
```
%pop = extract %state, 0      ; Get population (field 0)
%energy = extract %state, 1   ; Get energy (field 1)
```

**INSERT** - Insert value into struct field (creates new struct)
```
%dest = insert %struct, <index>, %value
```
Example:
```
%new_state = insert %state, 2, %new_rate  ; Update mutation_rate (field 2)
```

### Arithmetic Operations

**ADD, SUB, MUL, DIV** - Binary arithmetic
```
%dest = <op> %left, %right
```
Example:
```
%sum = add %a, %b
%product = mul %x, 2.0
%ratio = div %energy, %population
```

### Comparison Operations

**GT, LT, EQ, GE, LE, NE** - Comparison operators
```
%dest = <op> %left, %right
```
Example:
```
%is_high = gt %population, 100.0
%is_low = lt %energy, 20.0
%is_equal = eq %a, %b
```

### Control Flow

**BR** - Branch (conditional or unconditional)
```
br %cond, label %true_target, label %false_target  ; Conditional
br label %target                                    ; Unconditional
```
Example:
```
br %is_high, label %high_pop, label %low_pop
br label %merge
```

**PHI** - SSA phi node (merge values from different paths)
```
%dest = phi [%value1, %label1], [%value2, %label2], ...
```
Example:
```
%final_rate = phi [%rate1, %high_pop], [%rate2, %low_pop]
```

**RET** - Return from function
```
ret %value
```
Example:
```
ret %new_state
```

### Function Calls

**CALL** - Call function
```
%dest = call @function(%arg1, %arg2, ...)
```
Example:
```
%result = call @helper(%x, %y)
```

## Complete Example

Here's a complete Ourocode module that implements a simple mutation rule:

```ourocode
@module organism_rules
@version 1.0
@source algol

; Type definition for organism state
%state = type { f64, f64, f64 }  ; population, energy, mutation_rate

; Mutation rule function
define @mutate_rule(%s: %state) -> %state {
entry:
  ; Extract current state values
  %pop = extract %s, 0
  %energy = extract %s, 1
  %rate = extract %s, 2
  
  ; Check if population is high
  %is_high = gt %pop, 100.0
  br %is_high, label %high_pop, label %low_pop

high_pop:
  ; High population: reduce mutation rate
  %new_rate1 = const 0.05
  br label %merge

low_pop:
  ; Low population: increase mutation rate
  %new_rate2 = const 0.1
  br label %merge

merge:
  ; Merge the two possible rates
  %final_rate = phi [%new_rate1, %high_pop], [%new_rate2, %low_pop]
  
  ; Create new state with updated mutation rate
  %new_state = insert %s, 2, %final_rate
  ret %new_state
}
```

## Validation Rules

### Syntax Rules

1. All variable names must start with `%`
2. All function names must start with `@`
3. All type names must start with `%`
4. Labels must be valid identifiers
5. Instructions must be properly formatted

### Semantic Rules

1. **SSA Property**: Each variable must be assigned exactly once
2. **Type Consistency**: Operations must use compatible types
3. **Label Existence**: All branch targets must exist
4. **Phi Correctness**: Phi nodes must have one incoming value per predecessor block
5. **Terminator**: Each block must end with a terminator (br or ret)
6. **No Undefined Variables**: All variables must be defined before use

### Security Rules

1. **Execution Limits**: Maximum instruction count to prevent infinite loops
2. **Memory Limits**: Maximum memory allocation
3. **Timeout**: Maximum execution time
4. **No External Calls**: Only predefined functions can be called

## Compilation from Source Languages

### From ALGOL

ALGOL code:
```algol
IF population > 100 THEN
  mutation_rate := 0.05
ELSE
  mutation_rate := 0.1
```

Compiles to Ourocode:
```ourocode
%pop = extract %state, 0
%is_high = gt %pop, 100.0
br %is_high, label %then, label %else

then:
  %rate1 = const 0.05
  br label %merge

else:
  %rate2 = const 0.1
  br label %merge

merge:
  %final_rate = phi [%rate1, %then], [%rate2, %else]
  %new_state = insert %state, 2, %final_rate
  ret %new_state
```

### From Lisp

Lisp code:
```lisp
(if (> population 100)
    (set! mutation_rate 0.05)
    (set! mutation_rate 0.1))
```

Compiles to the same Ourocode as above.

## Serialization Format

Ourocode modules are serialized to text format for:
- Blockchain storage and validation
- Human readability
- Deterministic hashing

The serialization format follows the syntax shown in examples above, with:
- Consistent indentation (2 spaces)
- One instruction per line
- Comments preserved with `;` prefix

## Hashing for Blockchain

To generate a deterministic hash for blockchain validation:

1. Serialize the Ourocode module to text
2. Normalize whitespace (consistent indentation)
3. Compute SHA-256 hash of the text
4. Return hex-encoded hash

This hash is stored on-chain to verify that executed code matches approved proposals.

## Future Extensions

Planned extensions to Ourocode:

1. **Array Operations**: Support for fixed-size arrays
2. **Floating Point Math**: sin, cos, sqrt, etc.
3. **Memory Operations**: load, store for heap allocation
4. **Aggregate Types**: Nested structs and unions
5. **Function Pointers**: First-class functions
6. **Optimization Passes**: Dead code elimination, constant folding

## Implementation Notes

The Ourocode system consists of:

1. **Type Definitions** (`ourocode-types.js`) - Data structures for IR
2. **Meta-Compiler** (`meta-compiler.js`) - Compiles source languages to Ourocode
3. **Validator** (`ourocode-validator.js`) - Validates syntax and semantics
4. **Executor** (`ourocode-executor.js`) - Interprets or JIT-compiles Ourocode
5. **Serializer** (`ourocode-serializer.js`) - Text serialization and hashing

## References

- LLVM IR: https://llvm.org/docs/LangRef.html
- SSA Form: https://en.wikipedia.org/wiki/Static_single_assignment_form
- WebAssembly: https://webassembly.org/docs/semantics/
