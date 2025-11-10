# OuroborOS-Chimera

**Repository:** https://www.github.com/PavloICSA/Ourobos.git

A fully local, static web application that simulates a self-modifying "living organism" using multiple programming languages compiled to WebAssembly, with blockchain governance, quantum entropy, and biological sensors.

## Overview

**OuroborOS-Chimera** is a polyglot digital organism that combines:

### Core Components
- **Retro Pascal-style Terminal UI** ✅ - Vintage computing experience with command history and cursor
- **Lisp Interpreter** ✅ - Self-modifying cognitive layer with sandboxing
- **ALGOL DSL** ✅ - Readable rule definition language that compiles to Lisp
- **Fortran Numeric Engine** ✅ - High-performance mathematical computations (integrate, logistic growth, mutation probability)
- **Rust Orchestrator** ✅ - Performance-critical coordination with state management
- **JavaScript Orchestrator** ✅ - Message bus with circuit breaker pattern

### Chimera Extensions
- **Blockchain Governance** ✅ - Solidity smart contracts for decentralized mutation proposals and voting
- **Quantum Entropy** ✅ - Qiskit-based quantum random number generation
- **Bio Sensor Network** ✅ - Raspberry Pi sensors (light, temperature, motion) for environmental input
- **Multi-source Entropy** ✅ - WebCrypto, quantum circuits, and physical sensors
- **Real-time Visualization** 🚧 - Canvas and D3.js rendering with blockchain timeline

## Current Status

**Completed Components:**
- ✅ Lisp interpreter with sandboxing and execution limits
- ✅ ALGOL DSL compiler (lexer, parser, code generator)
- ✅ Rust WASM orchestrator module (organism state, rule registry)
- ✅ Fortran numeric engine (differential equations, logistic growth, mutation probability)
- ✅ JavaScript orchestrator with message bus and circuit breaker
- ✅ Retro terminal UI with command handling
- ✅ WASM bridge utilities for memory management

**In Progress:**
- 🚧 Entropy source system (WebCrypto, WebGPU, device sensors)
- 🚧 Visualization engine (graph and fractal views)
- 🚧 Persistence layer (save/load snapshots)
- 🚧 Main application wiring

## Prerequisites

### Core Requirements

