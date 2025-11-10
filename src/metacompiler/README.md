# Meta-Compiler and Ourocode System

## Overview

The Meta-Compiler is a unified compilation system that translates multiple programming languages into **Ourocode**, a symbolic intermediate representation designed for the OuroborOS-Chimera organism. This enables polyglot organism rules that can be written in ALGOL, Lisp, Pascal, Rust, Go, or Fortran, all executing in a single runtime.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Source Languages                          │
│  ALGOL  │  Lisp  │  Pascal  │  Rust  │  Go  │  Fortran     │
└────┬─────────┬─────────┬────────┬───────┬────────┬──────────┘
     │         │         │        │       │        │
     └─────────┴─────────┴────────┴───────┴────────┘
                         │
                    ┌────▼────┐
                    │  Meta-  │
                    │Compiler │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │Ourocode │  ◄── Intermediate Representation
                    │  (IR)   │
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼────┐ ┌──▼───┐ ┌───▼────┐
         │Validator│ │Serial│ │Executor│
         │         │ │-izer │ │        │
         └─────────┘ └──────┘ └────────┘
                         │
                    ┌────▼────┐
                    │Blockchain│
                    │Validation│
                    └──────────┘
```

## Components

### 1. Ourocode Types (`ourocode-types.js`)

Defines the data structures for the Ourocode intermediate representation:

- **OurocodeModule**: Top-level container for compiled code
- **OurocodeFunction**: Function with parameters and basic blocks
- **OurocodeBlock**: Sequence of instructions with a label
- **Instructions**: const, extract, insert, binary ops, branches, phi, return

### 2. Meta-Compiler (`meta-compiler.js`)

Compiles source languages to Ourocode:

```javascript
import { MetaCompiler } from './meta-compiler.js';

const compiler = new MetaCompiler();

// Compile ALGOL
const module = compiler.compile(algolSource, 'algol');

// Compile Lisp
const module = compiler.compile(lispSource, 'lisp');

// Serialize to text
const text = compiler.serialize(module);

// Generate hash for blockchain
const hash = await compiler.hash(module);

// Validate syntax and semantics
const isValid = compiler.validate(module);
```

### 3. Ourocode Executor (`ourocode-executor.js`)

Interprets and executes Ourocode:

```javascript
import { OurocodeExecutor, createOrganismState } from './ourocode-executor.js';

const executor = new OurocodeExecutor({
  maxInstructions: 100000,  // Prevent infinite loops
  timeout: 1000,            // 1 second timeout
  maxMemory: 10 * 1024 * 1024  // 10MB limit
});

// Load compiled module
executor.loadModule(module);

// Execute function
const state = createOrganismState(100, 50, 0.1);
const result = executor.execute('organism_rules', '@mutate_rule', [state]);

// Get execution statistics
const stats = executor.getStats();
```

## Supported Languages

### ALGOL (Fully Implemented)

```algol
IF population > 100 THEN
  mutation_rate := 0.05
ELSE
  mutation_rate := 0.1
```

Features:
- ✅ Conditionals (IF-THEN-ELSE)
- ✅ Loops (WHILE-DO)
- ✅ Blocks (BEGIN-END)
- ✅ Assignments (:=)
- ✅ Arithmetic (+, -, *, /)
- ✅ Comparisons (>, <, =, >=, <=, <>)

### Lisp (Fully Implemented)

```lisp
(if (> population 100)
    (set! mutation_rate 0.05)
    (set! mutation_rate 0.1))
```

Features:
- ✅ S-expressions
- ✅ Conditionals (if)
- ✅ Assignments (set!)
- ✅ Arithmetic and comparison operators

### Pascal (Stub)

```pascal
if population > 100 then
  mutation_rate := 0.05
else
  mutation_rate := 0.1;
```

Status: Stub implementation, throws "not yet implemented"

### Rust (Stub)

```rust
if population > 100.0 {
    mutation_rate = 0.05;
} else {
    mutation_rate = 0.1;
}
```

Status: Stub implementation, throws "not yet implemented"

### Go (Stub)

```go
if population > 100 {
    mutationRate = 0.05
} else {
    mutationRate = 0.1
}
```

Status: Stub implementation, throws "not yet implemented"

### Fortran (Stub)

```fortran
IF (POPULATION .GT. 100) THEN
    MUTATION_RATE = 0.05
ELSE
    MUTATION_RATE = 0.1
END IF
```

Status: Stub implementation, throws "not yet implemented"

## Ourocode Instruction Set

### Constants
```
%dest = const <value>
```

### Struct Operations
```
%dest = extract %struct, <index>
%dest = insert %struct, <index>, %value
```

### Arithmetic
```
%dest = add %left, %right
%dest = sub %left, %right
%dest = mul %left, %right
%dest = div %left, %right
```

### Comparisons
```
%dest = gt %left, %right   ; Greater than
%dest = lt %left, %right   ; Less than
%dest = eq %left, %right   ; Equal
%dest = ge %left, %right   ; Greater or equal
%dest = le %left, %right   ; Less or equal
%dest = ne %left, %right   ; Not equal
```

### Control Flow
```
br %cond, label %true, label %false  ; Conditional branch
br label %target                      ; Unconditional branch
%dest = phi [%val1, %label1], [%val2, %label2]  ; SSA phi node
ret %value                            ; Return
```

## Example: Complete Workflow

```javascript
import { MetaCompiler } from './meta-compiler.js';
import { OurocodeExecutor, createOrganismState, extractStateFields } from './ourocode-executor.js';

