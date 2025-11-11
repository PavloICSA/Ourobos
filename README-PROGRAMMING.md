# ChimeraOS Programming Environment

## 🎉 Welcome to the Extended ChimeraOS!

ChimeraOS has been transformed from a simple command interface into a **full-featured programming environment**. You can now write, store, and execute real programs directly in your browser!

## 🚀 Quick Start

### Try It Now!

```bash
# Enter interactive Lisp mode
> lisp
lisp> (+ 1 2 3)
6
lisp> (def square (lambda (x) (* x x)))
<function>
lisp> (square 5)
25
lisp> (exit)

# List example programs
> ls /programs
DIR         -  programs/
FILE      123B  hello.lisp
FILE       89B  evolve.algol

# Run a program
> run /programs/hello.lisp
<function>

# Write your own program
> write /programs/test.lisp (def add (lambda (a b) (+ a b)))
File written: /programs/test.lisp

# Execute it
> run /programs/test.lisp
> eval (add 10 20)
30
```

## ✨ What's New?

### 1. Interactive REPL
- **Lisp REPL** - Write and test Lisp code interactively
- **ALGOL REPL** - Compile and run ALGOL on-the-fly
- **Multiline mode** - Write complex programs with proper formatting

### 2. Virtual Filesystem
- **Store programs** - Save your code for later use
- **Organize files** - Create directories and manage structure
- **Search capabilities** - Find files and search content

### 3. Direct Execution
- **Run programs** - Execute .lisp and .algol files
- **Compile code** - Convert ALGOL to Lisp
- **Eval expressions** - Quick one-line evaluations

### 4. WASM Integration
- **Call Rust** - Execute Rust functions from terminal
- **Call Fortran** - Run numeric computations
- **Control Go clusters** - Manage neural networks
- **Pascal bridge** - Terminal UI integration

### 5. Environment Management
- **Define variables** - Store values globally
- **Create functions** - Build reusable code
- **Inspect state** - View environment and functions

## 📚 Documentation

- **[Programming Guide](docs/PROGRAMMING-GUIDE.md)** - Complete tutorial with examples
- **[Quick Reference](docs/QUICK-REFERENCE.md)** - One-page command cheat sheet
- **[Extended Features](docs/EXTENDED-FEATURES.md)** - Architecture and design
- **[Changelog](CHANGELOG-EXTENDED.md)** - What was added

## 🎯 Key Features

### Before (Limited Commands)
```
Available commands:
  evolve, mutate, status
  save, load, export, import
  reset, clear, help
```

### After (Full Programming Environment)
```
50+ commands including:
  
REPL: lisp, algol, eval, script, run, compile
Filesystem: ls, cd, pwd, cat, write, edit, rm, mkdir, find, grep
WASM: rust, fortran, go, pascal
Environment: env, set, get, functions
```

## 💡 Example Use Cases

### 1. Write a Recursive Function
```lisp
> lisp
lisp> (def factorial (lambda (n)
...     (if (<= n 1) 1 (* n (factorial (- n 1))))))
<function>
lisp> (factorial 5)
120
```

### 2. Control the Organism
```lisp
> eval (call-js "update-state" (list "energy" 100))
> eval (call-js "evolve" 10)
```

### 3. Call WASM Modules
```bash
> rust calculate 10 20
Result: 30

> go decide main
Decision: evolve
```

### 4. Build a Library
```bash
> write /programs/math.lisp (begin (def square (lambda (x) (* x x))) (def cube (lambda (x) (* x x x))))
> run /programs/math.lisp
> eval (square 5)
25
> eval (cube 3)
27
```

## 🛠️ Command Categories

### REPL & Execution
- `lisp` - Enter Lisp REPL
- `algol` - Enter ALGOL REPL
- `eval <expr>` - Evaluate expression
- `script <lang>` - Multiline mode
- `run <file>` - Execute program
- `compile <file>` - Compile ALGOL

### Filesystem
- `ls [path]` - List files
- `cd <path>` - Change directory
- `pwd` - Current directory
- `cat <file>` - Read file
- `write <file> ...` - Write file
- `edit <file>` - Edit file
- `rm <file>` - Delete file
- `mkdir <dir>` - Create directory
- `find <pattern>` - Find files
- `grep <pattern>` - Search content

