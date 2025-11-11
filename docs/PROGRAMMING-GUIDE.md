# ChimeraOS Programming Guide

## Overview

ChimeraOS now provides a full programming environment with:
- **Direct Lisp REPL** - Interactive Lisp programming
- **ALGOL Compiler** - Compile and run ALGOL programs
- **Virtual Filesystem** - Store and manage programs
- **WASM Integration** - Call Rust, Fortran, Go, Pascal modules
- **Script Execution** - Run multi-line programs
- **Environment Management** - Define variables and functions

## Quick Start

### Enter Lisp REPL Mode

```
> lisp
lisp> (+ 1 2 3)
6
lisp> (def square (lambda (x) (* x x)))
<function>
lisp> (square 5)
25
lisp> (exit)
```

### Execute Lisp Expressions

```
> eval (+ 10 20)
30
> eval (list 1 2 3 4 5)
(1 2 3 4 5)
```

### Write and Run Programs

```
> write /programs/hello.lisp (def greet (lambda (name) (list "Hello" name)))
File written: /programs/hello.lisp

> run /programs/hello.lisp
<function>

> eval (greet "World")
("Hello" "World")
```

### Multiline Scripts

```
> script lisp
Entering multiline lisp mode
Type END on a line by itself to execute
Type CANCEL to abort

... (def factorial (lambda (n)
...   (if (<= n 1)
...     1
...     (* n (factorial (- n 1))))))
... 
... (factorial 5)
... END

120
```

## Filesystem Commands

### Navigation

```
> pwd                    # Print working directory
/

> ls                     # List files
DIR         -  programs/
DIR         -  data/
DIR         -  scripts/
FILE      123B  README.txt

> cd /programs           # Change directory
> pwd
/programs

> cd ..                  # Go up one level
```

### File Operations

```
> cat README.txt         # Display file contents
Welcome to ChimeraOS...

> write test.txt Hello World    # Write to file
File written: test.txt

> edit myprogram.lisp    # Edit file (multiline)
Enter content (type END to save):
... (def hello () "Hello!")
... END
File saved: myprogram.lisp

> rm test.txt            # Remove file
Deleted: test.txt

> mkdir /mydir           # Create directory
Directory created: /mydir
```

### Search

```
> find \.lisp$           # Find files by pattern
Found 3 file(s):
  /programs/hello.lisp
  /programs/evolve.lisp
  /myprogram.lisp

> grep lambda            # Search in all files
Found 5 match(es):
/programs/hello.lisp:1: (def greet (lambda (name)
/programs/evolve.lisp:3: (def boost (lambda (x)
```

## Programming in Lisp

### Basic Syntax

```lisp
; Comments start with semicolon

; Define variables
(def x 10)
(def name "ChimeraOS")

; Define functions
(def add (lambda (a b) (+ a b)))
(def square (lambda (x) (* x x)))

; Call functions
(add 5 3)        ; => 8
(square 4)       ; => 16

; Conditionals
(if (> x 5)
  "greater"
  "less or equal")

; Lists
(list 1 2 3 4)
(car (list 1 2 3))    ; => 1
(cdr (list 1 2 3))    ; => (2 3)
(cons 0 (list 1 2))   ; => (0 1 2)

; Let bindings
(let ((x 10) (y 20))
  (+ x y))            ; => 30

; Sequential execution
(begin
  (def x 5)
  (def y 10)
  (+ x y))            ; => 15
```

### Built-in Functions

**Arithmetic:** `+`, `-`, `*`, `/`
**Comparison:** `<`, `>`, `=`, `<=`, `>=`
**List:** `car`, `cdr`, `cons`, `list`, `length`, `null?`
**Boolean:** `not`, `and`, `or`
**Type:** `number?`, `string?`, `list?`, `procedure?`

### Special Forms

- `def` - Define variable
- `lambda` - Create function
- `if` - Conditional
- `let` - Local bindings
- `set!` - Update variable
- `begin` - Sequential execution
- `quote` - Prevent evaluation

## Programming in ALGOL

### Enter ALGOL REPL

```
> algol
algol> BEGIN REAL x := 10.0; x * 2 END
20.0
algol> EXIT
```

### Compile ALGOL to Lisp

```
> compile /programs/test.algol
Compilation successful!

Generated Lisp:
(begin (def x 10.0) (* x 2))

Saved to: /programs/test.lisp
```