// 1. Write organism rule in ALGOL
const source = `
IF population > 100 THEN
  mutation_rate := 0.05
ELSE
  mutation_rate := 0.1
`;

// 2. Compile to Ourocode
const compiler = new MetaCompiler();
const module = compiler.compile(source, 'algol');

// 3. Validate
if (!compiler.validate(module)) {
  throw new Error('Invalid Ourocode');
}

// 4. Generate hash for blockchain
const ourocodeHash = await compiler.hash(module);
console.log('Ourocode Hash:', ourocodeHash);

// 5. Serialize for storage
const serialized = compiler.serialize(module);
console.log('Serialized Ourocode:\n', serialized);

// 6. Execute
const executor = new OurocodeExecutor();
executor.loadModule(module);

const state = createOrganismState(150, 50, 0.2);
const result = executor.execute('organism_rules', '@mutate_rule', [state]);

console.log('Input:', extractStateFields(state));
console.log('Output:', extractStateFields(result));
// Output: { population: 150, energy: 50, mutationRate: 0.05 }
```

## Blockchain Integration

The Meta-Compiler is designed for blockchain governance:

1. **Compile** organism rule to Ourocode
2. **Hash** the Ourocode for on-chain validation
3. **Submit** proposal to DAO with Ourocode hash
4. **Vote** on proposal
5. **Execute** approved Ourocode
6. **Record** genome hash on blockchain

```javascript
// Generate hashes for blockchain proposal
const ourocodeHash = await compiler.hash(module);
const genomeHash = await generateGenomeHash(state, ourocodeHash);

// Submit to blockchain
await blockchainBridge.proposeMutation(genomeHash, ourocodeHash);

// After approval, execute
const result = executor.execute('organism_rules', '@mutate_rule', [state]);
```

## Security Features

### Execution Limits

```javascript
const executor = new OurocodeExecutor({
  maxInstructions: 100000,  // Prevent infinite loops
  timeout: 1000,            // 1 second max execution
  maxMemory: 10 * 1024 * 1024  // 10MB memory limit
});
```

### Validation Rules

- ✅ All variables must be defined before use
- ✅ All branch targets must exist
- ✅ All blocks must end with terminators (br or ret)
- ✅ Type consistency (no type errors)
- ✅ SSA property (single assignment)

### Sandboxing

- No external function calls (only predefined functions)
- No file system access
- No network access
- Deterministic execution for blockchain verification

## Performance

Typical performance metrics:

- **Compilation**: <10ms for simple rules
- **Validation**: <1ms
- **Hashing**: <5ms
- **Execution**: <1ms for 100 instructions

## Testing

Run the example file to test all features:

```bash
node src/metacompiler/example.js
```

Expected output:
- ALGOL compilation and execution
- Lisp compilation and execution
- Complex rule scenarios
- Arithmetic operations
- Execution limits
- Blockchain integration preview

## Future Extensions

Planned features:

1. **Pascal Compiler**: Full Pascal syntax support
2. **Rust Compiler**: Compile Rust to Ourocode
3. **Go Compiler**: Compile Go to Ourocode
4. **Fortran Compiler**: Compile Fortran to Ourocode
5. **Optimization Passes**: Dead code elimination, constant folding
6. **JIT Compilation**: Compile Ourocode to WebAssembly for faster execution
7. **Debugging**: Step-through execution, breakpoints
8. **Profiling**: Instruction-level performance analysis

## API Reference

### MetaCompiler

```javascript
class MetaCompiler {
  compile(source: string, language: string): OurocodeModule
  serialize(module: OurocodeModule): string
  hash(module: OurocodeModule): Promise<string>
  validate(module: OurocodeModule): boolean
}
```

### OurocodeExecutor

```javascript
class OurocodeExecutor {
  constructor(options?: {
    maxInstructions?: number,
    timeout?: number,
    maxMemory?: number
  })
  
  loadModule(module: OurocodeModule): void
  execute(moduleName: string, functionName: string, args: any[]): any
  getStats(): { instructionCount: number, elapsedTime: number, loadedModules: number }
  reset(): void
  clearModules(): void
}
```

### Helper Functions

```javascript
createOrganismState(population: number, energy: number, mutationRate: number): Array
extractStateFields(state: Array): { population: number, energy: number, mutationRate: number }
```

## Documentation

- [Ourocode Specification](./OUROCODE-SPEC.md) - Complete IR specification
- [Example Usage](./example.js) - Comprehensive examples
- [Type Definitions](./ourocode-types.js) - Data structure documentation

## Integration with OuroborOS-Chimera

The Meta-Compiler integrates with other Chimera components:

- **Blockchain Bridge**: Validates Ourocode on-chain
- **Quantum Entropy**: Seeds mutation randomness
- **Bio Sensors**: Influences mutation parameters
- **Go Neural Clusters**: Processes compiled rules
- **Visualization**: Displays compilation and execution

See the main Chimera orchestrator for complete integration.
