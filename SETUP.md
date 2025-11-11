# Setup Guide

Complete setup instructions for OuroborOS-Chimera.

**Repository:** https://www.github.com/PavloICSA/Ourobos.git

## Prerequisites

### Required

1. **Node.js 18+** and npm
   - Download: https://nodejs.org/
   - Verify: `node --version && npm --version`

2. **Rust toolchain**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustc --version
   ```

3. **wasm-pack**
   ```bash
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   wasm-pack --version
   ```

### Optional (for full features)

4. **Emscripten SDK** (for Fortran WASM)
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

5. **Go 1.21+** (for Go WASM)
   - Download: https://golang.org/dl/
   - Verify: `go version`

6. **Free Pascal** (for Pascal terminal)
   - Download: https://www.freepascal.org/download.html
   - Verify: `fpc -version`

7. **Python 3.9+** (for external services)
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

8. **Docker** (optional, for containerized services)
   - Download: https://www.docker.com/get-started
   - Verify: `docker --version`

## Installation

### 1. Clone Repository

```bash
git clone https://www.github.com/PavloICSA/Ourobos.git
cd Ourobos
```

### 2. Install JavaScript Dependencies

```bash
npm install
```

### 3. Install Contract Dependencies (Optional)

```bash
cd contracts
npm install
cd ..
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 5. Build Components

#### Option A: Quick Build (Core Only)

```bash
# Build Rust and Fortran WASM
npm run build:rust
npm run build:fortran

# Start development server
npm run dev
```

#### Option B: Full Build (All Components)

**Linux/Mac:**
```bash
bash build_all.sh
```

**Windows:**
```bash
build_all.cmd
```

This builds:
- Rust WASM orchestrator
- Fortran WASM numeric engine
- Go WASM neural clusters
- Pascal WASM terminal
- Solidity smart contracts
- Frontend application

## Running the System

### Option 1: Core System Only (Recommended for First Run)

```bash
npm run dev
```

Access at `http://localhost:3000`

The system runs with mock services for blockchain, quantum, and biosensor features.

### Option 2: With Docker Compose (All Services)

```bash
docker-compose up
```

This starts:
- Hardhat blockchain node (port 8545)
- Quantum entropy service (port 5000)
- Frontend dev server (port 3000)

### Option 3: Manual Service Setup

#### Terminal 1: Blockchain

```bash
cd contracts
npm run blockchain:start
```

Wait for "Started HTTP and WebSocket JSON-RPC server"

#### Terminal 2: Deploy Contracts

```bash
cd contracts
npm run deploy:contracts
```

Copy the contract address to `.env`:
```
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

#### Terminal 3: Quantum Service (Optional)

```bash
cd services/quantum
pip install -r requirements.txt
python quantum_entropy.py
```

Or enable mock mode in `.env`:
```
VITE_QUANTUM_MOCK=true
```

#### Terminal 4: Bio Sensor Service (Optional)

On Raspberry Pi:
```bash
cd services/biosensor
pip install -r requirements.txt
python bio_sensor_node.py
```

Or enable mock mode in `.env`:
```
VITE_BIOSENSOR_MOCK=true
```

#### Terminal 5: Frontend

```bash
npm run dev
```

## Verification

### Check WASM Modules

```bash
ls -la public/wasm/
```

Should see:
- `rust/` - Rust orchestrator
- `fortran/` - Fortran numeric engine
- `go/` - Go neural clusters (if built)
- `pascal/` - Pascal terminal (if built)

### Test in Browser

1. Open `http://localhost:3000`
2. Type `status` to check system health
3. Type `help` to see available commands
4. Type `lisp` to enter REPL mode
5. Try `(+ 1 2 3)` - should return `6`

### Test Services

```bash
# Blockchain
curl http://localhost:8545

# Quantum
curl http://localhost:5000/api/quantum/health

# Bio Sensors
curl http://raspberrypi.local:5001/api/sensors/health
```

## Troubleshooting

### WASM Build Fails

**Rust:**
```bash
rustup update
rustup target add wasm32-unknown-unknown
cd wasm/rust
cargo clean
wasm-pack build --target web
```

