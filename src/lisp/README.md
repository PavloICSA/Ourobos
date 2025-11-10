# Lisp Interpreter

A minimal, sandboxed Lisp interpreter for OuroborOS-Chimera with self-modification capabilities.

## Features

- **S-expression Parser**: Tokenizes and parses Lisp syntax with error reporting
- **Core Forms**: `def`, `lambda`, `if`, `let`, `set!`, `begin`, `quote`
- **Arithmetic**: `+`, `-`, `*`, `/`, `<`, `>`, `=`, `<=`, `>=`
- **List Operations**: `car`, `cdr`, `cons`, `list`, `length`, `null?`
- **Lexical Scoping**: Environment-based variable bindings with scope chaining
- **Sandboxing**: Isolated execution without access to global JavaScript scope
- **Execution Limits**: Operation counting and timeout enforcement
- **Bridge Primitives**: `call-js` and `call-wasm` for interop

## Usage

```javascript
import { LispInterpreter } from './interpreter.js';

// Create interpreter with options
const interp = new LispInterpreter({
  maxOperations: 10000,  // Max operations before error
  timeout: 100           // Max execution time (ms)
});

// Evaluate Lisp code
const result = interp.eval('(+ 1 2 3)'); // 6

// Define variables
interp.eval('(def x 42)');

// Define functions
interp.eval('(def square (lambda (x) (* x x)))');
console.log(interp.eval('(square 5)')); // 25

// Register JavaScript bridge functions
interp.registerJSFunction('log', console.log);
interp.eval('(call-js "log" "Hello from Lisp!")');

// Register WASM modules
interp.registerWASMModule('rust', rustModule);
interp.eval('(call-wasm "rust" "compute" 1.0 2.0)');
```

## Core Forms

### def
Define a variable in the current scope:
```lisp
(def x 42)
(def square (lambda (x) (* x x)))
```

### lambda
Create an anonymous function:
```lisp
(lambda (x y) (+ x y))
```

### if
Conditional expression:
```lisp
(if (> x 10) "big" "small")
```

### let
Create local bindings:
```lisp
(let ((a 10) (b 20))
  (+ a b))
```

### set!
Modify an existing variable:
```lisp
(def x 10)
(set! x 20)
```

### begin
Execute multiple expressions, return last result:
```lisp
(begin
  (def x 10)
  (def y 20)
  (+ x y))
```

### quote
Return expression without evaluation:
```lisp
(quote (1 2 3)) ; Returns the list [1, 2, 3]
```

## Built-in Functions

### Arithmetic
- `(+ a b ...)` - Addition
- `(- a b ...)` - Subtraction
- `(* a b ...)` - Multiplication
- `(/ a b ...)` - Division

### Comparison
- `(< a b)` - Less than
- `(> a b)` - Greater than
- `(= a b)` - Equal
- `(<= a b)` - Less than or equal
- `(>= a b)` - Greater than or equal

### List Operations
- `(car list)` - First element
- `(cdr list)` - Rest of list
- `(cons item list)` - Prepend item
- `(list a b ...)` - Create list
- `(length list)` - List length
- `(null? list)` - Check if empty

### Type Predicates
- `(number? x)` - Check if number
- `(string? x)` - Check if string
- `(list? x)` - Check if list
- `(procedure? x)` - Check if function

### Boolean Operations
- `(not x)` - Logical NOT
- `(and a b ...)` - Logical AND
- `(or a b ...)` - Logical OR

## Bridge Functions

### call-js
Call a registered JavaScript function:
```lisp
(call-js "function-name" arg1 arg2 ...)
```

Functions must be registered and whitelisted:
```javascript
interp.registerJSFunction('get-entropy', (bits) => {
  return crypto.getRandomValues(new Uint8Array(bits / 8));
});
```

### call-wasm
Call a WASM module function:
```lisp
(call-wasm "module-name" "function-name" arg1 arg2 ...)
```

Modules must be registered:
```javascript
interp.registerWASMModule('fortran', fortranModule);
```

## Sandboxing

The interpreter runs in a sandboxed environment:

- No access to global JavaScript scope
- No `eval()` or `Function()` constructor
- Operation counting prevents infinite loops
- Timeout mechanism prevents long-running code
- Whitelist validation for JavaScript bridge calls

## Error Handling

The interpreter provides detailed error messages:

```javascript
try {
  interp.eval('(undefined-function 1 2 3)');
} catch (error) {
  console.error(error.message);
  // "Undefined variable: undefined-function"
}
```

Parse errors include line and column information:
```javascript
try {
  interp.eval('(+ 1 2');
} catch (error) {
  console.error(error.message);
  // "Parse error at line 1, column 1: Unexpected end of input, expected )"
}
```

## Self-Modification

The interpreter supports self-modifying code:

```lisp
(begin
  ; Define initial behavior
  (def mutate-rate 0.1)
  
  ; Define function that modifies itself
  (def evolve (lambda (energy)
    (if (> energy 50)
      (set! mutate-rate 0.2)  ; High energy = more mutation
      (set! mutate-rate 0.05)))) ; Low energy = less mutation
  
  ; Organism can redefine its own rules
  (evolve 100))
```

## Performance

- Parser: ~200 lines, minimal overhead
- Evaluator: Tail-call optimization for recursion
- Operation counting: <1% overhead
- Typical evaluation: <1ms for simple expressions

## Architecture

```
┌─────────────────────────────────────┐
│         LispInterpreter             │
│  ┌───────────┐  ┌────────────────┐  │
│  │  Parser   │→ │   Evaluator    │  │
│  └───────────┘  └────────────────┘  │
│                        ↓             │
│  ┌─────────────────────────────────┐│
│  │      Environment (Scoping)      ││
│  └─────────────────────────────────┘│
│                        ↓             │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ JS Bridge│  │   WASM Bridge    │ │
│  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────┘
```

## Files

- `parser.js` - S-expression tokenizer and parser
- `interpreter.js` - Core evaluator and environment
- `example.js` - Usage examples
- `README.md` - This file
