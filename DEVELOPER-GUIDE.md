# Developer Guide

Quick reference for developers working on OuroborOS-Chimera.

> **Project Structure**: This repository contains **OuroborOS-Chimera**, a polyglot digital organism with blockchain governance, quantum entropy, and biological sensors. The system combines core components (Lisp, ALGOL, Rust, Fortran, orchestrator, terminal) with extended features (blockchain, quantum, biosensor, and meta-compiler).

## Project Structure

```
ouroboros-chimera/
├── src/                    # JavaScript source code
│   ├── main.js            # Application entry point
│   ├── lisp/              # ✅ Lisp interpreter
│   ├── algol/             # ✅ ALGOL DSL compiler
│   ├── orchestrator/      # ✅ Message bus & coordination
│   ├── terminal/          # ✅ Retro terminal UI
│   ├── fortran/           # ✅ Fortran WASM wrapper
│   ├── blockchain/        # ✅ Blockchain bridge
│   ├── quantum/           # ✅ Quantum client
│   ├── biosensor/         # ✅ Bio sensor client
│   ├── go-bridge/         # 🚧 Go WASM bridge
│   ├── metacompiler/      # 🚧 Meta-compiler
│   ├── entropy/           # 🚧 Entropy sources
│   ├── visualization/     # 🚧 Rendering engine
│   ├── persistence/       # 🚧 Save/load system
│   ├── config/            # ✅ Configuration
│   └── styles/            # ✅ CSS styling
├── wasm/                   # WebAssembly modules
│   ├── rust/              # ✅ Rust orchestrator
│   ├── fortran/           # ✅ Fortran numeric engine
│   ├── go/                # 🚧 Go neural clusters
│   └── pascal/            # 🚧 Pascal terminal
├── contracts/              # ✅ Solidity smart contracts
├── services/               # External services
│   ├── quantum/           # ✅ Qiskit entropy service
│   └── biosensor/         # ✅ Raspberry Pi sensors
├── public/                 # Static assets
│   └── wasm/              # Compiled WASM outputs
└── .kiro/                  # Kiro AI specs
    └── specs/
        └── ouroboros-chimera/
```

## Quick Start

### Prerequisites

```bash
# Node.js and npm
node --version  # Should be 18+
npm --version

# Rust and wasm-pack
rustc --version  # Should be 1.70+
wasm-pack --version

# Emscripten (for Fortran)
emcc --version

# f2c (for Fortran)
f2c --version

# Optional: Go (for neural clusters)
go version  # Should be 1.21+

# Optional: Free Pascal (for terminal)
fpc -version
```

### Installation

```bash
# Clone and install
git clone <repo-url>
cd ouroboros-chimera
npm install

# Build WASM modules
npm run build:wasm

# Start development server
npm run dev
```

## Development Workflow

### Working on JavaScript Components

```bash
# Start dev server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Check specific component
node src/lisp/example.js
node src/algol/example.js
node src/orchestrator/example.js
```

### Working on WASM Modules

#### Rust Module

```bash
cd wasm/rust

# Build
wasm-pack build --target web --out-dir ../../public/wasm/rust

# Or use npm script
npm run build:rust

# Test locally
node ../../wasm/rust/example.js
```

#### Fortran Module

```bash
cd wasm/fortran

# Build
bash build.sh

# Or use npm script
npm run build:fortran

# Test locally
node ../../src/fortran/example.js
```

### Working on Smart Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local blockchain
npx hardhat node

# Deploy (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### Working on External Services

#### Quantum Service

```bash
cd services/quantum

# Install dependencies
pip install -r requirements.txt

# Run service
python app.py

# Test
python test_service.py
```

#### Bio Sensor Service

```bash
cd services/biosensor

# Install dependencies (on Raspberry Pi)
bash setup_sensors.sh

# Run service
python app.py

# Test
python test_service.py
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npx vitest src/terminal/terminal.test.js

# Run with UI
npx vitest --ui
```

### Integration Tests

```bash
# ALGOL compiler
node src/algol/integration-test.js

# Orchestrator
node src/orchestrator/integration-test.js

# Smart contracts
cd contracts && npx hardhat test
```

