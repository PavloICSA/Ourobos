# OuroborOS-Chimera Architecture

**Repository:** https://www.github.com/PavloICSA/Ourobos.git

Comprehensive architecture overview of the OuroborOS-Chimera system.

## Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Design Patterns](#design-patterns)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)

---

## System Overview

OuroborOS-Chimera is a polyglot digital organism that combines seven distinct technology layers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser Runtime                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │         Pascal Terminal UI (Free Pascal → WASM)               │  │
│  │         Commands: propose-mutation, vote, query-chain         │  │
│  └─────────────────────┬─────────────────────────────────────────┘  │
│                        │                                             │
│  ┌─────────────────────▼─────────────────────────────────────────┐  │
│  │              JavaScript Orchestrator                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │  │
│  │  │Meta-Compiler │  │  Blockchain  │  │  Quantum Client  │    │  │
│  │  │(Ourocode Gen)│  │    Bridge    │  │  (Qiskit API)    │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘    │  │
│  └────────────────────────────┬──────────────────────────────────┘  │
│                               │                                      │
│  ┌────────────────────────────▼──────────────────────────────────┐  │
│  │                    WASM Runtime Layer                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │   Rust   │  │ Fortran  │  │    Go    │  │  Lisp/ALGOL  │  │  │
│  │  │  State   │  │ Numeric  │  │  Neural  │  │  Interpreter │  │  │
│  │  │  Engine  │  │  Engine  │  │ Clusters │  │              │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Visualization: Mandelbrot Fractal + Blockchain Timeline      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ WebSocket / HTTP
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      External Services Layer                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Ethereum Node   │  │  IBM Quantum     │  │  Raspberry Pi    │  │
│  │  (Hardhat/Geth)  │  │  (Qiskit API)    │  │  Bio Sensors     │  │
│  │  Solidity DAO    │  │  Quantum Circuits│  │  Light/Temp/Accel│  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Pascal Terminal UI

**Technology**: Free Pascal → WebAssembly

**Responsibilities**:
- User interface and command input
- Display organism status
- Show blockchain events
- Render performance metrics

**Key Files**:
- `wasm/pascal/terminal.pas` - Main terminal implementation
- `src/pascal/pascal-bridge.js` - JavaScript bridge

**Communication**:
- Calls JavaScript functions via WASM imports
- Receives display updates via WASM exports

---

### 2. JavaScript Orchestrator

**Technology**: ES6+ JavaScript

**Responsibilities**:
- Coordinate all system components
- Manage mutation lifecycle
- Handle service health monitoring
- Implement lazy loading

**Key Files**:
- `src/orchestrator/chimera-orchestrator.js` - Main orchestrator
- `src/orchestrator/message-bus.js` - Event system
- `src/config/environment.js` - Configuration management

**Design Patterns**:
- **Mediator Pattern**: Coordinates component communication
- **Observer Pattern**: Event-driven architecture
- **Circuit Breaker**: Service failure handling

---

### 3. Blockchain Bridge

**Technology**: ethers.js + Solidity

**Responsibilities**:
- Submit mutation proposals
- Handle voting
- Execute approved mutations
- Query genome history

**Key Files**:
- `src/blockchain/blockchain-bridge.js` - JavaScript client
- `contracts/OuroborosDAO.sol` - Smart contract
- `contracts/scripts/deploy.js` - Deployment script

**Smart Contract Functions**:
- `proposeMutation(genomeHash, ourocodeHash)` - Create proposal
- `vote(proposalId, support)` - Cast vote
- `executeProposal(proposalId)` - Execute approved proposal
- `getGenomeHistory(generation)` - Query history

---

### 4. Quantum Entropy Client

**Technology**: Python (Qiskit) + Flask API

**Responsibilities**:
- Generate quantum random bits
- Cache entropy for performance
- Fallback to classical entropy

**Key Files**:
- `services/quantum/quantum_entropy.py` - Qiskit implementation
- `src/quantum/quantum-client.js` - JavaScript client

**Quantum Circuit**:
```
     ┌───┐┌─┐
q_0: ┤ H ├┤M├
     ├───┤└╥┘
q_1: ┤ H ├─╫─
     ├───┤ ║
q_2: ┤ H ├─╫─
     └───┘ ║
c: 3/══════╩═
           0
```

---

### 5. Bio Sensor Network

**Technology**: Python + Raspberry Pi GPIO

**Responsibilities**:
- Read physical sensors
- Normalize sensor values
- Provide environmental feedback