### ALGOL Syntax

```algol
BEGIN
  COMMENT This is a comment;
  
  REAL x, y, z;
  INTEGER count;
  
  x := 10.0;
  y := 20.0;
  z := x + y;
  
  count := 5;
  
  IF x > y THEN
    z := x
  ELSE
    z := y;
    
  z
END
```

## WASM Module Integration

### Call Rust Functions

```
> rust calculate 10 20
Result: 30

> eval (call-wasm "rust" "calculate" 10 20)
30
```

### Call Fortran Functions

```
> fortran matrix_multiply 2.0 3.0
Result: 6.0
```

### Interact with Go Neural Clusters

```
> go list
Active clusters:
  - main
  - secondary

> go create my-cluster
Cluster created: my-cluster

> go decide main
Decision: evolve
```

## Environment Management

### Define Variables

```
> set x 42
Set x = 42

> get x
x = 42

> eval (+ x 10)
52
```

### List Functions

```
> functions
User-defined functions:
  square
  factorial
  greet
```

### View Environment

```
> env
Lisp Environment:

Built-in functions:
  Arithmetic: +, -, *, /
  Comparison: <, >, =, <=, >=
  List: car, cdr, cons, list, length, null?
  Boolean: not, and, or
  Type: number?, string?, list?, procedure?
  Bridge: call-js, call-wasm

Special forms:
  def, lambda, if, let, set!, begin, quote
```

## Advanced Examples

### Recursive Fibonacci

```lisp
(def fib (lambda (n)
  (if (<= n 1)
    n
    (+ (fib (- n 1)) (fib (- n 2))))))

(fib 10)  ; => 55
```

### List Processing

```lisp
(def map (lambda (f lst)
  (if (null? lst)
    (list)
    (cons (f (car lst)) (map f (cdr lst))))))

(def double (lambda (x) (* x 2)))

(map double (list 1 2 3 4 5))
; => (2 4 6 8 10)
```

### Organism Control

```lisp
; Boost organism energy
(call-js "update-state" (list "energy" 100))

; Adjust mutation rate
(call-js "update-state" (list "mutationRate" 0.05))

; Evolve organism
(call-js "evolve" 10)
```

### WASM Integration

```lisp
; Call Rust function
(call-wasm "rust" "calculate" 10 20)

; Call Fortran function
(call-wasm "fortran" "matrix_op" 2.0 3.0)

; Call Go cluster
(call-wasm "go" "decide" "main")
```

## Command Reference

### REPL & Execution
- `lisp` - Enter Lisp REPL mode
- `algol` - Enter ALGOL REPL mode
- `eval <expr>` - Evaluate Lisp expression
- `script <lang>` - Enter multiline script mode
- `run <file>` - Execute a program file
- `compile <file>` - Compile ALGOL to Lisp

### Filesystem
- `ls [path]` - List directory contents
- `cd <path>` - Change directory
- `pwd` - Print working directory
- `cat <file>` - Display file contents
- `write <file> ...` - Write to file
- `edit <file>` - Edit file (multiline)
- `rm <file>` - Remove file
- `mkdir <dir>` - Create directory
- `find <pattern>` - Find files by pattern
- `grep <pattern>` - Search in files

### WASM Modules
- `rust <func> ...` - Call Rust function
- `fortran <func> ...` - Call Fortran function
- `go <cmd> ...` - Interact with Go clusters
- `pascal` - Pascal terminal info

### Environment
- `env` - Show environment info
- `set <name> <val>` - Define variable
- `get <name>` - Get variable value
- `functions` - List user functions

### Help
- `help` - Show basic commands
- `help-extended` - Show programming commands

## Tips & Tricks

1. **Use the filesystem** - Store your programs for reuse
2. **Start with REPL** - Test expressions interactively
3. **Build incrementally** - Define functions one at a time
4. **Use multiline mode** - For complex programs
5. **Explore examples** - Check `/programs` directory
6. **Call WASM** - Leverage compiled modules for performance
7. **Save your work** - Use `write` to persist programs

## Next Steps

- Explore example programs in `/programs`
- Write your own Lisp functions
- Compile ALGOL programs
- Interact with WASM modules
- Control the organism through code
- Build complex behaviors

Happy coding in ChimeraOS!
