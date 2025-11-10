# ChimeraOrchestrator

The ChimeraOrchestrator is the central coordination layer for OuroborOS-Chimera, managing the complete mutation lifecycle across all technology layers.

## Overview

The ChimeraOrchestrator integrates:

- **Blockchain Governance** - Proposal submission, voting, and execution via Solidity smart contracts
- **Quantum Entropy** - True random number generation using Qiskit quantum circuits
- **Bio Sensor Network** - Physical world feedback from Raspberry Pi sensors
- **Meta-Compiler** - Multi-language compilation to Ourocode intermediate representation
- **Runtime Execution** - Dispatch to Rust, Fortran, Go, Lisp, or Pascal runtimes
- **Neural Clusters** - Concurrent decision-making via Go WASM modules
- **Service Health Monitoring** - Automatic fallback and health tracking

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   ChimeraOrchestrator                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Blockchain  │  │   Quantum    │  │   Bio Sensor     │  │
│  │    Bridge    │  │    Client    │  │     Client       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │     Meta     │  │   Ourocode   │  │   Go Neural      │  │
│  │   Compiler   │  │   Executor   │  │    Clusters      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Service Health Monitor                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Initialization

```javascript
import { ChimeraOrchestrator } from './chimera-orchestrator.js';

const orchestrator = new ChimeraOrchestrator({
  enableBlockchain: true,
  enableQuantum: true,
  enableBioSensor: true,
  useMockQuantum: false,
  useMockBioSensor: false
});

await orchestrator.init();
```

### Mutation Proposal Flow

```javascript
// 1. Propose a mutation
const code = `
  IF population > 100 THEN
    mutation_rate := 0.05
  ELSE
    mutation_rate := 0.1
  END
`;

const proposalId = await orchestrator.proposeMutation(code, 'algol');

// 2. Vote on the proposal
await orchestrator.vote(proposalId, true); // Vote YES

// 3. Check voting status
const status = await orchestrator.getVotingStatus(proposalId);
console.log('Votes for:', status.votesFor);
console.log('Votes against:', status.votesAgainst);

// 4. Execute approved mutation (after voting period)
const result = await orchestrator.executeMutation(proposalId);
console.log('New state:', result.newState);
```

### Service Health Monitoring

```javascript
// Get current health status
const health = orchestrator.getServiceHealth();
console.log('Blockchain:', health.blockchain ? 'Online' : 'Offline');
console.log('Quantum:', health.quantum ? 'Online' : 'Mock');

// Get detailed status
const detailed = orchestrator.getDetailedServiceStatus();
console.log('Overall health:', detailed.overall); // 'healthy', 'degraded', or 'critical'

// Listen for health changes
orchestrator.on('serviceHealthChanged', (health) => {
  console.log('Health changed:', health);
});
```

### Event Listeners

```javascript
// Proposal created
orchestrator.on('proposalCreated', (event) => {
  console.log('New proposal:', event.proposalId);
});

// Vote cast
orchestrator.on('voteCast', (event) => {
  console.log('Vote:', event.support ? 'YES' : 'NO');
});

// Mutation complete
orchestrator.on('mutationComplete', (event) => {
  console.log('Generation:', event.generation);
  console.log('New state:', event.newState);
});

// Service health changed
orchestrator.on('serviceHealthChanged', (health) => {
  console.log('Services:', health);
});
```

## Mutation Lifecycle

### 1. Proposal Phase

```javascript
const proposalId = await orchestrator.proposeMutation(code, language);
```

**Steps:**
1. Compile code to Ourocode using meta-compiler
2. Validate Ourocode syntax
3. Generate genome hash and Ourocode hash
4. Submit proposal to blockchain
5. Store pending mutation for later execution

### 2. Voting Phase

```javascript
await orchestrator.vote(proposalId, support);
```

**Steps:**
1. Submit vote to blockchain
2. Track voting status
3. Wait for voting period (60 seconds default)
4. Check if quorum reached (50% threshold)

### 3. Execution Phase

```javascript
const result = await orchestrator.executeMutation(proposalId);
```

**Steps:**
1. Execute proposal on blockchain
2. Fetch quantum entropy (256 bits)
3. Get bio sensor readings (light, temperature, acceleration)
4. Prepare mutation parameters
5. Execute Ourocode in appropriate runtime
6. Update neural clusters with new state
7. Record genome hash on blockchain
8. Update visualization

## Runtime Dispatchers

The orchestrator can execute Ourocode in different runtimes based on the source language:

### Lisp/ALGOL Runtime

```javascript
// ALGOL compiles to Lisp, then executes in Lisp interpreter
const result = await orchestrator.executeInRuntime(ourocodeModule, params);
```

### Fortran Runtime

```javascript
// Numeric computations execute in Fortran WASM engine
orchestrator.setFortranEngine(fortranEngine);
```

### Rust Runtime

```javascript
// State management executes in Rust WASM engine
orchestrator.setRustEngine(rustEngine);
```

### Go Runtime

```javascript
// Neural cluster decisions execute in Go WASM
// Automatically initialized during orchestrator.init()
```

## Service Health Monitor

The ServiceHealthMonitor provides:

- **Automatic Health Checks** - Periodic checks every 30 seconds (configurable)
- **Automatic Fallback** - Switches to mock mode when services unavailable
- **Event Notifications** - Emits events when services go up/down
- **Detailed Statistics** - Tracks check counts, failure counts, and errors

