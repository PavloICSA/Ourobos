# OuroborOS-Chimera Setup Guide

Complete setup instructions for all components.

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

4. **Go 1.21+**
   - Download: https://golang.org/dl/
   - Verify: `go version`

### Optional (for full features)

5. **Emscripten SDK** (for Fortran WASM)
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

6. **Free Pascal** (for Pascal terminal)
   - Download: https://www.freepascal.org/download.html
   - Verify: `fpc -version`

7. **Python 3.9+** (for services)
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

8. **Docker** (optional, for containerized services)
   - Download: https://www.docker.com/get-started
   - Verify: `docker --version`

## Installation Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd ouroboros-chimera
```

### 2. Install JavaScript Dependencies

```bash
npm install
```

### 3. Install Contract Dependencies

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

### 5. Build All Components

#### Option A: Unified Build (Linux/Mac)
```bash
bash build_all.sh
```

#### Option B: Unified Build (Windows)
```bash
build_all.cmd
```

#### Option C: Build Individually
```bash
# Rust WASM
npm run build:rust

# Fortran WASM (requires Emscripten)
npm run build:fortran

# Go WASM
npm run build:go

# Pascal WASM (requires Free Pascal)
npm run build:pascal

# Smart contracts
npm run build:contracts

# Frontend
npm run build
```

## Running the System

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up

# Access at http://localhost:3000
```

This starts:
- Hardhat blockchain node (port 8545)
- Quantum entropy service (port 5000)
- Frontend dev server (port 3000)

### Option 2: Manual Setup

#### Terminal 1: Blockchain

```bash
npm run blockchain:start
```

Wait for "Started HTTP and WebSocket JSON-RPC server"

#### Terminal 2: Deploy Contracts

```bash
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

Access at http://localhost:3000

## Verification

### Check WASM Modules

```bash
ls -la public/wasm/
```

Should see:
- `rust/` - Rust orchestrator
- `fortran/` - Fortran numeric engine
- `go/` - Go neural clusters
- `pascal/` - Pascal terminal (if built)

### Check Smart Contracts

```bash
ls -la contracts/artifacts/contracts/
```

Should see compiled contract artifacts.

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
```

**Go:**
```bash
export GOOS=js
export GOARCH=wasm
go build -o test.wasm
```

**Fortran:**
```bash
emcc --version  # Should show Emscripten version
```

### Blockchain Connection Failed

1. Check Hardhat is running: `npm run blockchain:start`
2. Verify RPC URL in `.env`: `VITE_BLOCKCHAIN_RPC=http://localhost:8545`
3. Deploy contracts: `npm run deploy:contracts`
4. Update contract address in `.env`

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
```

### Port Already in Use

Change ports in configuration:
- Vite: `vite.config.js` (default 3000)
- Hardhat: `contracts/hardhat.config.js` (default 8545)
- Quantum: `services/quantum/quantum_entropy.py` (default 5000)
- Bio Sensor: `services/biosensor/bio_sensor_node.py` (default 5001)

## Development Workflow

### 1. Start Services

```bash
docker-compose up -d
# Or manually start blockchain, quantum, biosensor
```

### 2. Deploy Contracts

```bash
npm run deploy:contracts
```

### 3. Start Dev Server

```bash
npm run dev
```

### 4. Make Changes

- Edit source files in `src/`
- Vite hot-reloads automatically

### 5. Rebuild WASM (if needed)

```bash
npm run build:rust    # After Rust changes
npm run build:go      # After Go changes
# etc.
```

### 6. Run Tests

```bash
npm test              # Frontend tests
cd contracts && npm test  # Contract tests
```

## Production Deployment

### 1. Build Production Bundle

```bash
npm run build:all
```

### 2. Deploy Static Files

Upload `dist/` folder to:
- Netlify
- Firebase Hosting
- Vercel
- Any static host

### 3. Deploy Services

- **Blockchain**: Use Ethereum testnet (Sepolia, Goerli) or mainnet
- **Quantum**: Deploy to cloud VM (AWS, GCP, Azure)
- **Bio Sensors**: Keep on local Raspberry Pi network

### 4. Update Configuration

Update `.env` with production URLs:
```bash
VITE_BLOCKCHAIN_RPC=https://sepolia.infura.io/v3/YOUR_KEY
VITE_CONTRACT_ADDRESS=0x...
VITE_QUANTUM_API=https://quantum.yourdomain.com
VITE_BIOSENSOR_API=http://your-pi-ip:5001
```

## Next Steps

1. Read [README.chimera.md](./README.chimera.md) for usage
2. Review [requirements](./kiro/specs/ouroboros-chimera/requirements.md)
3. Study [design](./kiro/specs/ouroboros-chimera/design.md)
4. Follow [tasks](./kiro/specs/ouroboros-chimera/tasks.md) for implementation

## Support

For issues:
1. Check troubleshooting section above
2. Review component READMEs in subdirectories
3. Check service logs: `docker-compose logs`
4. Verify all prerequisites installed
