# ChimeraOS Quick Reference

## Getting Started

```bash
help              # Show basic commands
help-extended     # Show programming commands
status            # Check system status
```

## REPL Modes

```bash
lisp              # Enter Lisp REPL
algol             # Enter ALGOL REPL
eval (+ 1 2)      # Quick Lisp eval
script lisp       # Multiline Lisp
script algol      # Multiline ALGOL
```

## Filesystem

```bash
ls                # List files
cd /programs      # Change directory
pwd               # Current directory
cat file.lisp     # Read file
write file.txt Hello World
edit file.lisp    # Multiline editor
rm file.txt       # Delete file
mkdir /mydir      # Create directory
find \.lisp$      # Find files
grep pattern      # Search in files
```

## Program Execution

```bash
run /programs/hello.lisp      # Run Lisp program
run /programs/test.algol      # Run ALGOL program
compile test.algol            # Compile ALGOL to Lisp
```

## WASM Modules

```bash
rust calculate 10 20          # Call Rust
fortran matrix_op 2.0 3.0     # Call Fortran
go list                       # List Go clusters
go create my-cluster          # Create cluster
go decide main                # Get decision
```

## Environment

```bash
env               # Show environment
set x 42          # Define variable
get x             # Get variable
functions         # List functions
```

## Lisp Essentials

```lisp
; Variables
(def x 10)

; Functions
(def square (lambda (x) (* x x)))

; Conditionals
(if (> x 5) "yes" "no")

; Lists
(list 1 2 3)
(car (list 1 2 3))    ; First element
(cdr (list 1 2 3))    ; Rest

; Arithmetic
(+ 1 2 3)
(- 10 5)
(* 2 3)
(/ 10 2)

; Comparison
(< 1 2)
(> 5 3)
(= 2 2)

; Call WASM
(call-wasm "rust" "func" arg1 arg2)
```

## ALGOL Essentials

```algol
BEGIN
  REAL x, y;
  INTEGER count;
  
  x := 10.0;
  y := x * 2;
  
  IF x > 5 THEN
    y := x
  ELSE
    y := 0;
    
  y
END
```

## Evolution Commands

```bash
evolve 10         # Evolve 10 steps
mutate <rule>     # Apply mutation
status            # Organism status
save snapshot1    # Save state
load snapshot1    # Load state
```

## Tips

- Use `ls /programs` to see example programs
- Type `exit` or `(exit)` to leave REPL mode
- Type `END` to finish multiline input
- Type `CANCEL` to abort multiline input
- Use Tab for command completion (if available)
- Use Up/Down arrows for command history

## Example Session

```bash
> lisp
lisp> (def factorial (lambda (n)
...     (if (<= n 1) 1 (* n (factorial (- n 1))))))
<function>
lisp> (factorial 5)
120
lisp> (exit)

> write /programs/fact.lisp (def factorial (lambda (n) (if (<= n 1) 1 (* n (factorial (- n 1))))))
File written: /programs/fact.lisp

> run /programs/fact.lisp
<function>

> eval (factorial 10)
3628800

> ls /programs
DIR         -  programs/
FILE      234B  fact.lisp
FILE      156B  hello.lisp
FILE      189B  evolve.algol
```

## Need Help?

- `help` - Basic commands
- `help-extended` - Programming commands
- `cat /README.txt` - Welcome message
- See `docs/PROGRAMMING-GUIDE.md` for full guide
