# Go Neural Clusters Quick Start

Get started with Go neural clusters in 5 minutes.

## Prerequisites

1. Go WASM module built:
   ```bash
   cd wasm/go
   ./build_go_wasm.sh  # or build_go_wasm.cmd on Windows
   ```

2. Development server running:
   ```bash
   npm run dev
   ```

## Basic Usage

### 1. Import the Bridge

```javascript
import { GoNeuralClusters } from './go-bridge/bridge.js';
```

### 2. Initialize

```javascript
const clusters = new GoNeuralClusters();
await clusters.init();
```

### 3. Create a Cluster

```javascript
const clusterId = clusters.createCluster('my-cluster');
```

### 4. Update State

```javascript
clusters.updateClusterState(clusterId, {
  population: 100,
  energy: 75,
  mutation_rate: 0.05
});
```

### 5. Get Decisions

```javascript
// Wait for decision to be generated
await new Promise(resolve => setTimeout(resolve, 200));

// Get the decision
const decision = clusters.getClusterDecision(clusterId);

if (decision) {
  console.log(`Action: ${decision.action}`);
  console.log(`Confidence: ${decision.confidence}`);
}
```

### 6. Cleanup

```javascript
clusters.stopCluster(clusterId);
```

## Complete Example

```javascript
import { GoNeuralClusters } from './go-bridge/bridge.js';

async function main() {
  // Initialize
  const clusters = new GoNeuralClusters();
  await clusters.init();
  
  // Create cluster
  const id = clusters.createCluster('demo');
  
  // Update state
  clusters.updateClusterState(id, {
    population: 100,
    energy: 50,
    mutation_rate: 0.05
  });
  
  // Wait and get decision
  await new Promise(resolve => setTimeout(resolve, 200));
  const decision = clusters.getClusterDecision(id);
  
  console.log('Decision:', decision);
  
  // Cleanup
  clusters.stopCluster(id);
}

main();
```

## Testing

### Run Example

```javascript
import { runExample } from './go-bridge/example.js';
await runExample();
```

### Run Integration Tests

```javascript
import { runIntegrationTests } from './go-bridge/integration-test.js';
await runIntegrationTests();
```

### Interactive Testing

Open `src/go-bridge/test.html` in your browser for an interactive test interface.

## Decision Types

Clusters make these decisions based on state:

| Action | When | Confidence |
|--------|------|------------|
| `grow` | High energy, low population | 0.85 |
| `conserve` | Low energy | 0.90 |
| `reduce` | High population | 0.75 |
| `mutate_more` | Low mutation rate | 0.65 |
| `mutate_less` | High mutation rate | 0.70 |
| `maintain` | Default | 0.60 |

## Common Patterns

### Multiple Clusters

```javascript
const cluster1 = clusters.createCluster('cluster-1');
const cluster2 = clusters.createCluster('cluster-2');

// Update both
clusters.updateClusterState(cluster1, { population: 100 });
clusters.updateClusterState(cluster2, { population: 50 });

// Get decisions from both
await new Promise(resolve => setTimeout(resolve, 200));
const decision1 = clusters.getClusterDecision(cluster1);
const decision2 = clusters.getClusterDecision(cluster2);
```

### Continuous Decision Processing

```javascript
async function processDecisions(clusterId) {
  const decision = clusters.getClusterDecision(clusterId);
  
  if (decision) {
    console.log('New decision:', decision.action);
    // Process decision...
  }
  
  // Check again in 200ms
  setTimeout(() => processDecisions(clusterId), 200);
}

processDecisions(clusterId);
```

### State Monitoring

```javascript
function monitorCluster(clusterId) {
  const state = clusters.getClusterState(clusterId);
  console.log('Current state:', state);
  
  setTimeout(() => monitorCluster(clusterId), 1000);
}

monitorCluster(clusterId);
```

## Troubleshooting

### "GoNeuralClusters not initialized"
**Solution:** Call `await clusters.init()` before using any methods.

### "Failed to fetch Go WASM module"
**Solution:** Build the Go WASM module first:
```bash
cd wasm/go
./build_go_wasm.sh
```

### No decisions available
**Solution:** Wait at least 200ms after creating/updating a cluster before requesting decisions.

### "Cluster not found"
**Solution:** Verify the cluster ID is correct and the cluster hasn't been stopped.

## Next Steps

- Read the [full API documentation](./README.md)
- Check out [integration patterns](./INTEGRATION.md)
- Explore the [example code](./example.js)
- Run the [integration tests](./integration-test.js)

## Need Help?

- Check the [README](./README.md) for detailed API reference
- See [INTEGRATION.md](./INTEGRATION.md) for orchestrator integration
- Review [example.js](./example.js) for usage patterns
- Run [test.html](./test.html) for interactive testing
