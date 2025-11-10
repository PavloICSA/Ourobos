# ChimeraOrchestrator - Go Neural Cluster Integration

This document describes the integration of Go neural clusters with the ChimeraOrchestrator.

## Overview

The ChimeraOrchestrator manages the complete lifecycle of organism mutations across all technology layers, with Go neural clusters providing concurrent decision-making capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   ChimeraOrchestrator                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Go Neural Clusters (WASM)                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │  Main    │  │Secondary │  │ Tertiary │        │    │
│  │  │ Cluster  │  │ Cluster  │  │ Cluster  │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  │       ↓              ↓              ↓             │    │
│  │  [Decisions]    [Decisions]    [Decisions]       │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│              ┌───────────────────────┐                     │
│              │  Decision Processing  │                     │
│              │  & State Updates      │                     │
│              └───────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Cluster Initialization

The orchestrator automatically creates default neural clusters on initialization:

```javascript
const orchestrator = new ChimeraOrchestrator();
await orchestrator.init();
// Creates: main, secondary, tertiary clusters
```

### 2. State Synchronization

Organism state is automatically synchronized to all active clusters:

```javascript
orchestrator.updateClusterState({
  population: 75,
  energy: 60,
  mutationRate: 0.08
});
// All clusters receive the updated state
```

### 3. Decision Processing

Clusters continuously generate decisions based on their state:

```javascript
const decisions = await orchestrator.fetchClusterDecisions();
// Returns array of decisions from all clusters
// Each decision: { clusterId, action, confidence, timestamp }
```

### 4. Decision Actions

Clusters can suggest the following actions:
- **grow**: Increase population (when energy > 70 and population < 80)
- **conserve**: Increase energy (when energy < 30)
- **reduce**: Decrease population (when population > 120)
- **mutate_more**: Increase mutation rate (when rate < 0.03)
- **mutate_less**: Decrease mutation rate (when rate > 0.15)
- **maintain**: No change (default)

### 5. Decision Handlers

Register custom handlers for specific actions:

```javascript
orchestrator.onClusterDecision('grow', (decision) => {
  console.log(`Processing GROW from ${decision.clusterId}`);
  // Custom logic here
});
```

### 6. Cluster Lifecycle Management

Full lifecycle control for clusters:

```javascript
// Create
const id = orchestrator.createCluster('my-cluster');

// Update
orchestrator.handleClusterLifecycle('update', 'my-cluster', {
  population: 100,
  energy: 80,
  mutation_rate: 0.1
});

// Stop
orchestrator.stopCluster('my-cluster');
```

## API Reference

### ChimeraOrchestrator

#### Constructor
```javascript
new ChimeraOrchestrator()
```

#### Methods

##### `async init()`
Initialize the orchestrator and all components including Go neural clusters.

**Returns:** `Promise<void>`

##### `createCluster(clusterId)`
Create a new neural cluster.

**Parameters:**
- `clusterId` (string): Unique identifier for the cluster

**Returns:** `string` - The cluster ID

##### `updateClusterState(newState)`
Update the state of all active clusters.

**Parameters:**
- `newState` (Object): New organism state
  - `population` (number): Population value
  - `energy` (number): Energy value
  - `mutationRate` (number): Mutation rate value

##### `async fetchClusterDecisions()`
Fetch and process decisions from all active clusters.

**Returns:** `Promise<Array<Decision>>` - Array of decisions

##### `onClusterDecision(action, handler)`
Register a handler for specific cluster decision actions.

**Parameters:**
- `action` (string): Action type to handle
- `handler` (Function): Handler function receiving decision object

##### `stopCluster(clusterId)`
Stop a specific cluster and clean up resources.

**Parameters:**
- `clusterId` (string): Cluster ID to stop

##### `handleClusterLifecycle(operation, clusterId, data)`
Handle cluster lifecycle operations.

**Parameters:**
- `operation` (string): 'create', 'update', or 'stop'
- `clusterId` (string): Cluster ID
- `data` (Object, optional): Data for the operation

##### `getClusterState(clusterId)`
Get the current state of a specific cluster.

**Parameters:**
- `clusterId` (string): Cluster ID

**Returns:** `Object|null` - Cluster state or null

##### `getActiveClusters()`
Get all active cluster IDs.

**Returns:** `Array<string>` - Array of cluster IDs

##### `getCurrentState()`
Get current organism state.

**Returns:** `Object` - Current state

##### `async simulateMutation()`
Simulate a mutation cycle with cluster updates.

**Returns:** `Promise<Object>` - Result containing generation, state, decisions, and active clusters