**Key Files**:
- `services/biosensor/bio_sensor_node.py` - Sensor interface
- `src/biosensor/biosensor-client.js` - JavaScript client

**Sensors**:
- **TSL2561**: Light intensity (0-1000 lux)
- **DHT22**: Temperature (0-40°C)
- **MPU6050**: Acceleration (0-20 m/s²)

---

### 6. Meta-Compiler

**Technology**: JavaScript/TypeScript

**Responsibilities**:
- Compile source languages to Ourocode
- Validate Ourocode syntax
- Generate cryptographic hashes

**Key Files**:
- `src/metacompiler/meta-compiler.js` - Main compiler
- `src/metacompiler/ourocode-executor.js` - Interpreter
- `docs/OUROCODE-SPEC.md` - Specification

**Supported Languages**:
- ALGOL
- Lisp
- Pascal
- Rust
- Go
- Fortran

---

### 7. WASM Runtime Layer

#### Rust State Engine

**Responsibilities**:
- Fast organism state management
- Rule registry
- Memory-efficient operations

**Key Files**:
- `wasm/rust/src/lib.rs` - Main module
- `wasm/rust/src/state.rs` - State management

#### Fortran Numeric Engine

**Responsibilities**:
- Differential equation solving
- Logistic growth calculations
- Mutation probability

**Key Files**:
- `wasm/fortran/numeric_engine.f90` - Fortran implementation
- `src/fortran/fortran-wrapper.js` - JavaScript wrapper

#### Go Neural Clusters

**Responsibilities**:
- Concurrent decision-making
- Goroutine-based parallelism
- State-based actions

**Key Files**:
- `wasm/go/neural_cluster.go` - Go implementation
- `src/go-bridge/go-neural-clusters.js` - JavaScript bridge

#### Lisp/ALGOL Interpreter

**Responsibilities**:
- Dynamic rule execution
- Self-modification
- Sandboxed evaluation

**Key Files**:
- `src/lisp/interpreter.js` - Lisp interpreter
- `src/algol/compiler.js` - ALGOL compiler

---

### 8. Visualization Engine

**Technology**: Canvas API + D3.js

**Responsibilities**:
- Render organism state
- Display blockchain timeline
- Show fractal neural topology
- Performance graphs

**Key Files**:
- `src/visualization/visualizer.js` - Main visualizer
- `src/visualization/fractal-renderer.js` - Fractal rendering
- `src/visualization/graph-renderer.js` - Graph rendering

---

### 9. Performance Monitor

**Technology**: JavaScript Performance API

**Responsibilities**:
- Track compilation time
- Monitor service latency
- Measure frame rate
- Health checks

**Key Files**:
- `src/monitoring/performance-monitor.js` - Metrics collection
- `src/monitoring/performance-dashboard.js` - UI display

---

## Data Flow

### Mutation Lifecycle

```
1. User Input
   └─> Pascal Terminal: "propose-mutation"

2. Code Compilation
   └─> Meta-Compiler: ALGOL → Ourocode
   └─> Validation: Syntax + Semantics
   └─> Hashing: SHA-256(Ourocode)

3. Blockchain Proposal
   └─> Blockchain Bridge: Submit to DAO
   └─> Smart Contract: Create proposal
   └─> Event: ProposalCreated

4. Voting Period (60s)
   └─> Users: Cast votes
   └─> Smart Contract: Record votes
   └─> Event: VoteCast

5. Proposal Execution
   └─> Blockchain Bridge: Execute proposal
   └─> Quantum Client: Fetch entropy
   └─> Bio Sensor Client: Read sensors
   └─> Ourocode Executor: Run mutation
   └─> Runtime: Update state (Rust/Go/Fortran/Lisp)
   └─> Smart Contract: Record genome hash
   └─> Event: GenomeRecorded

6. Visualization Update
   └─> Visualizer: Render new state
   └─> Terminal: Display confirmation
```

---

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Vite** | Build tool | 5.0+ |
| **JavaScript** | Orchestration | ES6+ |
| **D3.js** | Visualization | 7.8+ |
| **Canvas API** | Rendering | - |

### WASM Modules

| Language | Purpose | Compiler |
|----------|---------|----------|
| **Rust** | State engine | wasm-pack |
| **Fortran** | Numeric engine | Emscripten |
| **Go** | Neural clusters | GOOS=js GOARCH=wasm |
| **Pascal** | Terminal UI | Free Pascal |

### Blockchain

