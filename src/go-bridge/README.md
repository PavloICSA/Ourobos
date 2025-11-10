# Go WASM Bridge

JavaScript bridge for Go neural cluster WASM module.

## Overview

The Go WASM Bridge provides a JavaScript interface to Go-based neural clusters that run as concurrent goroutines in WebAssembly. Each cluster maintains its own state and continuously generates decisions based on that state, enabling distributed and concurrent decision-making for the OuroborOS-Chimera organism.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  JavaScript Layer                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │         GoNeuralClusters Class                    │  │
│  │  - init()                                         │  │
│  │  - createCluster()                                │  │
│  │  - updateClusterState()                           │  │
│  │  - getClusterDecision()                           │  │
│  │  - stopCluster()                                  │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    │                                     │
│  ┌─────────────────▼─────────────────────────────────┐  │
│  │         Go WASM Functions (window.*)              │  │
│  │  - goCreateCluster()                              │  │
│  │  - goUpdateClusterState()                         │  │
│  │  - goGetClusterDecision()                         │  │
│  │  - goStopCluster()                                │  │
│  │  - goGetClusterState()                            │  │
│  │  - goListClusters()                               │  │
│  └─────────────────┬─────────────────────────────────┘  │
└────────────────────┼─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│              Go WASM Runtime (wasm_exec.js)              │
│  ┌───────────────────────────────────────────────────┐  │
│  │         neural_cluster.wasm                       │  │
│  │  - NeuralCluster structs                          │  │
│  │  - Goroutines (100ms decision cycle)             │  │
│  │  - Decision channels (buffered)                   │  │
│  │  - State management (mutex-protected)            │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Quick Start

```javascript
import { GoNeuralClusters } from './go-bridge/bridge.js';

// Create instance
const clusters = new GoNeuralClusters();

// Initialize Go WASM runtime
await clusters.init();

// Create neural cluster
const clusterId = clusters.createCluster('main');

// Update cluster state
clusters.updateClusterState(clusterId, {
  population: 100,
  energy: 50,
  mutation_rate: 0.05
});

// Wait for decisions to be generated
await new Promise(resolve => setTimeout(resolve, 200));

// Get cluster decision
const decision = clusters.getClusterDecision(clusterId);
console.log(decision.action, decision.confidence);

// Stop cluster when done
clusters.stopCluster(clusterId);
```

## API Reference

### GoNeuralClusters Class

#### `constructor()`
Creates a new GoNeuralClusters instance.

```javascript
const clusters = new GoNeuralClusters();
```

#### `async init()`
Initializes the Go WASM runtime and loads the neural cluster module.

**Returns:** `Promise<void>`

**Throws:** Error if initialization fails

```javascript
await clusters.init();
```

#### `createCluster(id)`
Creates a new neural cluster with the given ID.

**Parameters:**
- `id` (string): Unique identifier for the cluster

**Returns:** `string` - The cluster ID

**Throws:** Error if cluster creation fails

```javascript
const clusterId = clusters.createCluster('main-cluster');
```

#### `updateClusterState(id, state)`
Updates the state of a neural cluster.

**Parameters:**
- `id` (string): Cluster ID
- `state` (Object): State object with numeric values
  - `population` (number, optional): Population value
  - `energy` (number, optional): Energy value
  - `mutation_rate` (number, optional): Mutation rate value

**Returns:** `void`

**Throws:** Error if cluster not found or update fails

```javascript
clusters.updateClusterState('main-cluster', {
  population: 120,
  energy: 75,
  mutation_rate: 0.08
});
```

#### `getClusterDecision(id)`
Retrieves the next decision from a cluster's decision queue.

**Parameters:**
- `id` (string): Cluster ID

**Returns:** `Decision|null` - Decision object or null if no decision available

**Decision Object:**
```typescript
{
  clusterId: string;    // ID of the cluster
  action: string;       // Action to take
  confidence: number;   // Confidence level (0-1)
  timestamp: number;    // Unix timestamp
}
```

**Throws:** Error if cluster not found

```javascript
const decision = clusters.getClusterDecision('main-cluster');
if (decision) {
  console.log(`Action: ${decision.action}, Confidence: ${decision.confidence}`);
}
```

#### `getClusterState(id)`
Retrieves the current state of a cluster.

**Parameters:**
- `id` (string): Cluster ID

**Returns:** `Object|null` - State object or null if cluster not found

```javascript
const state = clusters.getClusterState('main-cluster');
console.log(state.population, state.energy, state.mutation_rate);
```

#### `stopCluster(id)`
Stops a neural cluster and cleans up resources.

**Parameters:**
- `id` (string): Cluster ID

**Returns:** `void`

**Throws:** Error if cluster not found

```javascript
clusters.stopCluster('main-cluster');
```

#### `listClusters()`
Lists all active cluster IDs.

**Returns:** `string[]` - Array of cluster IDs