```javascript
const healthMonitor = orchestrator.getHealthMonitor();

// Get statistics
const stats = healthMonitor.getStats();
console.log('Check count:', stats.services[0].checkCount);
console.log('Failure count:', stats.services[0].failureCount);

// Configure monitoring
healthMonitor.setCheckInterval(60000); // 60 seconds
healthMonitor.setAutoFallback(true);

// Listen for events
healthMonitor.on('serviceDown', (event) => {
  console.log('Service down:', event.service);
});

healthMonitor.on('serviceUp', (event) => {
  console.log('Service up:', event.service);
});
```

## Configuration

Configuration is loaded from `src/config/index.js`:

```javascript
{
  blockchain: {
    rpcUrl: 'http://localhost:8545',
    contractAddress: '0x...',
    chainId: 1337,
    enabled: true
  },
  quantum: {
    apiUrl: 'http://localhost:5000',
    useMock: false,
    enabled: true
  },
  bioSensor: {
    apiUrl: 'http://raspberrypi.local:5001',
    useMock: false,
    enabled: true
  },
  compiler: {
    maxInstructions: 100000,
    maxMemory: 10485760, // 10MB
    timeout: 1000 // 1 second
  },
  monitoring: {
    healthCheckInterval: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000
  }
}
```

## Graceful Degradation

The orchestrator continues to function even when services are unavailable:

- **Blockchain Offline** - Uses mock proposal IDs, queues mutations
- **Quantum Offline** - Falls back to WebCrypto pseudo-random
- **Bio Sensor Offline** - Uses simulated sensor readings
- **Go WASM Failed** - Skips neural cluster updates

## State Management

The orchestrator maintains organism state:

```javascript
const state = orchestrator.getCurrentState();

// State structure:
{
  population: 100,
  energy: 50,
  mutationRate: 0.05,
  generation: 0,
  blockchainGeneration: 0,
  lastGenomeHash: '0x...',
  quantumEntropyUsed: '0x...',
  sensorReadings: {
    light: 0.5,
    temperature: 0.5,
    acceleration: 0.5
  },
  activeClusterIds: ['main', 'secondary']
}
```

## Error Handling

All methods throw errors that should be caught:

```javascript
try {
  await orchestrator.proposeMutation(code, language);
} catch (error) {
  console.error('Proposal failed:', error.message);
}
```

Common errors:
- `ChimeraOrchestrator not initialized` - Call `init()` first
- `Invalid Ourocode generated` - Syntax error in source code
- `Pending mutation not found` - Invalid proposal ID
- `Unsupported language` - Language not supported by meta-compiler

## Testing

Run the example:

```bash
node src/orchestrator/chimera-example.js
```

Or use in browser:

```javascript
import { main } from './chimera-example.js';
await main();
```

## API Reference

### Constructor

```javascript
new ChimeraOrchestrator(options)
```

**Options:**
- `enableBlockchain` (boolean) - Enable blockchain service
- `enableQuantum` (boolean) - Enable quantum service
- `enableBioSensor` (boolean) - Enable bio sensor service
- `useMockQuantum` (boolean) - Force quantum mock mode
- `useMockBioSensor` (boolean) - Force bio sensor mock mode

### Methods

#### Initialization

- `async init()` - Initialize all services and WASM modules
- `isInitialized()` - Check if orchestrator is initialized

#### Mutation Flow

- `async proposeMutation(code, language)` - Propose a mutation
- `async vote(proposalId, support)` - Vote on a proposal
- `async executeMutation(proposalId)` - Execute an approved mutation
- `async getProposal(proposalId)` - Get proposal details
- `async getVotingStatus(proposalId)` - Get voting status
- `async getProposalState(proposalId)` - Get proposal state
- `async hasVoted(proposalId)` - Check if user has voted

#### State Management

- `getCurrentState()` - Get current organism state
- `updateState(updates)` - Update organism state
- `getPendingMutation(proposalId)` - Get pending mutation
- `listPendingMutations()` - List all pending mutations

#### Service Health

- `getServiceHealth()` - Get simple health status
- `getDetailedServiceStatus()` - Get detailed health status
- `async checkServiceHealth()` - Manually trigger health check
- `getHealthMonitor()` - Get health monitor instance

#### Runtime Configuration

- `setVisualizer(visualizer)` - Set visualizer instance
- `setRustEngine(rustEngine)` - Set Rust WASM engine
- `setFortranEngine(fortranEngine)` - Set Fortran WASM engine
- `setLispInterpreter(lispInterpreter)` - Set Lisp interpreter

#### Events

- `on(eventType, callback)` - Register event listener
- `off(eventType, callback)` - Remove event listener

**Event Types:**
- `initialized` - Orchestrator initialized
- `proposalCreated` - New proposal created
- `voteCast` - Vote cast on proposal
- `proposalExecuted` - Proposal executed on blockchain
- `mutationComplete` - Mutation execution complete
- `serviceHealthChanged` - Service health status changed

## See Also

- [ServiceHealthMonitor](./service-health-monitor.js) - Service health monitoring
- [BlockchainBridge](../blockchain/blockchain-bridge.js) - Blockchain integration
- [QuantumEntropyClient](../quantum/client.js) - Quantum entropy
- [BioSensorClient](../biosensor/client.js) - Bio sensor integration
- [MetaCompiler](../metacompiler/meta-compiler.js) - Multi-language compilation
- [OurocodeExecutor](../metacompiler/ourocode-executor.js) - Ourocode execution
- [GoNeuralClusters](../go-bridge/bridge.js) - Go WASM neural clusters
