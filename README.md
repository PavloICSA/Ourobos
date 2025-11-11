# OuroborOS-Chimera

**A self-modifying digital organism combining multiple programming languages, blockchain governance, quantum entropy, and biological sensors.**

**Repository:** https://www.github.com/PavloICSA/Ourobos.git

## Overview

OuroborOS-Chimera is a polyglot WebAssembly application that simulates a living digital organism. It combines:

- **Self-Modifying Code** - Lisp interpreter that can rewrite its own behavior
- **Multi-Language Architecture** - Rust, Fortran, Go, Pascal, Solidity working together
- **Blockchain Governance** - Decentralized mutation proposals and voting
- **Quantum Entropy** - True randomness from quantum circuits
- **Bio Sensors** - Physical world feedback from Raspberry Pi sensors
- **Interactive Programming** - Full REPL environment with virtual filesystem

## Quick Start

### Prerequisites

- Node.js 18+
- Rust 1.70+ with wasm-pack
- Emscripten SDK (for Fortran)
- Go 1.21+ (optional)
- Free Pascal (optional)

### Installation

```bash
# Clone repository
git clone https://www.github.com/PavloICSA/Ourobos.git
cd Ourobos

# Install dependencies
npm install

# Build WASM modules
npm run build:wasm

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### First Steps

```bash
# Check system status
> status

# Enter Lisp REPL
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

# Run a program
> run /programs/hello.lisp

# Get help
> help
> help-extended
```

## Features

### Core Components

- **Lisp Interpreter** - Self-modifying code execution with sandboxing
- **ALGOL Compiler** - Domain-specific language that compiles to Lisp
- **Rust Orchestrator** - High-performance state management (WASM)
- **Fortran Engine** - Scientific computation module (WASM)
- **Go Neural Clusters** - Distributed processing nodes (WASM)
- **Pascal Terminal** - Retro UI rendering (WASM)
- **Message Bus** - Component coordination and circuit breaker pattern

### Programming Environment

- **Interactive REPL** - Lisp and ALGOL modes for live coding
- **Virtual Filesystem** - In-memory file storage with directories
- **50+ Commands** - Comprehensive terminal interface
- **Program Execution** - Run .lisp and .algol files
- **Environment Management** - Global variables and functions
- **WASM Integration** - Direct calls to Rust, Fortran, Go, Pascal modules

### Extended Features

- **Blockchain Governance** - Ethereum smart contracts for mutation voting
- **Quantum Entropy** - Qiskit-based quantum random number generation
- **Bio Sensor Network** - Raspberry Pi sensors (light, temperature, motion)
- **Multi-Source Entropy** - WebCrypto, WebGPU, quantum, and physical sensors
- **Real-Time Visualization** - D3.js graphs and fractal rendering
- **Persistence** - Save/load with blockchain verification

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Runtime                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Terminal   │  │  JavaScript  │  │   Lisp           │  │
│  │   UI         │◄─┤ Orchestrator ├─►│   Interpreter    │  │
│  └──────────────┘  └──────┬───────┘  └──────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         WASM Runtime Layer                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │   Rust   │  │ Fortran  │  │  Go / Pascal     │   │  │
│  │  │  State   │  │  Numeric │  │  Neural/Terminal │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services (Optional)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Blockchain  │  │   Quantum    │  │   Bio Sensors    │  │
│  │  (Ethereum)  │  │  (Qiskit)    │  │  (Raspberry Pi)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
.
├── src/                    # JavaScript source code
│   ├── main.js            # Application entry point
│   ├── lisp/              # Lisp interpreter
│   ├── algol/             # ALGOL DSL compiler
│   ├── orchestrator/      # Message bus & coordination
│   ├── terminal/          # Terminal UI & commands
│   ├── blockchain/        # Blockchain bridge
│   ├── quantum/           # Quantum client
│   ├── biosensor/         # Bio sensor client
│   ├── visualization/     # D3.js rendering
│   └── persistence/       # Save/load system
├── wasm/                  # WebAssembly modules
│   ├── rust/              # Rust orchestrator
│   ├── fortran/           # Fortran numeric engine
│   ├── go/                # Go neural clusters
│   └── pascal/            # Pascal terminal
├── contracts/             # Solidity smart contracts
├── services/              # External services
│   ├── quantum/           # Qiskit entropy service
│   └── biosensor/         # Raspberry Pi sensors
├── examples/              # Example programs
└── public/                # Static assets
```

## Commands

### Basic Commands
- `help` - Show basic commands
- `help-extended` - Show programming commands
- `status` - Display organism and system health
- `clear` - Clear terminal screen

### Programming
- `lisp` - Enter Lisp REPL mode
- `algol` - Enter ALGOL REPL mode
- `eval <expr>` - Evaluate Lisp expression
- `script <lang>` - Enter multiline script mode
- `run <file>` - Execute program file
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

### Evolution
- `evolve [steps]` - Run evolution for N steps
- `mutate <rule>` - Apply ALGOL mutation rule
- `save <name>` - Save organism snapshot
- `load <name>` - Load snapshot

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build individual WASM modules
npm run build:rust      # Rust orchestrator
npm run build:fortran   # Fortran numeric engine
npm run build:go        # Go neural clusters
npm run build:pascal    # Pascal terminal

# Build for production
npm run build

# Build with optimization
npm run build:optimized

# Preview production build
npm run preview
```

## Deployment

The application is fully static and can be deployed to:
- Netlify (recommended)
- Firebase Hosting
- Vercel
- GitHub Pages
- Any static file host

```bash
# Build optimized production bundle
npm run build:optimized

# Deploy to Netlify
netlify deploy --prod

# Deploy to Firebase
firebase deploy
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

WebAssembly support is required. WebGPU support is optional and enhances entropy generation.

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing procedures
- **Component READMEs** - Detailed documentation in each `src/*/README.md`

## License

MIT - See [LICENSE.md](./LICENSE.md)

## Contributing

Contributions welcome! Please read the component documentation and ensure tests pass before submitting pull requests.

## Related Projects

This is the complete OuroborOS-Chimera implementation combining:
- Core organism simulation
- Multi-language WASM integration
- Blockchain governance
- Quantum entropy
- Bio sensor network
- Interactive programming environment

---

**Start coding and let the organism evolve!** 🚀
