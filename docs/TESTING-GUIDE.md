# ChimeraOS Extended Features - Testing Guide

## Quick Verification Tests

Run these commands to verify all features are working correctly.

## 1. Basic System Check

```bash
# Check help system
> help
# Should show basic commands

> help-extended
# Should show extended programming commands

# Check status
> status
# Should show organism state and service health
```

## 2. REPL Mode Tests

### Lisp REPL
```bash
> lisp
lisp> (+ 1 2 3)
# Expected: 6

lisp> (def x 10)
# Expected: 10

lisp> (* x 2)
# Expected: 20

lisp> (def square (lambda (n) (* n n)))
# Expected: <function>

lisp> (square 5)
# Expected: 25

lisp> (exit)
# Should return to command mode
```

### ALGOL REPL
```bash
> algol
algol> BEGIN REAL x := 10.0; x * 2 END
# Expected: 20.0

algol> EXIT
# Should return to command mode
```

### Eval Command
```bash
> eval (+ 10 20)
# Expected: 30

> eval (list 1 2 3 4 5)
# Expected: (1 2 3 4 5)
```

## 3. Filesystem Tests

### Navigation
```bash
> pwd
# Expected: /

> ls
# Should show: programs/, data/, scripts/, README.txt

> cd /programs
# Expected: Changed directory to /programs

> pwd
# Expected: /programs

> ls
# Should show example programs

> cd ..
# Expected: Changed directory to /

> pwd
# Expected: /
```

### File Operations
```bash
> cat /README.txt
# Should display welcome message

> write /test.txt Hello World
# Expected: File written: /test.txt

> cat /test.txt
# Expected: Hello World

> ls
# Should show test.txt in listing

> rm /test.txt
# Expected: Deleted: /test.txt

> ls
# test.txt should be gone
```

### Directory Operations
```bash
> mkdir /testdir
# Expected: Directory created: /testdir

> ls
# Should show testdir/

> cd /testdir
# Expected: Changed directory to /testdir

> pwd
# Expected: /testdir

> cd /
# Back to root

> rm /testdir
# Expected: Deleted: /testdir (if empty)
```

### Search Operations
```bash
> find lisp
# Should find .lisp files

> grep lambda
# Should find files containing "lambda"
```

## 4. Program Execution Tests

### Run Lisp Program
```bash
> cat /programs/hello.lisp
# Should show program content

> run /programs/hello.lisp
# Should execute and show result

> eval (greet "World")
# Should work if hello.lisp defines greet function
```

### Write and Run Custom Program
```bash
> write /programs/test.lisp (def add (lambda (a b) (+ a b)))
# Expected: File written: /programs/test.lisp

> run /programs/test.lisp
# Expected: <function>

> eval (add 10 20)
# Expected: 30
```

### Multiline Script
```bash
> script lisp
# Enter multiline mode

... (def factorial (lambda (n)
...   (if (<= n 1)
...     1
...     (* n (factorial (- n 1))))))
... 
... (factorial 5)
... END

# Expected: 120
```

## 5. ALGOL Compilation Tests

### Compile ALGOL
```bash
> write /programs/test.algol BEGIN REAL x := 10.0; x * 2 END
# Expected: File written

> compile /programs/test.algol
# Should show:
# - Compilation successful
# - Generated Lisp code
# - Saved to: /programs/test.lisp
```

### Run ALGOL Program
```bash
> run /programs/evolve.algol
# Should execute and show result
```

## 6. Environment Management Tests

### Variables
```bash
> set x 42
# Expected: Set x = 42

> get x
# Expected: x = 42

> eval (+ x 10)
# Expected: 52
```

### Functions
```bash
> eval (def double (lambda (x) (* x 2)))
# Expected: <function>

> functions
# Should list: double

> eval (double 5)
# Expected: 10
```

### Environment Info
```bash
> env
# Should show:
# - Built-in functions
# - Special forms
# - Environment info
```

## 7. WASM Integration Tests

### Rust Module (if loaded)
```bash
> rust calculate 10 20
# Should call Rust function and show result
# Or show error if module not loaded
```

### Go Clusters (if loaded)
```bash
> go list
# Should show active clusters

> go create test-cluster
# Expected: Cluster created: test-cluster

> go list
# Should now include test-cluster

> go decide main
# Should return a decision
```

### From Lisp
```bash
> eval (call-wasm "rust" "calculate" 10 20)
# Should call WASM module
# Or show error if not available
```

## 8. Complex Integration Tests

### Test 1: Write, Run, and Use Function
```bash
> write /programs/math.lisp (begin (def square (lambda (x) (* x x))) (def cube (lambda (x) (* x x x))))
> run /programs/math.lisp
> eval (square 5)
# Expected: 25
> eval (cube 3)
# Expected: 27
```

