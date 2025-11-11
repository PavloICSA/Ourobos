# ChimeraOS Extended Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                    (Browser Terminal UI)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Terminal Layer                              │
│                    (terminal.js)                                 │
│  • Input handling                                                │
│  • Output rendering                                              │
│  • Command routing                                               │
│  • Mode detection                                                │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│   REPL   │  │Filesystem│  │ Commands │  │   Extended   │
│          │  │          │  │ Registry │  │   Commands   │
│ repl.js  │  │filesystem│  │commands  │  │extended-     │
│          │  │   .js    │  │  .js     │  │commands.js   │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘
     │             │             │                │
     │             │             │                │
     ▼             ▼             ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Core Components Layer                         │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ Lisp Interpreter│ ALGOL Compiler  │   Chimera Orchestrator      │
│                 │                 │                             │
│ • Evaluation    │ • Parsing       │ • State management          │
│ • Environment   │ • Code gen      │ • Service coordination      │
│ • Functions     │ • Validation    │ • Event handling            │
└────────┬────────┴────────┬────────┴──────────┬──────────────────┘
         │                 │                   │
         ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WASM Modules Layer                            │
├──────────┬──────────┬──────────┬──────────┬─────────────────────┤
│  Rust    │ Fortran  │    Go    │  Pascal  │   Other Modules     │
│  Engine  │  Engine  │ Clusters │  Bridge  │                     │
│          │          │          │          │                     │
│ • Calc   │ • Matrix │ • Neural │ • Term   │ • Quantum Client    │
│ • Logic  │ • Numeric│ • State  │ • UI     │ • Bio Sensors       │
│          │          │ • Decide │          │ • Blockchain        │
└──────────┴──────────┴──────────┴──────────┴─────────────────────┘
```

## Component Interaction Flow

### 1. Command Execution Flow

```
User Input
    │
    ▼
Terminal.executeCommand()
    │
    ├─> Check REPL mode?
    │   ├─> Yes: REPL.handleInput()
    │   │        │
    │   │        ├─> Lisp mode: Interpreter.eval()
    │   │        ├─> ALGOL mode: Compiler.compile() → Interpreter.eval()
    │   │        └─> Multiline: Buffer until END
    │   │
    │   └─> No: Continue to command routing
    │
    ├─> Check Extended Commands?
    │   ├─> Filesystem: VirtualFilesystem operations
    │   ├─> REPL: Mode switching
    │   ├─> WASM: Module calls
    │   └─> Environment: Variable management
    │
    └─> Check Basic Commands?
        ├─> Evolution: Orchestrator.evolve()
        ├─> Mutation: Orchestrator.mutate()
        └─> Status: Orchestrator.getStatus()
```

### 2. Program Execution Flow

```
run /programs/hello.lisp
    │
    ▼
ExtendedCommands.handleRun()
    │
    ├─> VirtualFilesystem.readFile()
    │   └─> Returns file content
    │
    ├─> Detect file type (.lisp or .algol)
    │
    ├─> If .lisp:
    │   └─> LispInterpreter.eval(content)
    │       └─> Returns result
    │
    └─> If .algol:
        └─> ALGOLCompiler.compile(content)
            ├─> Returns Lisp code
            └─> LispInterpreter.eval(lisp)
                └─> Returns result
```

### 3. REPL Interaction Flow

```
lisp command
    │
    ▼
ExtendedCommands.handleLisp()
    │
    └─> REPL.enterLispMode()
        ├─> Terminal.setPrompt("lisp> ")
        └─> Set mode = 'lisp'

User types: (+ 1 2 3)
    │
    ▼
Terminal.executeCommand()
    │
    └─> REPL.handleInput()
        ├─> Check mode = 'lisp'
        └─> REPL.handleLispInput()
            └─> LispInterpreter.eval("(+ 1 2 3)")
                └─> Returns 6
                    └─> Terminal.writeLine("6")

User types: (exit)
    │
    ▼
REPL.handleLispInput()
    └─> REPL.exitMode()
        ├─> Terminal.setPrompt("> ")
        └─> Set mode = 'command'
```

### 4. Filesystem Operations Flow

```
write /programs/test.lisp (def hello () "Hi")
    │
    ▼
ExtendedCommands.handleWrite()
    │
    ├─> Parse: filename = "/programs/test.lisp"
    ├─> Parse: content = "(def hello () \"Hi\")"
    │
    └─> VirtualFilesystem.writeFile()
        ├─> Normalize path
        ├─> Create parent dirs if needed
        ├─> Store in Map
        └─> Update metadata

ls /programs
    │
    ▼
ExtendedCommands.handleLs()
    │
    └─> VirtualFilesystem.listDirectory()
        ├─> Get entries with prefix "/programs/"
        ├─> Filter direct children
        ├─> Sort (dirs first, then alpha)
        └─> Return array of entries
            └─> Terminal displays formatted list
```

### 5. WASM Integration Flow

```
rust calculate 10 20
    │
    ▼
ExtendedCommands.handleRust()
    │
    ├─> Get Orchestrator.rustEngine
    ├─> Parse args: [10, 20]
    │
    └─> rustEngine.call("calculate", 10, 20)
        └─> WASM module execution
            └─> Returns result
                └─> Terminal.writeLine("Result: 30")

From Lisp:
(call-wasm "rust" "calculate" 10 20)
    │
    ▼
LispInterpreter.evalExpression()
    │
    └─> Built-in function: call-wasm
        └─> LispInterpreter.callWASM()
            ├─> Get module: wasmModules.get("rust")
            ├─> Get function: module["calculate"]
            └─> Call: func(10, 20)
                └─> Returns result to Lisp