### WASM Modules
- `rust <func> ...` - Call Rust
- `fortran <func> ...` - Call Fortran
- `go <cmd> ...` - Go clusters
- `pascal` - Pascal info

### Environment
- `env` - Show environment
- `set <name> <val>` - Define variable
- `get <name>` - Get variable
- `functions` - List functions

### Help
- `help` - Basic commands
- `help-extended` - Programming commands

## 📖 Learning Path

1. **Start with basics** - Type `help` and `help-extended`
2. **Try the REPL** - Enter `lisp` mode and experiment
3. **Explore examples** - Run programs in `/programs`
4. **Write your own** - Create simple functions
5. **Build complexity** - Combine features
6. **Read the guide** - Check `docs/PROGRAMMING-GUIDE.md`

## 🎨 Example Programs Included

### `/programs/hello.lisp`
Simple greeting function demonstrating lambda and lists

### `/programs/evolve.algol`
ALGOL program showing numeric computation and state updates

### `examples/fibonacci.lisp`
Recursive Fibonacci implementation

### `examples/organism-control.lisp`
Control organism through JavaScript bridge

### `examples/neural-network.algol`
Neural network simulation in ALGOL

## 🔧 Technical Details

### Architecture
```
Terminal UI
    ├─> REPL (Lisp, ALGOL, Multiline)
    ├─> Filesystem (Files, Directories, Search)
    ├─> Extended Commands (50+ commands)
    ├─> Command Registry (Basic commands)
    └─> Orchestrator (System integration)
```

### Integration Points
- **Lisp Interpreter** - Direct evaluation and REPL
- **ALGOL Compiler** - Compile and execute
- **WASM Modules** - Rust, Fortran, Go, Pascal
- **Orchestrator** - State and evolution control

### Files Added
```
src/terminal/
├── filesystem.js          # Virtual filesystem
├── repl.js               # REPL system
└── extended-commands.js  # Extended commands

examples/
├── fibonacci.lisp
├── organism-control.lisp
└── neural-network.algol

docs/
├── PROGRAMMING-GUIDE.md
├── QUICK-REFERENCE.md
└── EXTENDED-FEATURES.md
```

## 🚦 Getting Started

### Step 1: Check Status
```bash
> status
Service Status:
  Blockchain:  ✓ Online
  Quantum:     ✓ Online
  Bio Sensors: ✓ Online
  Go WASM:     ✓ Loaded
```

### Step 2: Explore Filesystem
```bash
> ls /programs
> cat /programs/hello.lisp
```

### Step 3: Try REPL
```bash
> lisp
lisp> (+ 1 2 3)
6
lisp> (exit)
```

### Step 4: Write Code
```bash
> write /programs/mycode.lisp (def hello () "Hello World")
> run /programs/mycode.lisp
> eval (hello)
"Hello World"
```

### Step 5: Read Documentation
```bash
> cat /README.txt
```

## 🎓 Tips & Tricks

1. **Use history** - Up/Down arrows for command history
2. **Start simple** - Test in REPL before saving
3. **Organize code** - Use directories for projects
4. **Explore examples** - Learn from included programs
5. **Read errors** - Error messages are helpful
6. **Save often** - Use `write` to persist code
7. **Experiment** - The environment is sandboxed

## 🤝 Contributing

Want to add more features?
- New commands in `extended-commands.js`
- New REPL modes in `repl.js`
- New filesystem features in `filesystem.js`
- Example programs in `examples/`

## 📝 License

Same as OuroborOS-Chimera project

## 🎉 Conclusion

**ChimeraOS is now a true programmable organism!**

You have access to:
- ✅ Full Lisp and ALGOL programming
- ✅ Virtual filesystem for code storage
- ✅ Interactive REPL modes
- ✅ Direct WASM module access
- ✅ Environment management
- ✅ 50+ commands
- ✅ Comprehensive documentation

**Start coding and let the organism evolve through your programs!**

---

For questions or issues, see the documentation in `docs/` or type `help-extended` in the terminal.

Happy coding! 🚀
