# ChimeraOS Extended Programming Features

## Overview

ChimeraOS has been extended from a limited command-line interface to a **full-featured programming environment**. You can now write, store, and execute real programs directly in the terminal.

## What Was Added

### 1. Virtual Filesystem (`src/terminal/filesystem.js`)

A complete in-memory filesystem with:
- **Directory structure** - Create and navigate directories
- **File operations** - Read, write, edit, delete files
- **Search capabilities** - Find files by pattern, grep content
- **Path resolution** - Relative and absolute paths
- **Metadata tracking** - File sizes, timestamps

**Default structure:**
```
/
├── programs/
│   ├── hello.lisp
│   └── evolve.algol
├── data/
├── scripts/
└── README.txt
```

### 2. REPL System (`src/terminal/repl.js`)

Interactive programming modes:
- **Lisp REPL** - Direct Lisp expression evaluation
- **ALGOL REPL** - Compile and run ALGOL on-the-fly
- **Multiline mode** - Write complex programs interactively
- **Result formatting** - Pretty-print outputs
- **Mode switching** - Seamlessly switch between modes

### 3. Extended Commands (`src/terminal/extended-commands.js`)

50+ new commands organized into categories:

**REPL & Execution:**
- `lisp`, `algol`, `repl`, `eval`, `script`
- `run`, `exec`, `compile`

**Filesystem:**
- `ls`, `cd`, `pwd`, `cat`, `write`, `edit`
- `rm`, `mkdir`, `find`, `grep`

**WASM Integration:**
- `rust`, `fortran`, `go`, `pascal`, `wasm`

**Environment:**
- `env`, `set`, `get`, `functions`

### 4. Enhanced Terminal (`src/terminal/terminal.js`)

Updated terminal with:
- **REPL integration** - Automatic mode detection
- **Dynamic prompts** - Changes based on mode
- **Command routing** - Smart dispatch to handlers

### 5. Integration Layer (`src/main.js`)

Seamless integration of all components:
- Filesystem initialization with examples
- REPL setup with compiler and interpreter
- Extended commands registration
- Proper lifecycle management

## Key Capabilities

### Before (Limited)
```
> help
Available commands:
  evolve, mutate, status
  save, load, export, import
  reset, clear, help
```

### After (Full Programming Environment)
```
> help-extended
Extended Programming Commands:

REPL & Execution:
  lisp, algol, eval, script, run, compile

Filesystem:
  ls, cd, pwd, cat, write, edit, rm, mkdir, find, grep

WASM Modules:
  rust, fortran, go, pascal

Environment:
  env, set, get, functions
```

## Usage Examples

### 1. Interactive Lisp Programming

```bash
> lisp
lisp> (def square (lambda (x) (* x x)))
<function>
lisp> (square 5)
25
lisp> (exit)
```

### 2. Write and Execute Programs

```bash
> write /programs/fib.lisp (def fib (lambda (n) (if (<= n 1) n (+ (fib (- n 1)) (fib (- n 2))))))
File written: /programs/fib.lisp

> run /programs/fib.lisp
<function>

> eval (fib 10)
55
```

### 3. Multiline Scripts

```bash
> script lisp
... (def factorial (lambda (n)
...   (if (<= n 1)
...     1
...     (* n (factorial (- n 1))))))
... (factorial 5)
... END

120
```

### 4. Filesystem Management

```bash
> ls /programs
DIR         -  programs/
FILE      123B  hello.lisp
FILE       89B  evolve.algol

> cat /programs/hello.lisp
; Simple hello world program
(def greet (lambda (name)
  (list "Hello" name)))

> find \.lisp$
Found 2 file(s):
  /programs/hello.lisp
  /programs/fib.lisp
```

### 5. WASM Module Interaction

```bash
> rust calculate 10 20
Result: 30

> go list
Active clusters:
  - main
  - secondary

> go decide main
Decision: evolve
```

### 6. Environment Management

```bash
> set x 42
Set x = 42

> eval (+ x 10)
52

> functions
User-defined functions:
  square
  factorial
  greet
```

## Architecture

```
┌─────────────────────────────────────────┐
│           Terminal UI                    │
│  (terminal.js - Display & Input)        │
└──────────────┬──────────────────────────┘
               │
               ├──> REPL (repl.js)
               │    ├─> Lisp Mode
               │    ├─> ALGOL Mode
               │    └─> Multiline Mode
               │
               ├──> Filesystem (filesystem.js)
               │    ├─> File Operations
               │    ├─> Directory Navigation
               │    └─> Search Functions
               │
               ├──> Extended Commands (extended-commands.js)
               │    ├─> REPL Commands
               │    ├─> Filesystem Commands
               │    ├─> WASM Commands
               │    └─> Environment Commands
               │
               └──> Command Registry (commands.js)
                    └─> Basic Commands
```

## Integration Points

### 1. Lisp Interpreter
- Direct evaluation via `eval` command
- REPL mode for interactive programming
- Environment access for variable management

### 2. ALGOL Compiler
- Compile-and-run via `run` command
- ALGOL REPL mode
- Standalone compilation via `compile` command

### 3. WASM Modules
- Direct calls via `rust`, `fortran`, `go` commands
- Lisp bridge via `call-wasm` function
- Cluster management for Go neural networks

### 4. Orchestrator
- State management through Lisp functions
- Evolution control via programs
- Mutation proposals from scripts

## Benefits

### For Users
- **Write real programs** - Not just commands
- **Store and reuse code** - Persistent filesystem
- **Interactive development** - REPL for rapid iteration
- **Full language support** - Lisp and ALGOL
- **WASM integration** - Call compiled modules

### For Developers
- **Extensible architecture** - Easy to add new commands
- **Clean separation** - Modular design
- **Type safety** - Proper error handling
- **Documentation** - Comprehensive guides

### For the Organism
- **Programmable behavior** - Define custom rules
- **Complex mutations** - Multi-step programs
- **State control** - Direct manipulation
- **WASM acceleration** - Performance-critical code

## Files Added

```
src/terminal/
├── filesystem.js          # Virtual filesystem
├── repl.js               # REPL system
└── extended-commands.js  # Extended command set

examples/
├── fibonacci.lisp        # Recursive Fibonacci
├── organism-control.lisp # Organism manipulation
└── neural-network.algol  # Neural network simulation

docs/
├── PROGRAMMING-GUIDE.md  # Complete programming guide
├── QUICK-REFERENCE.md    # Quick reference card
└── EXTENDED-FEATURES.md  # This document
```

## Files Modified

```
src/
├── main.js               # Integration of new components
└── terminal/
    ├── terminal.js       # REPL integration
    ├── commands.js       # REPL support
    └── index.js          # Export new modules
```

## Future Enhancements

Potential additions:
- **Syntax highlighting** - Color-coded code
- **Auto-completion** - Tab completion for commands
- **Debugger** - Step through Lisp code
- **Package system** - Import/export modules
- **Macro system** - Lisp macros for metaprogramming
- **Type checking** - Optional type annotations
- **Performance profiling** - Measure execution time
- **Remote filesystem** - Load programs from URLs
- **Collaborative editing** - Multi-user programming

## Conclusion

ChimeraOS has evolved from a simple command interface to a **full programming environment**. You can now:

✅ Write and execute real programs
✅ Store code in a virtual filesystem
✅ Use interactive REPL modes
✅ Call WASM modules directly
✅ Manage environment and state
✅ Build complex behaviors

The system maintains backward compatibility while adding powerful new capabilities. All original commands still work, and the new features integrate seamlessly.

**ChimeraOS is now a true programmable organism!**