**Fortran:**
```bash
# Check Emscripten
emcc --version

# Check f2c
which f2c

# Rebuild
cd wasm/fortran
bash build.sh
```

**Go:**
```bash
export GOOS=js
export GOARCH=wasm
cd wasm/go
go build -o ../../public/wasm/go/neural_cluster.wasm
```

### Blockchain Connection Failed

1. Check Hardhat is running: `ps aux | grep hardhat`
2. Verify RPC URL in `.env`: `VITE_BLOCKCHAIN_RPC=http://localhost:8545`
3. Deploy contracts: `cd contracts && npm run deploy:contracts`
4. Update contract address in `.env`
5. Or enable mock mode: `VITE_BLOCKCHAIN_MOCK=true`

### Services Unavailable

Enable mock mode for offline development:
```bash
# .env
VITE_MOCK_ALL=true
```

Or individually:
```bash
VITE_QUANTUM_MOCK=true
VITE_BIOSENSOR_MOCK=true
VITE_BLOCKCHAIN_MOCK=true
```

### Port Already in Use

Change ports in configuration:
- Vite: `vite.config.js` (default 3000)
- Hardhat: `contracts/hardhat.config.js` (default 8545)
- Quantum: `services/quantum/quantum_entropy.py` (default 5000)
- Bio Sensor: `services/biosensor/bio_sensor_node.py` (default 5001)

## Environment Variables

### Core Settings

```bash
# .env
NODE_ENV=development
VITE_LOG_LEVEL=info
```

### Blockchain Settings

```bash
# Local development
VITE_BLOCKCHAIN_RPC=http://localhost:8545
VITE_CHAIN_ID=1337
VITE_CONTRACT_ADDRESS=0x...
VITE_BLOCKCHAIN_MOCK=false

# Or use mock mode
VITE_BLOCKCHAIN_MOCK=true
```

### Service Settings

```bash
# Quantum
VITE_QUANTUM_API=http://localhost:5000
VITE_QUANTUM_MOCK=false

# Bio Sensors
VITE_BIOSENSOR_API=http://raspberrypi.local:5001
VITE_BIOSENSOR_MOCK=false

# Or enable all mocks
VITE_MOCK_ALL=true
```

## Development Workflow

### 1. Start Services

```bash
# Option A: Docker
docker-compose up -d

# Option B: Manual
# Start blockchain, quantum, biosensor in separate terminals
```

### 2. Start Dev Server

```bash
npm run dev
```

### 3. Make Changes

- Edit source files in `src/`
- Vite hot-reloads automatically

### 4. Rebuild WASM (if needed)

```bash
npm run build:rust    # After Rust changes
npm run build:fortran # After Fortran changes
npm run build:go      # After Go changes
```

### 5. Run Tests

```bash
npm test              # Frontend tests
cd contracts && npm test  # Contract tests
```

## Production Build

### Build for Production

```bash
# Full optimized build
npm run build:optimized
```

This runs:
1. `npm run build:all` - Build contracts + WASM
2. `npm run optimize:wasm` - Optimize WASM modules
3. `npm run build` - Build frontend

### Deploy

Upload `dist/` folder to:
- Netlify: `netlify deploy --prod`
- Firebase: `firebase deploy`
- Vercel: `vercel --prod`
- Any static host

### Production Environment

Update `.env.production`:
```bash
VITE_BLOCKCHAIN_RPC=https://sepolia.infura.io/v3/YOUR_KEY
VITE_CONTRACT_ADDRESS=0x...
VITE_QUANTUM_API=https://quantum.yourdomain.com
VITE_BIOSENSOR_API=http://your-pi-ip:5001
```

## Next Steps

1. Read [README.md](./README.md) for feature overview
2. Read [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing procedures
3. Explore component READMEs in `src/*/README.md`
4. Try example programs in `/programs` directory

## Support

For issues:
1. Check troubleshooting section above
2. Review component READMEs
3. Check service logs: `docker-compose logs`
4. Verify all prerequisites installed
5. Try mock mode for offline development

---

**Happy coding!** 🚀