### Manual Testing

```bash
# Test Lisp interpreter
node src/lisp/example.js

# Test ALGOL compiler
node src/algol/example.js

# Test Fortran engine
node src/fortran/example.js

# Test orchestrator
node src/orchestrator/example.js

# Test terminal
node src/terminal/example.js

# Test blockchain bridge
node src/blockchain/example.js

# Test quantum client
node src/quantum/example.js

# Test bio sensor client
node src/biosensor/example.js
```

## Common Tasks

### Building for Production

```bash
# Build with all optimizations
npm run build:optimized

# This runs:
# 1. npm run build:all (contracts + WASM)
# 2. npm run optimize:wasm (WASM optimization)
# 3. npm run build (Vite production build)

# Or manually:
npm run build:contracts
npm run build:wasm
npm run optimize:wasm
npm run build
```

### Optimizing WASM Modules

```bash
# Optimize all WASM modules with wasm-opt
npm run optimize:wasm       # Linux/macOS
npm run optimize:wasm:win   # Windows

# This reduces WASM size by 20-30%
# Requires binaryen (wasm-opt) installed
```

### Performance Monitoring

```bash
# In terminal UI:
> perf-show      # Display performance dashboard
> perf-summary   # Show summary
> perf-health    # Check health
> perf-export    # Export metrics to JSON
> perf-reset     # Reset metrics

# Programmatically:
import { performanceMonitor } from './src/monitoring/performance-monitor.js';

performanceMonitor.startTimer('ourocode', 'compile-1');
// ... operation ...
performanceMonitor.endTimer('ourocode', 'compile-1');

const summary = performanceMonitor.getSummary();
const health = performanceMonitor.checkHealth();
```

### Deploying to Production

```bash
# Use deployment script
bash scripts/deploy.sh production     # Linux/macOS
scripts\deploy.cmd production         # Windows

# Or manually:
npm run build:optimized
netlify deploy --prod
# OR
firebase deploy
```

### Adding a New Lisp Built-in Function

Edit `src/lisp/interpreter.js`:

```javascript
// In createGlobalEnvironment()
env.define('my-function', (arg1, arg2) => {
  // Implementation
  return result;
});
```

### Adding a New ALGOL Construct

1. Add token to `src/algol/lexer.js`
2. Add parsing logic to `src/algol/parser.js`
3. Add code generation to `src/algol/codegen.js`
4. Test with `src/algol/integration-test.js`

### Adding a New Terminal Command

Edit `src/terminal/commands.js`:

```javascript
// In setupCommands()
this.terminal.registerCommand('mycommand', (args) => this.handleMyCommand(args));

// Add handler
handleMyCommand(args) {
  // Implementation
  this.terminal.writeLine('Result', 'success');
}
```

### Adding a New Orchestrator Message Type

Edit `src/orchestrator/message-handlers.js`:

```javascript
// Create handler
static createMyHandler(component) {
  return async (message) => {
    // Validate
    const validation = MessageValidator.validate(message);
    if (!validation.valid) {
      return MessageValidator.createErrorResponse('mytype', validation.errors);
    }
    
    // Process
    const result = await component.process(message.payload);
    
    return MessageValidator.createSuccessResponse('mytype', result);
  };
}

// Register in setupMessageHandlers()
const handler = MessageHandlerFactory.createMyHandler(components.myComponent);
queue.registerHandler('mytype', handler);
orchestrator.subscribe('mytype', (msg) => queue.enqueue(msg));
```

### Adding a New Smart Contract Function

Edit `contracts/contracts/OuroborosDAO.sol`:

```solidity
function myFunction(uint256 param) public {
    // Implementation
    emit MyEvent(param);
}
```

Then:
1. Recompile: `cd contracts && npx hardhat compile`
2. Update ABI in `src/config/index.js`
3. Add method to `src/blockchain/blockchain-bridge.js`

## Debugging

### JavaScript Debugging

