# Technology Stack

## Build System

- **Vite 5.0+**: Fast build tool and dev server
- **npm**: Package manager
- **wasm-pack**: Rust to WASM compiler
- **Emscripten**: Fortran/C to WASM compiler
- **TinyGo**: Go to WASM compiler
- **Free Pascal**: Pascal to WASM compiler
- **Hardhat**: Ethereum development environment

## Languages & Frameworks

- **JavaScript (ES6+)**: Main orchestration layer
- **Rust**: High-performance WASM orchestrator module
- **Fortran 77/90**: Numeric computation engine
- **Go**: Neural cluster modules
- **Pascal**: Terminal UI
- **Solidity**: Smart contracts for blockchain governance
- **Python 3.9+**: External services (quantum, biosensor)
- **HTML5/CSS3**: UI and styling

## Key Libraries & Dependencies

- **d3 ^7.8.5**: Data visualization and graph rendering
- **ethers ^6.9.0**: Ethereum blockchain interaction
- **wasm-bindgen**: Rust-JavaScript interop
- **serde**: Rust serialization
- **qiskit**: Quantum circuit simulation
- **web3.py**: Python blockchain utilities

## Development Tools

- **Vitest 1.0+**: Unit testing framework
- **@vitest/ui**: Test UI dashboard
- **Docker**: Service containerization
- **Hardhat**: Smart contract testing and deployment

## Common Commands

```bash
# Build
npm run build              # Build production bundle
npm run build:wasm         # Build all WASM modules
npm run build:rust         # Build Rust module only
npm run build:fortran      # Build Fortran module only

# Test
npm test                   # Run tests once
npm run test:watch         # Run tests in watch mode

# Run/Start
npm run dev                # Start development server (port 3000)
npm run preview            # Preview production build

# Lint
[Not configured yet]
```

## Environment Setup

### Prerequisites

1. **Node.js 18+** and npm
2. **Rust toolchain**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
3. **wasm-pack**: `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
4. **Emscripten SDK**: Follow https://emscripten.org/docs/getting_started/downloads.html
5. **f2c**: Fortran to C converter (platform-specific installation)

### Setup Steps

```bash
# Clone repository
git clone <repo-url>
cd ouroboros-chimera

# Install JavaScript dependencies
npm install

# Install contract dependencies
cd contracts && npm install && cd ..

# Build WASM modules and contracts
npm run build:all

# Start development server
npm run dev

# Or start with all services using Docker
docker-compose up
```

### Browser Requirements

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- WebAssembly support required
- WebGPU optional (enhances entropy generation)