### Test 2: Recursive Function
```bash
> script lisp
... (def fib (lambda (n)
...   (if (<= n 1)
...     n
...     (+ (fib (- n 1)) (fib (- n 2))))))
... (fib 10)
... END
# Expected: 55
```

### Test 3: List Processing
```bash
> eval (def map (lambda (f lst) (if (null? lst) (list) (cons (f (car lst)) (map f (cdr lst))))))
> eval (def double (lambda (x) (* x 2)))
> eval (map double (list 1 2 3 4 5))
# Expected: (2 4 6 8 10)
```

### Test 4: File Organization
```bash
> mkdir /myproject
> cd /myproject
> write utils.lisp (def add (lambda (a b) (+ a b)))
> write main.lisp (begin (def result (add 10 20)) result)
> ls
# Should show both files
> run utils.lisp
> run main.lisp
# Expected: 30
```

## 9. Error Handling Tests

### Invalid Commands
```bash
> invalidcommand
# Expected: Unknown command error

> eval (invalid-function)
# Expected: Undefined variable error

> cat /nonexistent.txt
# Expected: File not found error

> cd /nonexistent
# Expected: Directory not found error
```

### Syntax Errors
```bash
> eval (+ 1 2
# Expected: Parse error (unclosed parenthesis)

> eval )
# Expected: Parse error (unexpected token)
```

### Type Errors
```bash
> eval (+ "hello" 5)
# Expected: Type error or NaN

> eval (car 5)
# Expected: Error (not a list)
```

## 10. Performance Tests

### Large Computation
```bash
> eval (def fib (lambda (n) (if (<= n 1) n (+ (fib (- n 1)) (fib (- n 2))))))
> eval (fib 20)
# Should complete (may take a moment)
# Expected: 6765
```

### Many Files
```bash
> mkdir /test
> cd /test
# Create multiple files
> write file1.lisp (def f1 () 1)
> write file2.lisp (def f2 () 2)
> write file3.lisp (def f3 () 3)
> ls
# Should list all files
> find file
# Should find all files
```

## 11. State Persistence Tests

### Lisp Environment
```bash
> eval (def x 100)
> eval (def y 200)
> eval (+ x y)
# Expected: 300

# Variables should persist across commands
> eval x
# Expected: 100
```

### Filesystem Persistence
```bash
> write /persist.txt Test
> cat /persist.txt
# Expected: Test

# File should persist until deleted
> ls
# Should show persist.txt
```

## Expected Results Summary

All tests should:
- ✅ Execute without crashes
- ✅ Return expected results
- ✅ Show appropriate error messages for invalid input
- ✅ Maintain state correctly
- ✅ Handle edge cases gracefully

## Troubleshooting

### If REPL doesn't work:
- Check that `repl.js` is loaded
- Verify `terminal.setREPL()` was called
- Check browser console for errors

### If filesystem doesn't work:
- Check that `filesystem.js` is loaded
- Verify initialization in `main.js`
- Check for path resolution issues

### If WASM calls fail:
- Check that modules are loaded
- Verify service health with `status`
- Check browser console for WASM errors

### If commands not found:
- Verify `extended-commands.js` is loaded
- Check command registration in `setupCommands()`
- Try `help-extended` to see available commands

## Automated Test Script

You can copy-paste this entire sequence to test all features:

```bash
help
help-extended
status
lisp
(+ 1 2 3)
(def x 10)
(* x 2)
(exit)
eval (+ 10 20)
pwd
ls
cd /programs
ls
cd /
write /test.txt Hello
cat /test.txt
rm /test.txt
mkdir /testdir
ls
rm /testdir
write /programs/test.lisp (def add (lambda (a b) (+ a b)))
run /programs/test.lisp
eval (add 5 10)
set myvar 42
get myvar
eval (+ myvar 10)
functions
env
find lisp
clear
```

## Success Criteria

The extended features are working correctly if:

1. ✅ All REPL modes function (lisp, algol, multiline)
2. ✅ Filesystem operations work (read, write, navigate, search)
3. ✅ Programs can be written, stored, and executed
4. ✅ Environment management works (variables, functions)
5. ✅ WASM integration functions (or gracefully degrades)
6. ✅ Error handling is appropriate
7. ✅ State persists correctly
8. ✅ No crashes or hangs
9. ✅ Help system is comprehensive
10. ✅ All commands in documentation work as described

## Reporting Issues

If you find issues:
1. Note the exact command that failed
2. Check browser console for errors
3. Verify prerequisites (WASM modules loaded, etc.)
4. Try simpler version of command
5. Check documentation for correct syntax

Happy testing! 🧪