```javascript
const allClusters = clusters.listClusters();
console.log('Active clusters:', allClusters);
```

#### `stopAllClusters()`
Stops all active clusters.

**Returns:** `void`

```javascript
clusters.stopAllClusters();
```

#### `isInitialized()`
Checks if the module is initialized.

**Returns:** `boolean`

```javascript
if (clusters.isInitialized()) {
  console.log('Ready to use');
}
```

#### `getActiveClusterCount()`
Gets the number of active clusters.

**Returns:** `number`

```javascript
console.log(`Active clusters: ${clusters.getActiveClusterCount()}`);
```

## Decision Types

Neural clusters make decisions based on their current state:

| Action | Condition | Confidence | Description |
|--------|-----------|------------|-------------|
| `grow` | energy > 70 && population < 80 | 0.85 | Increase population |
| `conserve` | energy < 30 | 0.90 | Reduce energy usage |
| `reduce` | population > 120 | 0.75 | Decrease population |
| `mutate_more` | mutation_rate < 0.03 | 0.65 | Increase mutation rate |
| `mutate_less` | mutation_rate > 0.15 | 0.70 | Decrease mutation rate |
| `maintain` | default | 0.60 | Keep current state |

## State Management

Each cluster maintains a state object with the following fields:

```javascript
{
  population: number,      // Current population (default: 50.0)
  energy: number,          // Current energy level (default: 50.0)
  mutation_rate: number    // Current mutation rate (default: 0.05)
}
```

State updates are thread-safe and protected by mutexes in the Go runtime.

## Concurrency Model

- Each cluster runs in its own goroutine
- Decisions are generated every 100ms
- Decision queue is buffered (100 decisions max)
- State updates are mutex-protected
- Clusters can be stopped gracefully via stop channels

## Error Handling

The bridge throws errors for:
- Uninitialized module access
- Invalid cluster IDs
- Failed WASM module loading
- Missing Go functions

```javascript
try {
  await clusters.init();
  const id = clusters.createCluster('test');
  clusters.updateClusterState(id, { population: 100 });
} catch (error) {
  console.error('Error:', error.message);
}
```

## Examples

### Basic Usage
See `example.js` for a comprehensive demonstration of all features.

```bash
# Run example in browser
npm run dev
# Open browser console and load example.js
```

### Integration Testing
See `integration-test.js` for automated tests.

```javascript
import { runIntegrationTests } from './go-bridge/integration-test.js';
await runIntegrationTests();
```

## Components

- `bridge.js` - Main Go WASM interface class
- `example.js` - Usage examples and demonstrations
- `integration-test.js` - Automated integration tests
- `README.md` - This documentation

## Requirements

- Go WASM module built (`wasm/go/neural_cluster.wasm`)
- Go WASM runtime support (`wasm_exec.js`)
- Modern browser with WebAssembly support
- ES6 module support

## Building the Go Module

Before using the bridge, build the Go WASM module:

```bash
# Linux/Mac
cd wasm/go
./build_go_wasm.sh

# Windows
cd wasm\go
build_go_wasm.cmd
```

This will compile the Go code and copy the necessary files to `public/wasm/go/`.

## Performance Considerations

- Decisions are generated every 100ms per cluster
- Decision queue holds up to 100 decisions
- State updates are immediate but mutex-protected
- Multiple clusters run in parallel without blocking
- WASM module initialization takes ~100ms

## Troubleshooting

### "GoNeuralClusters not initialized"
Call `await clusters.init()` before using any other methods.

### "Failed to fetch Go WASM module"
Ensure the WASM module is built and located at `/wasm/go/neural_cluster.wasm`.

### "Required Go function not found"
The Go runtime may not have finished initializing. The `init()` method includes a 100ms delay to allow for this.

### No decisions available
Clusters generate decisions every 100ms. Wait at least 200ms after creating/updating a cluster before calling `getClusterDecision()`.

## Integration with Orchestrator

The Go bridge integrates with the ChimeraOrchestrator:

```javascript
import { GoNeuralClusters } from './go-bridge/bridge.js';

class ChimeraOrchestrator {
  constructor() {
    this.goClusters = new GoNeuralClusters();
  }

  async init() {
    await this.goClusters.init();
    this.mainCluster = this.goClusters.createCluster('main');
  }

  async executeMutation(mutation) {
    // Update cluster state based on mutation
    this.goClusters.updateClusterState(this.mainCluster, {
      population: mutation.population,
      energy: mutation.energy,
      mutation_rate: mutation.rate
    });

    // Wait for decision
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get cluster decision
    const decision = this.goClusters.getClusterDecision(this.mainCluster);
    
    // Apply decision to organism
    if (decision) {
      this.applyDecision(decision);
    }
  }
}
```

## See Also

- [Go Neural Cluster Implementation](../../wasm/go/neural_cluster.go)
- [Go WASM Build Instructions](../../wasm/go/README.md)
- [ChimeraOrchestrator Integration](../orchestrator/README.md)