| Technology | Purpose | Version |
|------------|---------|---------|
| **Solidity** | Smart contracts | 0.8.20 |
| **Hardhat** | Development | 2.19+ |
| **ethers.js** | JavaScript client | 6.9+ |

### External Services

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Quantum** | Python + Qiskit | Entropy generation |
| **Bio Sensors** | Python + GPIO | Physical feedback |
| **Blockchain** | Ethereum | Governance |

---

## Design Patterns

### 1. Mediator Pattern

**Orchestrator** acts as mediator between components:

```javascript
class ChimeraOrchestrator {
  async proposeMutation(code, language) {
    // Coordinates: compiler, blockchain, quantum, biosensor
    const ourocode = await this.metaCompiler.compile(code, language);
    const proposalId = await this.blockchainBridge.propose(ourocode);
    return proposalId;
  }
}
```

### 2. Circuit Breaker Pattern

**Service health monitoring** with automatic fallback:

```javascript
class ServiceHealthMonitor {
  async checkHealth() {
    try {
      await this.quantumClient.healthCheck();
    } catch {
      this.quantumClient.useMock = true; // Fallback
    }
  }
}
```

### 3. Observer Pattern

**Event-driven architecture** for blockchain events:

```javascript
blockchainBridge.onProposalCreated((id, hash) => {
  terminal.display(`Proposal #${id} created`);
  visualizer.updateTimeline();
});
```

### 4. Strategy Pattern

**Runtime selection** based on language:

```javascript
executeInRuntime(module, params) {
  switch (module.source) {
    case 'rust': return this.rustEngine.execute(module);
    case 'go': return this.goNeuralClusters.execute(module);
    case 'fortran': return this.fortranEngine.execute(module);
    case 'lisp': return this.lispInterpreter.execute(module);
  }
}
```

### 5. Lazy Loading Pattern

**On-demand service loading**:

```javascript
async loadQuantumClient() {
  if (!this.quantumClient) {
    const module = await import('./quantum/quantum-client.js');
    this.quantumClient = new module.QuantumEntropyClient();
  }
  return this.quantumClient;
}
```

---

## Security Architecture

### Smart Contract Security

**Reentrancy Protection**:
```solidity
bool private locked;

modifier noReentrant() {
    require(!locked, "No reentrancy");
    locked = true;
    _;
    locked = false;
}
```

**Access Control**:
```solidity
mapping(address => bool) public authorizedProposers;

modifier onlyAuthorized() {
    require(authorizedProposers[msg.sender], "Not authorized");
    _;
}
```

### Ourocode Sandboxing

**Execution Limits**:
- Maximum instructions: 100,000
- Maximum memory: 10MB
- Timeout: 1 second
- No external calls
- No I/O operations

### API Security

**Rate Limiting**:
```python
@limiter.limit("10 per minute")
def get_entropy():
    # ...
```

**Authentication**:
```python
@require_api_key
def get_readings():
    # ...
```

---

## Performance Considerations

### Bundle Optimization

**Code Splitting**:
- Vendor chunks (d3, ethers)
- Feature chunks (blockchain, quantum, biosensor)
- Lazy-loaded services

**WASM Optimization**:
```bash
wasm-opt -Oz --enable-bulk-memory module.wasm -o module.wasm
```

### Caching Strategy

**Quantum Entropy Pool**:
- Pre-fetch 10 entropy values
- Refill when pool < 50%
- Cache hit rate: ~95%

**Service Health Cache**:
- Check every 30 seconds
- Cache results for 10 seconds
- Automatic reconnection

### Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Ourocode compilation | <10ms | ~8ms |
| Blockchain latency (local) | <500ms | ~245ms |
| Quantum response (cached) | <10ms | ~5ms |
| Bio sensor poll | <100ms | ~45ms |
| Visualization FPS | 30fps | ~58fps |

---

## Deployment Architecture

### Static Hosting

```
CDN (Netlify/Firebase)
├── index.html
├── assets/
│   ├── js/ (code-split chunks)
│   ├── css/
│   └── wasm/
└── contracts/config.json
```

### Service Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
┌──────▼──────┐ ┌───▼────────┐
│  Blockchain │ │  Quantum   │
│   (Sepolia) │ │  (Cloud)   │
└─────────────┘ └────────────┘
       │
┌──────▼──────┐
│ Bio Sensors │
│ (Raspberry) │
└─────────────┘
```

---

## See Also

- [Ourocode Specification](OUROCODE-SPEC.md)
- [Service Setup Guide](SERVICE-SETUP.md)
- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [Developer Guide](DEVELOPER-GUIDE.md)
