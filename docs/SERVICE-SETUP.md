# Service Setup Guide

This guide covers setting up all external services required for OuroborOS-Chimera: blockchain, quantum entropy, and bio sensors.

## Table of Contents

- [Overview](#overview)
- [Blockchain Setup](#blockchain-setup)
- [Quantum Entropy Service](#quantum-entropy-service)
- [Bio Sensor Network](#bio-sensor-network)
- [Docker Compose Setup](#docker-compose-setup)
- [Mock Mode](#mock-mode)

---

## Overview

OuroborOS-Chimera integrates with three external services:

1. **Blockchain (Ethereum)** - For decentralized governance and provenance
2. **Quantum Entropy** - For true random number generation
3. **Bio Sensors** - For physical world interaction

Each service can run in **real mode** (with actual hardware/services) or **mock mode** (simulated).

### Quick Start Matrix

| Use Case | Blockchain | Quantum | Bio Sensors |
|----------|-----------|---------|-------------|
| **Full Local** | Hardhat | Simulator | Mock |
| **Mock Only** | Mock | Mock | Mock |
| **Production** | Testnet/Mainnet | IBM Quantum | Raspberry Pi |

---

## Blockchain Setup

### Option 1: Local Hardhat Network (Recommended for Development)

**Prerequisites:**
- Node.js 18+
- npm

**Steps:**

1. **Install dependencies:**
   ```bash
   cd contracts
   npm install
   ```

2. **Start Hardhat node:**
   ```bash
   npm run blockchain:start
   ```
   
   This starts a local Ethereum node at `http://localhost:8545`

3. **Deploy contracts:**
   ```bash
   npm run deploy:contracts
   ```
   
   This deploys the OuroborosDAO contract and saves the address to `src/contracts/config.json`

4. **Configure frontend:**
   ```bash
   # In .env.local
   VITE_BLOCKCHAIN_RPC=http://localhost:8545
   VITE_CHAIN_ID=1337
   VITE_CONTRACT_ADDRESS=<address from deployment>
   ```

**Hardhat Features:**
- Instant mining (no waiting for blocks)
- 10 pre-funded test accounts
- Full Ethereum JSON-RPC support
- Console logging from contracts

---

### Option 2: Ganache

**Prerequisites:**
- Ganache CLI or GUI

**Steps:**

1. **Install Ganache CLI:**
   ```bash
   npm install -g ganache
   ```

2. **Start Ganache:**
   ```bash
   ganache --port 8545 --chainId 1337
   ```

3. **Deploy contracts:**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

---

### Option 3: Public Testnet (Sepolia)

**Prerequisites:**
- Ethereum wallet with testnet ETH
- Infura or Alchemy account

**Steps:**

1. **Get testnet ETH:**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request testnet ETH

2. **Configure Hardhat:**
   ```javascript
   // contracts/hardhat.config.js
   module.exports = {
     networks: {
       sepolia: {
         url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
         accounts: [PRIVATE_KEY]
       }
     }
   };
   ```

3. **Deploy to Sepolia:**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Configure frontend:**
   ```bash
   # In .env.local
   VITE_BLOCKCHAIN_RPC=https://sepolia.infura.io/v3/YOUR_KEY
   VITE_CHAIN_ID=11155111
   VITE_CONTRACT_ADDRESS=<deployed address>
   ```

---

### Mock Blockchain Mode

For testing without any blockchain:

```bash
# In .env.local
VITE_BLOCKCHAIN_MOCK=true
VITE_ENABLE_BLOCKCHAIN=false
```

Mock mode provides:
- In-memory ledger
- Instant transactions
- No network required
- Simulated voting and execution

---

## Quantum Entropy Service

### Option 1: Local Qiskit Simulator (Recommended for Development)

**Prerequisites:**
- Python 3.8+
- pip

**Steps:**

1. **Install dependencies:**
   ```bash
   cd services/quantum
   pip install -r requirements.txt
   ```

2. **Start quantum service:**
   ```bash
   python quantum_entropy.py
   ```
   
   Service runs at `http://localhost:5000`

3. **Configure frontend:**
   ```bash
   # In .env.local
   VITE_QUANTUM_API=http://localhost:5000
   VITE_QUANTUM_MOCK=false
   ```

**Features:**
- Uses Qiskit's qasm_simulator
- Generates quantum random bits via Hadamard gates
- Fast local execution
- No API token required

---

### Option 2: IBM Quantum Hardware

**Prerequisites:**
- IBM Quantum account
- API token from [IBM Quantum](https://quantum-computing.ibm.com/)

**Steps:**

1. **Get API token:**
   - Sign up at [IBM Quantum](https://quantum-computing.ibm.com/)
   - Copy your API token

2. **Configure service:**
   ```bash
   # In services/quantum/.env
   QISKIT_API_TOKEN=your_token_here
   ```

3. **Update quantum service:**
   ```python
   # services/quantum/quantum_entropy.py
   entropy_source = QuantumEntropySource(
       use_real_hardware=True,
       api_token=os.getenv('QISKIT_API_TOKEN')
   )
   ```

4. **Start service:**
   ```bash
   cd services/quantum
   python quantum_entropy.py
   ```

**Note:** Real quantum hardware has:
- Limited availability (queue times)
- Rate limits
- Higher latency (2-10 seconds)
- True quantum randomness

---

### Mock Quantum Mode

For testing without quantum service:

```bash
# In .env.local
VITE_QUANTUM_MOCK=true
```

Mock mode uses:
- WebCrypto API for randomness
- Instant generation
- No network required
- Cryptographically secure (but not quantum)

---

## Bio Sensor Network

### Option 1: Raspberry Pi with Real Sensors

**Hardware Required:**
- Raspberry Pi 4 (or 3B+)
- TSL2561 light sensor
- DHT22 temperature sensor
- MPU6050 accelerometer
- Breadboard and jumper wires

**Steps:**

1. **Wire sensors:**
   ```
   TSL2561 (I2C):
     VCC → 3.3V
     GND → GND
     SDA → GPIO 2 (SDA)
     SCL → GPIO 3 (SCL)
   
   DHT22:
     VCC → 5V
     GND → GND
     DATA → GPIO 4
   
   MPU6050 (I2C):
     VCC → 3.3V
     GND → GND
     SDA → GPIO 2 (SDA)
     SCL → GPIO 3 (SCL)
   ```

2. **Run setup script:**
   ```bash
   cd services/biosensor
   bash setup_sensors.sh
   ```
   
   This script:
   - Installs Python dependencies
   - Enables I2C interface
   - Creates systemd service
   - Starts bio sensor API

3. **Verify installation:**
   ```bash
   curl http://raspberrypi.local:5001/api/sensors/health
   ```

4. **Configure frontend:**
   ```bash
   # In .env.local
   VITE_BIOSENSOR_API=http://raspberrypi.local:5001
   VITE_BIOSENSOR_MOCK=false
   ```

**Troubleshooting:**
- If I2C not working: `sudo raspi-config` → Interface Options → I2C → Enable
- Check sensor connections: `i2cdetect -y 1`
- View service logs: `sudo journalctl -u biosensor -f`

---

### Option 2: Mock Sensors (No Hardware)

For testing without Raspberry Pi:

```bash
# In .env.local
VITE_BIOSENSOR_MOCK=true
```

Mock mode provides:
- Simulated sensor readings
- Smooth sinusoidal curves
- No hardware required
- Realistic value ranges

---

## Docker Compose Setup

Run all services with Docker Compose:

**Prerequisites:**
- Docker
- Docker Compose

**Steps:**

1. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```
   
   This starts:
   - Hardhat blockchain node (port 8545)
   - Quantum entropy service (port 5000)
   - Frontend dev server (port 3000)

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  hardhat:
    image: node:18
    working_dir: /app
    volumes:
      - ./contracts:/app
    command: npx hardhat node
    ports:
      - "8545:8545"
  
  quantum:
    build:
      context: ./services/quantum
    ports:
      - "5000:5000"
    environment:
      - QISKIT_API_TOKEN=${QISKIT_API_TOKEN}
  
  frontend:
    image: node:18
    working_dir: /app
    volumes:
      - .:/app
    command: npm run dev
    ports:
      - "3000:3000"
    depends_on:
      - hardhat
      - quantum
```

---

## Mock Mode

Run entirely without external services:

**Configuration:**
```bash
# In .env.local
VITE_MOCK_ALL=true
VITE_BLOCKCHAIN_MOCK=true
VITE_QUANTUM_MOCK=true
VITE_BIOSENSOR_MOCK=true
```

**Features:**
- No network required
- Instant responses
- Fully functional organism
- Perfect for demos and testing

**Limitations:**
- No blockchain provenance
- Pseudo-random entropy
- Simulated sensor data
- No distributed governance

---

## Service Health Monitoring

Check service health from terminal:

```
> service-health
Service Health:
  ✓ Blockchain: Connected (http://localhost:8545)
  ✓ Quantum: Connected (http://localhost:5000)
  ⚠ Bio Sensors: Mock mode (hardware unavailable)
  ✓ Go WASM: Loaded
```

Or programmatically:

```javascript
import { config } from './src/config/environment.js';
import { BlockchainBridge } from './src/blockchain/blockchain-bridge.js';

const bridge = new BlockchainBridge(
  config.blockchain.rpcUrl,
  config.blockchain.contractAddress,
  abi
);

const isHealthy = await bridge.healthCheck();
console.log('Blockchain healthy:', isHealthy);
```

---

## Troubleshooting

### Blockchain Issues

**Problem:** Cannot connect to blockchain
```
Error: Could not connect to http://localhost:8545
```

**Solutions:**
1. Check if Hardhat is running: `ps aux | grep hardhat`
2. Restart Hardhat: `npm run blockchain:start`
3. Check port availability: `lsof -i :8545`
4. Enable mock mode: `VITE_BLOCKCHAIN_MOCK=true`

---

### Quantum Issues

**Problem:** Quantum service timeout
```
Error: Quantum API timeout after 5000ms
```

**Solutions:**
1. Check if service is running: `curl http://localhost:5000/api/quantum/health`
2. Restart service: `cd services/quantum && python quantum_entropy.py`
3. Increase timeout in config
4. Enable mock mode: `VITE_QUANTUM_MOCK=true`

---

### Bio Sensor Issues

**Problem:** Sensor not detected
```
Error: I2C device not found at address 0x39
```

**Solutions:**
1. Check wiring connections
2. Enable I2C: `sudo raspi-config`
3. Scan I2C bus: `i2cdetect -y 1`
4. Check sensor power (3.3V or 5V)
5. Enable mock mode: `VITE_BIOSENSOR_MOCK=true`

---

## Next Steps

- [User Guide](USER-GUIDE.md) - Learn how to use the system
- [Terminal Commands](TERMINAL-COMMANDS.md) - Command reference
- [Deployment Guide](DEPLOYMENT-GUIDE.md) - Deploy to production