- **Node.js 18+** and npm - [Download](https://nodejs.org/)
- **Rust 1.70+** - Install: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **wasm-pack** - Install: `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
- **Emscripten SDK** - For Fortran compilation, see [emscripten.org](https://emscripten.org/docs/getting_started/downloads.html)
- **f2c** - Fortran to C converter:
  - Ubuntu/Debian: `sudo apt-get install f2c`
  - macOS: `brew install f2c`
  - Windows: Download from [netlib.org](https://www.netlib.org/f2c/)

### Extended Requirements (Optional Services)

For blockchain, quantum, and biosensor features, see [SETUP.md](./SETUP.md) for complete setup instructions including:
- **Hardhat** - Ethereum development environment
- **Python 3.9+** - For quantum and biosensor services
- **Docker** - Optional, for containerized services
- **TinyGo** - For Go WASM modules
- **Free Pascal** - For Pascal terminal UI
- **Raspberry Pi with sensors** - Optional, for bio sensor network

## Quick Start

### Option 1: Core System Only (No External Services)

```bash
# Install dependencies
npm install

# Build WASM modules (Rust + Fortran)
npm run build:rust
npm run build:fortran

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser. The system will run with mock services for blockchain, quantum, and biosensor features.

### Option 2: Full System with All Services

```bash
# Install all dependencies
npm install
cd contracts && npm install && cd ..

# Build everything (WASM + contracts)
bash build_all.sh  # Linux/Mac
# OR
build_all.cmd      # Windows

# Start all services with Docker
docker-compose up

# OR start services manually (see SETUP.md)
```

Visit `http://localhost:3000` in your browser.

> **For detailed setup instructions**, including service configuration and troubleshooting, see [SETUP.md](./SETUP.md).

## Project Structure

```
.
├── src/
│   ├── main.js              # Application entry point
│   ├── lisp/                # Lisp interpreter
│   ├── algol/               # ALGOL DSL compiler
│   ├── orchestrator/        # Message bus and coordination
│   ├── terminal/            # Retro terminal UI
│   ├── blockchain/          # Blockchain bridge
│   ├── quantum/             # Quantum client
│   ├── biosensor/           # Bio sensor client
│   ├── chimera/             # Chimera data models
│   ├── entropy/             # Entropy source system
│   ├── visualization/       # Canvas/D3 rendering
│   ├── persistence/         # Save/load system
│   └── styles/              # CSS styling
├── wasm/
│   ├── rust/                # Rust orchestrator module
│   ├── fortran/             # Fortran numeric engine
│   ├── go/                  # Go neural clusters
│   └── pascal/              # Pascal terminal
├── contracts/               # Solidity smart contracts
├── services/                # External services
│   ├── quantum/             # Quantum entropy service
│   └── biosensor/           # Bio sensor node
├── public/
│   └── wasm/                # Compiled WASM outputs
└── .kiro/
    └── specs/ouroboros-chimera/  # Design documents
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build individual WASM modules
npm run build:rust      # Build Rust orchestrator
npm run build:fortran   # Build Fortran numeric engine
npm run build:wasm      # Build all WASM modules

# Build for production
npm run build

# Build with optimization (recommended for production)
npm run build:optimized

# Optimize WASM modules
npm run optimize:wasm       # Linux/macOS
npm run optimize:wasm:win   # Windows

# Preview production build
npm run preview

# Performance monitoring
# Use terminal commands: perf-show, perf-summary, perf-health
```

## Component Documentation

Each component has detailed documentation:

- **Lisp Interpreter**: `src/lisp/README.md` - Core forms, built-in functions, sandboxing
- **ALGOL Compiler**: `src/algol/README.md` - Syntax, compilation process, examples
- **Orchestrator**: `src/orchestrator/README.md` - Message protocol, WASM bridge, circuit breaker
- **Terminal UI**: `src/terminal/README.md` - Commands, styling, integration
- **Fortran Engine**: `src/fortran/README.md` - Functions, performance, JavaScript wrapper
- **Rust Module**: `wasm/rust/README.md` - State management, rule registry, API

## Terminal Commands

The terminal UI supports 50+ commands across multiple categories:

### Basic Commands
- `help` - Show all available commands
- `status` - Display organism and system health
- `clear` - Clear terminal screen

### Blockchain Commands
- `propose-mutation` - Propose a new mutation
- `vote <id> <yes|no>` - Vote on a proposal
- `execute-proposal <id>` - Execute approved proposal
- `query-chain [gen]` - Query blockchain history
- `list-proposals` - List all proposals

### Service Commands
- `quantum-seed [bits]` - Request quantum entropy
- `sensor-read` - Read bio sensor values
- `cluster-status` - Display neural cluster status
- `service-health` - Check all service health

### Performance Commands
- `perf-show` - Display performance dashboard
- `perf-summary` - Show performance summary
- `perf-reset` - Reset metrics
- `perf-export` - Export metrics to JSON
- `perf-health` - Check performance health

### System Commands
- `save [name]` - Save organism snapshot
- `load <name>` - Load snapshot
- `verify` - Verify blockchain proof
- `export <format>` - Export data (json/csv/ourocode)
- `config [key] [value]` - View/update configuration

**See [docs/TERMINAL-COMMANDS.md](./docs/TERMINAL-COMMANDS.md) for complete command reference with examples.**

## Extended Features

OuroborOS-Chimera includes advanced features for decentralized governance and external data sources:

- **🔗 Blockchain Governance** ✅ - Ethereum smart contracts for decentralized mutation proposals and voting
- **⚛️ Quantum Entropy** ✅ - Qiskit-based quantum random number generation
- **🌡️ Bio Sensor Network** ✅ - Raspberry Pi sensors (light, temperature, motion) for environmental input
- **🧠 Go Neural Clusters** 🚧 - WebAssembly neural network modules (in progress)
- **📝 Meta-Compiler** 🚧 - Ourocode specification for cross-language compilation (in progress)

All external services support graceful degradation with mock modes for offline development.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

WebAssembly support is required. WebGPU support is optional and enhances entropy generation.

## Deployment

The application is fully static and can be deployed to:
- Netlify (recommended)
- Firebase Hosting
- Vercel
- GitHub Pages
- Any static file host

### Quick Deploy

```bash
# Build optimized production bundle
npm run build:optimized

# Deploy to Netlify
netlify deploy --prod

# Deploy to Firebase
firebase deploy

# Or use deployment script
bash scripts/deploy.sh production     # Linux/macOS
scripts\deploy.cmd production         # Windows
```

### Features

- ✅ Code splitting for optimal loading
- ✅ Lazy loading for optional services
- ✅ WASM optimization with wasm-opt
- ✅ Performance monitoring built-in
- ✅ Security headers configured
- ✅ Cache control optimized

See [docs/DEPLOYMENT-GUIDE.md](./docs/DEPLOYMENT-GUIDE.md) for complete deployment instructions.

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
│  │  │   Rust   │  │ Fortran  │  │  ALGOL Compiler  │   │  │
│  │  │Orchestr. │  │  Numeric │  │  (to Lisp)       │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**

- **Terminal UI** (`src/terminal/`): Retro green-on-black interface with command history
- **JavaScript Orchestrator** (`src/orchestrator/`): Message bus with circuit breaker pattern
- **Lisp Interpreter** (`src/lisp/`): Sandboxed interpreter with self-modification capability
- **ALGOL Compiler** (`src/algol/`): Lexer, parser, and code generator to Lisp
- **Rust Module** (`wasm/rust/`): Organism state management and rule registry
- **Fortran Engine** (`wasm/fortran/`): High-performance numeric computations

See `.kiro/specs/ouroboros-chimera/design.md` for detailed architecture documentation.

## Documentation

### User Documentation
- **[docs/TERMINAL-COMMANDS.md](./docs/TERMINAL-COMMANDS.md)** - Complete terminal command reference (50+ commands)
- **[docs/SERVICE-SETUP.md](./docs/SERVICE-SETUP.md)** - Service setup guide (blockchain, quantum, biosensor)
- **[README.chimera.md](./README.chimera.md)** - Chimera-specific features and usage

### Developer Documentation
- **[SETUP.md](./SETUP.md)** - Complete setup instructions for all components
- **[DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)** - Developer reference and common tasks
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture overview
- **[docs/OUROCODE-SPEC.md](./docs/OUROCODE-SPEC.md)** - Ourocode IR specification
- **[STATUS.md](./STATUS.md)** - Implementation status and progress tracking

### Deployment Documentation
- **[docs/DEPLOYMENT-GUIDE.md](./docs/DEPLOYMENT-GUIDE.md)** - Deployment guide for all platforms

### Component Documentation
- **Component READMEs** - Detailed documentation in each `src/*/README.md` and `wasm/*/README.md`

## Related Projects

- **OuroborOS-Chimera** - This repository, a complete polyglot digital organism with blockchain governance, quantum entropy, and biological sensors

## License

MIT