```

## Data Flow Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ Types command
       ▼
┌─────────────┐
│  Terminal   │◄──────────┐
└──────┬──────┘           │
       │                  │
       │ Routes to        │ Displays result
       ▼                  │
┌─────────────┐           │
│   Command   │           │
│   Handler   │           │
└──────┬──────┘           │
       │                  │
       │ Executes         │
       ▼                  │
┌─────────────┐           │
│   Core      │           │
│ Components  │───────────┘
└──────┬──────┘
       │
       │ Calls if needed
       ▼
┌─────────────┐
│    WASM     │
│   Modules   │
└─────────────┘
```

## State Management

```
┌──────────────────────────────────────┐
│      Global Application State        │
├──────────────────────────────────────┤
│                                      │
│  Terminal State                      │
│  ├─ Current prompt                   │
│  ├─ Command history                  │
│  └─ Output buffer                    │
│                                      │
│  REPL State                          │
│  ├─ Current mode (command/lisp/etc)  │
│  ├─ Multiline buffer                 │
│  └─ History                          │
│                                      │
│  Filesystem State                    │
│  ├─ Files Map                        │
│  ├─ Current directory                │
│  └─ Metadata                         │
│                                      │
│  Lisp Environment                    │
│  ├─ Global bindings                  │
│  ├─ User functions                   │
│  └─ Variables                        │
│                                      │
│  Orchestrator State                  │
│  ├─ Organism state                   │
│  ├─ Service health                   │
│  └─ WASM modules                     │
│                                      │
└──────────────────────────────────────┘
```

## Module Dependencies

```
main.js
  ├─> terminal/terminal.js
  │     └─> terminal/repl.js
  │           ├─> lisp/interpreter.js
  │           └─> algol/compiler.js
  │
  ├─> terminal/filesystem.js
  │
  ├─> terminal/commands.js
  │     └─> orchestrator/chimera-orchestrator.js
  │
  ├─> terminal/extended-commands.js
  │     ├─> terminal/filesystem.js
  │     ├─> terminal/repl.js
  │     ├─> lisp/interpreter.js
  │     ├─> algol/compiler.js
  │     └─> orchestrator/chimera-orchestrator.js
  │
  ├─> lisp/interpreter.js
  │     └─> lisp/parser.js
  │
  ├─> algol/compiler.js
  │     ├─> algol/lexer.js
  │     ├─> algol/parser.js
  │     └─> algol/codegen.js
  │
  └─> orchestrator/chimera-orchestrator.js
        ├─> blockchain/blockchain-bridge.js
        ├─> quantum/client.js
        ├─> biosensor/client.js
        └─> go-bridge/bridge.js
```

## Event Flow

```
User Action
    │
    ▼
┌─────────────────┐
│  Terminal Event │
│   (keydown)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Command Execute │
└────────┬────────┘
         │
         ├─> REPL Mode?
         │   └─> Interpreter/Compiler
         │       └─> Result
         │
         ├─> Filesystem Op?
         │   └─> VFS Operation
         │       └─> Success/Error
         │
         ├─> WASM Call?
         │   └─> Module Execution
         │       └─> Result
         │
         └─> Orchestrator Op?
             └─> State Change
                 ├─> Update UI
                 └─> Emit Events
```

## Security Boundaries

```
┌─────────────────────────────────────────┐
│         Sandboxed Environment           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Lisp Interpreter                │ │
│  │   • No global JS access           │ │
│  │   • Whitelisted functions only    │ │
│  │   • Execution limits              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Virtual Filesystem              │ │
│  │   • In-memory only                │ │
│  │   • No real file access           │ │
│  │   • Isolated from browser         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   WASM Modules                    │ │
│  │   • Sandboxed execution           │ │
│  │   • Limited memory                │ │
│  │   • No system calls               │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## Performance Characteristics

```
Operation                    Complexity    Notes
─────────────────────────────────────────────────
File read/write             O(1)          Map lookup
Directory listing           O(n)          n = files in dir
File search (find)          O(n)          n = total files
Content search (grep)       O(n*m)        n = files, m = lines
Lisp evaluation            O(e)          e = expression size
ALGOL compilation          O(c)          c = code size
WASM call                  O(1)          Direct function call
Command routing            O(1)          Map lookup
REPL mode switch           O(1)          State change
```

## Extension Points

```
┌─────────────────────────────────────────┐
│      Where to Add New Features          │
├─────────────────────────────────────────┤
│                                         │
│  New Commands                           │
│  └─> extended-commands.js               │
│      • Add handler method               │
│      • Register in setupCommands()      │
│                                         │
│  New REPL Modes                         │
│  └─> repl.js                            │
│      • Add mode constant                │
│      • Add handleXInput() method        │
│      • Add enterXMode() method          │
│                                         │
│  New Filesystem Features                │
│  └─> filesystem.js                      │
│      • Add method to class              │
│      • Update command handlers          │
│                                         │
│  New Lisp Functions                     │
│  └─> interpreter.js                     │
│      • Add to createGlobalEnvironment() │
│      • Or use registerJSFunction()      │
│                                         │
│  New WASM Modules                       │
│  └─> orchestrator.js                    │
│      • Load in loadWasmModules()        │
│      • Register with interpreter        │
│                                         │
└─────────────────────────────────────────┘
```

This architecture provides a clean, modular, and extensible foundation for the ChimeraOS programming environment!
