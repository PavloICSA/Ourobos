# ChimeraOrchestrator Quick Start Guide

Get started with the ChimeraOrchestrator and Go neural clusters in 5 minutes.

## Prerequisites

- Go WASM module built (`wasm/go/neural_cluster.wasm`)
- Go WASM runtime (`wasm/go/wasm_exec.js`)
- Modern browser with WebAssembly support

## Quick Start

### 1. Basic Usage

```javascript
import { ChimeraOrchestrator } from './chimera-orchestrator.js';

// Create orchestrator
const orchestrator = new ChimeraOrchestrator();

// Initialize (creates default clusters)
await orchestrator.init();

// Get current state
const state = orchestrator.getCurrentState();
console.log('State:', state);

// Get active clusters
const clusters = orchestrator.getActiveClusters();
console.log('Clusters:', clusters); // ['main', 'secondary', 'tertiary']
```

### 2. Update State

```javascript
// Update organism state
orchestrator.updateClusterState({
  population: 75,
  energy: 60,
  mutationRate: 0.08
});

// All clusters now have the updated state
```

### 3. Fetch Decisions

```javascript
// Wait for clusters to process
await new Promise(resolve => setTimeout(resolve, 200));

// Fetch decisions from all clusters
const decisions = await orchestrator.fetchClusterDecisions();

decisions.forEach(decision => {
  console.log(`${decision.clusterId}: ${decision.action} (${decision.confidence})`);
});
```

### 4. Register Decision Handlers

```javascript
// Handle specific actions
orchestrator.onClusterDecision('grow', (decision) => {
  console.log(`Growing population based on ${decision.clusterId}`);
});

orchestrator.onClusterDecision('conserve', (decision) => {
  console.log(`Conserving energy based on ${decision.clusterId}`);
});
```

### 5. Simulate Mutation

```javascript
// Run a complete mutation cycle
const result = await orchestrator.simulateMutation();

console.log('Generation:', result.generation);
console.log('State:', result.state);
console.log('Decisions:', result.decisions);
```

### 6. Cleanup

```javascript
// Stop all clusters and cleanup
await orchestrator.cleanup();
```

## Complete Example

```javascript
import { ChimeraOrchestrator } from './chimera-orchestrator.js';

async function main() {
  const orchestrator = new ChimeraOrchestrator();
  
  try {
    // Initialize
    await orchestrator.init();
    console.log('Initialized with clusters:', orchestrator.getActiveClusters());
    
    // Register handlers
    orchestrator.onClusterDecision('grow', (d) => {
      console.log(`GROW action from ${d.clusterId}`);
    });
    
    // Run 3 mutation cycles
    for (let i = 0; i < 3; i++) {
      const result = await orchestrator.simulateMutation();
      console.log(`Cycle ${i + 1}:`, result.state);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } finally {
    // Always cleanup
    await orchestrator.cleanup();
  }
}

main().catch(console.error);
```

## Browser Testing

### Option 1: Use Test Page

1. Start a local server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000/src/orchestrator/test-chimera.html`

3. Click "Initialize Orchestrator" and explore the UI

### Option 2: Browser Console

1. Open your app in a browser
2. Open developer console
3. Run:
   ```javascript
   import { ChimeraOrchestrator } from './src/orchestrator/chimera-orchestrator.js';
   const orch = new ChimeraOrchestrator();
   await orch.init();
   await orch.simulateMutation();
   ```

## Common Operations

### Create New Cluster

```javascript
const clusterId = orchestrator.createCluster('my-cluster');
console.log('Created:', clusterId);
```

### Update Specific Cluster

```javascript
orchestrator.handleClusterLifecycle('update', 'my-cluster', {
  population: 100,
  energy: 80,
  mutation_rate: 0.1
});
```

### Get Cluster State

```javascript
const state = orchestrator.getClusterState('main');
console.log('Main cluster:', state);
```

### Stop Cluster

```javascript
orchestrator.stopCluster('my-cluster');
```

## Decision Actions

Clusters can suggest these actions:

- **grow**: Increase population (when energy is high)
- **conserve**: Increase energy (when energy is low)
- **reduce**: Decrease population (when overpopulated)
- **mutate_more**: Increase mutation rate
- **mutate_less**: Decrease mutation rate
- **maintain**: No change

## Troubleshooting

### "GoNeuralClusters not initialized"

Make sure to call `await orchestrator.init()` before using other methods.

### "Failed to fetch Go WASM module"

Check that:
1. `wasm/go/neural_cluster.wasm` exists
2. `wasm/go/wasm_exec.js` exists
3. Paths in `src/config/index.js` are correct

### No decisions returned

Clusters generate decisions every 100ms. Wait a bit before fetching:
```javascript
await new Promise(resolve => setTimeout(resolve, 200));
const decisions = await orchestrator.fetchClusterDecisions();
```

## Next Steps

- Read [CHIMERA-INTEGRATION.md](./CHIMERA-INTEGRATION.md) for detailed documentation
- Run [chimera-example.js](./chimera-example.js) for a complete demo
- Run [chimera-integration-test.js](./chimera-integration-test.js) for tests
- Explore [test-chimera.html](./test-chimera.html) for interactive testing

## API Quick Reference

| Method | Description |
|--------|-------------|
| `init()` | Initialize orchestrator and clusters |
| `createCluster(id)` | Create new cluster |
| `updateClusterState(state)` | Update all cluster states |
| `fetchClusterDecisions()` | Get decisions from all clusters |
| `onClusterDecision(action, handler)` | Register decision handler |
| `stopCluster(id)` | Stop specific cluster |
| `getClusterState(id)` | Get cluster state |
| `getActiveClusters()` | Get all cluster IDs |
| `getCurrentState()` | Get organism state |
| `simulateMutation()` | Run mutation cycle |
| `cleanup()` | Stop all clusters |

## Support

For issues or questions:
- Check [CHIMERA-INTEGRATION.md](./CHIMERA-INTEGRATION.md)
- Review [Go Bridge README](../go-bridge/README.md)
- See [Go WASM README](../../wasm/go/README.md)
