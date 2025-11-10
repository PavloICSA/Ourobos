# Project Structure

## Organization

OuroborOS-Chimera follows a component-based architecture with clear separation between JavaScript orchestration layer, WASM modules, external services, and UI components.

## Directory Layout

```
.
├── .kiro/              # Kiro AI assistant configuration
│   └── specs/          # Feature specifications
│       └── ouroboros-chimera/
├── src/                # JavaScript source code
│   ├── main.js         # Application entry point
│   ├── lisp/           # Lisp interpreter
│   ├── algol/          # ALGOL DSL compiler
│   ├── orchestrator/   # Message bus and coordination
│   ├── terminal/       # Retro terminal UI
│   ├── entropy/        # Entropy source system
│   ├── visualization/  # Canvas/D3 rendering
│   ├── persistence/    # Save/load system
│   ├── blockchain/     # Blockchain bridge
│   ├── quantum/        # Quantum client
│   ├── biosensor/      # Bio sensor client
│   ├── chimera/        # Chimera data models
│   └── styles/         # CSS styling
├── wasm/               # WebAssembly source code
│   ├── rust/           # Rust orchestrator module
│   ├── fortran/        # Fortran numeric engine
│   ├── go/             # Go neural clusters
│   └── pascal/         # Pascal terminal
├── contracts/          # Solidity smart contracts
│   ├── contracts/      # Contract source files
│   ├── scripts/        # Deployment scripts
│   └── test/           # Contract tests
├── services/           # External services
│   ├── quantum/        # Quantum entropy service
│   └── biosensor/      # Bio sensor node
├── public/             # Static assets
│   └── wasm/           # Compiled WASM outputs (generated)
├── index.html          # Main HTML entry
├── vite.config.js      # Vite build configuration
├── package.json        # Node.js dependencies
├── docker-compose.yml  # Docker orchestration
├── netlify.toml        # Netlify deployment config
└── firebase.json       # Firebase deployment config
```

## Key Directories

- **src/**: All JavaScript source code organized by component
- **wasm/**: Source code for WebAssembly modules (Rust, Fortran, Go, Pascal)
- **contracts/**: Solidity smart contracts for blockchain governance
- **services/**: External Python services (quantum, biosensor)
- **public/**: Static assets served directly (WASM outputs go here)
- **src/lisp/**: Lisp interpreter with sandboxing and self-modification
- **src/algol/**: ALGOL DSL compiler that generates Lisp code
- **src/orchestrator/**: Message bus coordinating all components
- **src/terminal/**: Retro Pascal-style terminal UI
- **src/visualization/**: Canvas and D3.js rendering engine
- **src/blockchain/**: Blockchain bridge for smart contract interaction
- **src/quantum/**: Quantum entropy client
- **src/biosensor/**: Bio sensor network client
- **src/chimera/**: Chimera-specific data models and state management

## File Naming Conventions

- JavaScript files: lowercase with hyphens (e.g., `message-bus.js`)
- Component classes: PascalCase (e.g., `LispInterpreter`)
- WASM modules: lowercase with underscores (e.g., `numeric_engine.f90`)
- Configuration files: standard names (e.g., `vite.config.js`)

## Module Organization

Each component is self-contained with clear interfaces:
- Export classes/functions via ES6 modules
- WASM modules expose functions via wasm-bindgen (Rust) or Emscripten (Fortran)
- Communication through message bus pattern
- Shared types defined in component interfaces
