# ALGOL DSL Compiler

A compiler that translates ALGOL-like syntax to Lisp s-expressions for the OuroborOS-Chimera organism simulation.

## Overview

The ALGOL DSL provides a readable, imperative syntax for defining organism behavior rules that compile to executable Lisp code. This allows users to write mutation rules in a familiar ALGOL-style language while leveraging the power of Lisp's self-modifying capabilities.

## Architecture

The compiler consists of three main phases:

1. **Lexer** (`lexer.js`): Tokenizes ALGOL source code with line/column tracking
2. **Parser** (`parser.js`): Builds an Abstract Syntax Tree (AST) using recursive descent parsing
3. **Code Generator** (`codegen.js`): Converts AST to Lisp s-expressions

## Supported Syntax

### Keywords

- `IF`, `THEN`, `ELSE` - Conditional statements
- `WHILE`, `DO` - Loop statements
- `BEGIN`, `END` - Block statements

### Operators

- Arithmetic: `+`, `-`, `*`, `/`
- Comparison: `<`, `>`, `<=`, `>=`, `=`, `<>`
- Assignment: `:=`

### Literals

- Numbers: `42`, `3.14`, `0.05`
- Identifiers: `population`, `mutation_rate`, `energy`

### Comments

- Line comments: `// comment`
- Block comments: `/* comment */`

## Grammar

```ebnf
program     ::= statement+
statement   ::= assignment | conditional | loop | block
assignment  ::= identifier ":=" expression
conditional ::= "IF" expression "THEN" statement ("ELSE" statement)?
loop        ::= "WHILE" expression "DO" statement
block       ::= "BEGIN" statement* "END"
expression  ::= comparison
comparison  ::= term (("<" | ">" | "<=" | ">=" | "=" | "<>") term)*
term        ::= factor (("+"|"-") factor)*
factor      ::= unary (("*"|"/") unary)*
unary       ::= ("-") unary | primary
primary     ::= number | identifier | "(" expression ")"
```

## Usage

### Basic Compilation

```javascript
import { ALGOLCompiler } from './compiler.js';

const compiler = new ALGOLCompiler();

const algolCode = `
IF population > 100 THEN
  mutation_rate := 0.05
ELSE
  mutation_rate := 0.1
`;

const result = compiler.compile(algolCode);

if (result.success) {
  console.log('Compiled Lisp:', result.lisp);
  // Output: (if (> population 100) (set! mutation_rate 0.05) (set! mutation_rate 0.1))
} else {
  console.log('Errors:', result.errors);
}
```

### With Comments

```javascript
const result = compiler.compile(algolCode, true); // Include source as comments
```

### Error Handling

```javascript
const result = compiler.compile(invalidCode);

if (!result.success) {
  // Format errors with source context
  const formatted = compiler.formatErrors(result.errors, invalidCode);
  console.log(formatted);
}
```

## Examples

### Simple Assignment

**ALGOL:**
```algol
mutation_rate := 0.05
```

**Lisp:**
```lisp
(set! mutation_rate 0.05)
```

### Conditional

**ALGOL:**
```algol
IF population > 100 THEN
  mutation_rate := 0.05
ELSE
  mutation_rate := 0.1
```

**Lisp:**
```lisp
(if (> population 100)
  (set! mutation_rate 0.05)
  (set! mutation_rate 0.1))
```

### While Loop

**ALGOL:**
```algol
WHILE energy > 0 DO
  energy := energy - 1
```

**Lisp:**
```lisp
(while (> energy 0)
  (set! energy (- energy 1)))
```

### Block Statement

**ALGOL:**
```algol
BEGIN
  population := 100;
  energy := 50;
  mutation_rate := 0.05
END
```

**Lisp:**
```lisp
(begin
  (set! population 100)
  (set! energy 50)
  (set! mutation_rate 0.05))
```

### Complex Nested Structure

**ALGOL:**
```algol
IF energy > 50 THEN
  BEGIN
    population := population + 10;
    mutation_rate := 0.01
  END
ELSE
  BEGIN
    population := population - 5;
    mutation_rate := 0.1
  END
```

**Lisp:**
```lisp
(if (> energy 50)
  (begin
    (set! population (+ population 10))
    (set! mutation_rate 0.01))
  (begin
    (set! population (- population 5))
    (set! mutation_rate 0.1)))
```

## Error Reporting

The compiler provides detailed error messages with line and column information:

```
parser error at line 1, column 25: Expected 'THEN' after IF condition
  IF population > 100 mutation_rate := 0.05
                          ^
```

## Integration with Terminal

The compiler is integrated with the terminal through the `mutate` command:

```
> mutate IF population > 100 THEN mutation_rate := 0.05
Compiling and applying mutation...
Compilation successful
Generated Lisp: (if (> population 100) (set! mutation_rate 0.05) (begin))
Mutation applied successfully
```

## API Reference

### ALGOLCompiler

#### `compile(source, includeComments = false)`

Compiles ALGOL source code to Lisp.

**Parameters:**
- `source` (string): ALGOL source code
- `includeComments` (boolean): Include source as comments in output

**Returns:** `CompileResult`
- `success` (boolean): Whether compilation succeeded
- `lisp` (string|null): Generated Lisp code
- `errors` (CompileError[]): Array of compilation errors

#### `formatErrors(errors, source)`

Formats error messages with source context.

**Parameters:**
- `errors` (CompileError[]): Array of errors
- `source` (string): Original source code

**Returns:** `string` - Formatted error messages

### CompileError

Error object with location information.

**Properties:**
- `message` (string): Error description
- `line` (number): Line number (1-indexed)
- `column` (number): Column number (1-indexed)
- `phase` (string): Compilation phase ('lexer', 'parser', or 'codegen')

## Testing

Run the example file to see compilation in action:

```bash
node src/algol/example.js
```

## Requirements Satisfied

- **5.1**: ALGOL DSL supports syntax for conditionals, assignments, and loops
- **5.2**: ALGOL DSL compiles to valid Lisp s-expressions
- **5.3**: Compiler integrates with terminal via `mutate` command
- **5.4**: Clear error messages with line and column information
- **5.5**: Generated Lisp code is human-readable with proper formatting

## Future Enhancements

- Support for function definitions
- Array/list operations
- More complex expressions (boolean operators, etc.)
- Optimization passes on generated Lisp code
- Source maps for debugging