##### `async cleanup()`
Cleanup and stop all clusters.

**Returns:** `Promise<void>`

## Usage Examples

### Basic Usage

```javascript
import { ChimeraOrchestrator } from './chimera-orchestrator.js';

const orchestrator = new ChimeraOrchestrator();

// Initialize
await orchestrator.init();

// Run a mutation cycle
const result = await orchestrator.simulateMutation();
console.log('Generation:', result.generation);
console.log('Decisions:', result.decisions);

// Cleanup
await orchestrator.cleanup();
```

### Custom Decision Handling

```javascript
const orchestrator = new ChimeraOrchestrator();
await orchestrator.init();

// Register handlers
orchestrator.onClusterDecision('grow', (decision) => {
  console.log(`Growing population based on ${decision.clusterId}`);
});

orchestrator.onClusterDecision('conserve', (decision) => {
  console.log(`Conserving energy based on ${decision.clusterId}`);
});

// Update state and fetch decisions
orchestrator.updateClusterState({
  population: 50,
  energy: 80,
  mutationRate: 0.05
});

await new Promise(resolve => setTimeout(resolve, 200));
const decisions = await orchestrator.fetchClusterDecisions();
```

### Dynamic Cluster Management

```javascript
const orchestrator = new ChimeraOrchestrator();
await orchestrator.init();

// Create additional clusters
orchestrator.createCluster('analyzer-1');
orchestrator.createCluster('analyzer-2');

// Update specific cluster
orchestrator.handleClusterLifecycle('update', 'analyzer-1', {
  population: 100,
  energy: 50,
  mutation_rate: 0.1
});

// Get cluster state
const state = orchestrator.getClusterState('analyzer-1');
console.log('Analyzer-1 state:', state);

// Stop when done
orchestrator.stopCluster('analyzer-1');
```

## Integration with Other Components

The ChimeraOrchestrator is designed to integrate with:

- **Blockchain Bridge**: For mutation proposals and voting
- **Quantum Client**: For entropy generation
- **Bio Sensor Client**: For environmental feedback
- **Meta-Compiler**: For Ourocode compilation
- **Ourocode Executor**: For code execution

These integrations will be added in future tasks.

## Testing

Run the integration tests:

```bash
npm run test:chimera-integration
```

Or run the example:

```bash
npm run example:chimera
```

## Decision Processing Logic

When a decision is received with confidence > 0.7:

| Action | Effect |
|--------|--------|
| grow | `population *= 1.1` (max 150) |
| conserve | `energy *= 1.05` (max 100) |
| reduce | `population *= 0.9` (min 10) |
| mutate_more | `mutationRate *= 1.2` (max 0.2) |
| mutate_less | `mutationRate *= 0.8` (min 0.01) |
| maintain | No change |

## State Structure

```javascript
{
  population: 50,           // Current population
  energy: 50,               // Current energy level
  generation: 0,            // Generation number
  age: 0,                   // Organism age
  mutationRate: 0.05,       // Current mutation rate
  blockchainGeneration: 0,  // Blockchain generation (future)
  lastGenomeHash: '',       // Last genome hash (future)
  activeClusterIds: []      // Array of active cluster IDs
}
```

## Performance Considerations

- Clusters generate decisions every 100ms
- Decision queue holds up to 100 decisions per cluster
- State updates are synchronized across all clusters
- Cleanup properly stops all goroutines

## Error Handling

The orchestrator handles errors gracefully:
- Failed cluster creation logs error but continues
- Failed state updates log error for specific cluster
- Failed decision fetching logs error but continues with other clusters
- Cleanup errors are logged but don't prevent other cleanups

## Future Enhancements

1. Integration with blockchain for mutation proposals
2. Quantum entropy seeding for decisions
3. Bio sensor influence on cluster state
4. Meta-compiler integration for Ourocode execution
5. Visualization of cluster decisions
6. Persistence of cluster states

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **7.2**: Go microservices implement neural cluster logic with concurrent goroutines
- **7.3**: Go microservices communicate with JavaScript orchestrator via message passing
- **7.4**: Go microservices handle concurrent decision processes
- **7.5**: Go microservices expose health check and metrics endpoints
- **13.4**: Neural clusters process approved mutations in parallel

## See Also

- [Go Bridge Documentation](../go-bridge/README.md)
- [Go Neural Cluster Implementation](../../wasm/go/README.md)
- [ChimeraOrchestrator Example](./chimera-example.js)
- [Integration Tests](./chimera-integration-test.js)