```bash
# Use browser DevTools
npm run dev
# Open http://localhost:3000
# Press F12 for DevTools

# Use Node.js debugger
node --inspect-brk src/lisp/example.js
# Open chrome://inspect in Chrome
```

### WASM Debugging

```bash
# Check WASM loading
# In browser console:
console.log(await WebAssembly.instantiate(...))

# Check Rust WASM
wasm-pack build --dev  # Build with debug symbols

# Check Fortran WASM
# Add -g flag to emcc in build.sh
```

### Smart Contract Debugging

```bash
cd contracts

# Use Hardhat console
npx hardhat console --network localhost

# Use console.log in contracts
# Add: import "hardhat/console.sol";
# Use: console.log("Debug:", value);
```

## Performance Profiling

### JavaScript Profiling

```javascript
// In browser DevTools Performance tab
// Record → Perform action → Stop

// Or use console.time
console.time('operation');
// ... code ...
console.timeEnd('operation');
```

### WASM Profiling

```javascript
// Measure WASM call time
const start = performance.now();
const result = wasmFunction();
const duration = performance.now() - start;
console.log(`WASM call took ${duration}ms`);
```

## Code Style

### JavaScript

- Use ES6+ features (modules, arrow functions, async/await)
- Prefer `const` over `let`, avoid `var`
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Rust

- Follow Rust naming conventions (snake_case)
- Use `#[wasm_bindgen]` for exported functions
- Add doc comments with `///`
- Handle errors with `Result<T, JsValue>`

### Solidity

- Follow Solidity style guide
- Use NatSpec comments (`///` or `/**`)
- Emit events for state changes
- Use modifiers for access control

## Documentation

### Adding Component Documentation

Each component should have:
- `README.md` - Overview, API, usage examples
- `IMPLEMENTATION.md` - Implementation details (optional)
- `INTEGRATION.md` - Integration guide (optional)
- `example.js` - Working examples

### Updating Main Documentation

When adding features, update:
- `README.md` - Main project README
- `README.chimera.md` - Chimera-specific README
- `STATUS.md` - Implementation status
- `.kiro/specs/*/tasks.md` - Task completion status

## Troubleshooting

### WASM Build Fails

```bash
# Rust: Update toolchain
rustup update

# Rust: Clean and rebuild
cd wasm/rust
cargo clean
wasm-pack build --target web

# Fortran: Check f2c
which f2c
# If missing, install platform-specific

# Fortran: Check Emscripten
emcc --version
# If missing, install from https://emscripten.org
```

### Service Connection Fails

```bash
# Check service is running
curl http://localhost:5000/api/quantum/health
curl http://localhost:5001/api/sensors/health

# Enable mock mode
# In .env:
VITE_QUANTUM_MOCK=true
VITE_BIOSENSOR_MOCK=true
```

### Blockchain Connection Fails

```bash
# Start local blockchain
cd contracts
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Update contract address in .env
VITE_CONTRACT_ADDRESS=<deployed_address>
```

## Resources

### Documentation
- [Vite Docs](https://vitejs.dev/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [Emscripten Docs](https://emscripten.org/docs/)
- [Hardhat Docs](https://hardhat.org/docs)
- [ethers.js Docs](https://docs.ethers.org/)
- [Qiskit Docs](https://qiskit.org/documentation/)

### Project Documentation
- [OuroborOS-Chimera Design](./.kiro/specs/ouroboros-chimera/design.md)
- [Status Document](./STATUS.md)
- [Component READMEs](./src/)
- **[Terminal Commands](./docs/TERMINAL-COMMANDS.md)** - Complete command reference
- **[Service Setup](./docs/SERVICE-SETUP.md)** - Service configuration guide
- **[Deployment Guide](./docs/DEPLOYMENT-GUIDE.md)** - Production deployment
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture
- **[Ourocode Spec](./docs/OUROCODE-SPEC.md)** - IR specification

### Getting Help

1. Check component README files
2. Review example files
3. Check STATUS.md for known issues
4. Review integration test files
5. Check .kiro/specs/ for requirements

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Update documentation
4. Run tests: `npm test`
5. Build: `npm run build:all`
6. Submit pull request

## License

MIT
