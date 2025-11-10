# Go Neural Clusters Integration Guide

This guide explains how to integrate the Go neural clusters bridge with the ChimeraOrchestrator and other components of OuroborOS-Chimera.

## Overview

The Go neural clusters provide concurrent decision-making capabilities for the organism. They run in parallel goroutines and continuously generate decisions based on the organism's state.

## Integration Points

### 1. ChimeraOrchestrator Integration

The orchestrator manages the lifecycle of neural clusters and coordinates their decisions with other system components.

```javascript
import { GoNeuralClusters } from './go-bridge/bridge.js';
import { BlockchainBridge } from './blockchain/blockchain-bridge.js';
import { QuantumEntropyClient } from './quantum/client.js';
import { BioSensorClient } from './biosensor/client.js';

class ChimeraOrchestrator {
  constructor() {
    this.goClusters = new GoNeuralClusters();
    this.blockchain = new BlockchainBridge();
    this.quantum = new QuantumEntropyClient();
    this.bioSensor = new BioSensorClient();
    this.mainClusterId = null;
  }

  async init() {
    console.log('Initializing ChimeraOrchestrator...');
    
    // Initialize all components
    await this.goClusters.init();
    await this.blockchain.init();
    await this.quantum.init();
    await this.bioSensor.init();
    
    // Create main neural cluster
    this.mainClusterId = this.goClusters.createCluster('main');
    
    console.log('ChimeraOrchestrator initialized');
  }

  async executeMutation(mutation) {
    // Get quantum entropy
    const entropy = await this.quantum.getEntropy();
    
    // Get bio sensor readings
    const sensorData = await this.bioSensor.getReadings();
    
    // Update cluster state with mutation parameters
    this.goClusters.updateClusterState(this.mainClusterId, {
      population: mutation.population,
      energy: mutation.energy,
      mutation_rate: mutation.rate
    });
    
    // Wait for cluster to generate decision
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get cluster decision
    const decision = this.goClusters.getClusterDecision(this.mainClusterId);
    
    if (decision) {
      console.log(`Cluster decision: ${decision.action} (confidence: ${decision.confidence})`);
      
      // Apply decision to organism
      await this.applyDecision(decision, entropy, sensorData);
    }
  }

  async applyDecision(decision, entropy, sensorData) {
    // Implementation depends on decision type
    switch (decision.action) {
      case 'grow':
        // Increase population
        break;
      case 'conserve':
        // Reduce energy usage
        break;
      case 'reduce':
        // Decrease population
        break;
      case 'mutate_more':
        // Increase mutation rate
        break;
      case 'mutate_less':
        // Decrease mutation rate
        break;
      case 'maintain':
        // Keep current state
        break;
    }
  }

  async shutdown() {
    this.goClusters.stopAllClusters();
  }
}
```

### 2. State Synchronization

Keep cluster state synchronized with organism state:

```javascript
class OrganismStateManager {
  constructor(goClusters, clusterId) {
    this.goClusters = goClusters;
    this.clusterId = clusterId;
    this.state = {
      population: 50,
      energy: 50,
      mutation_rate: 0.05
    };
  }

  updateState(updates) {
    // Update local state
    this.state = { ...this.state, ...updates };
    
    // Sync to Go cluster
    this.goClusters.updateClusterState(this.clusterId, this.state);
  }

  async getDecision() {
    // Wait for decision to be generated
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.goClusters.getClusterDecision(this.clusterId);
  }

  getState() {
    return this.goClusters.getClusterState(this.clusterId);
  }
}
```

### 3. Multi-Cluster Management

Manage multiple clusters for different organism subsystems:

```javascript
class MultiClusterManager {
  constructor(goClusters) {
    this.goClusters = goClusters;
    this.clusters = new Map();
  }

  createSubsystem(name, initialState) {
    const clusterId = this.goClusters.createCluster(name);
    this.goClusters.updateClusterState(clusterId, initialState);
    this.clusters.set(name, clusterId);
    return clusterId;
  }

  async getSubsystemDecisions() {
    const decisions = new Map();
    
    for (const [name, clusterId] of this.clusters) {
      const decision = this.goClusters.getClusterDecision(clusterId);
      if (decision) {
        decisions.set(name, decision);
      }
    }
    
    return decisions;
  }

  updateSubsystem(name, state) {
    const clusterId = this.clusters.get(name);
    if (clusterId) {
      this.goClusters.updateClusterState(clusterId, state);
    }
  }

  shutdownSubsystem(name) {
    const clusterId = this.clusters.get(name);
    if (clusterId) {
      this.goClusters.stopCluster(clusterId);
      this.clusters.delete(name);
    }
  }

  shutdownAll() {
    for (const name of this.clusters.keys()) {
      this.shutdownSubsystem(name);
    }
  }
}
```

### 4. Decision Processing Pipeline

Process cluster decisions through a pipeline:

```javascript
class DecisionPipeline {
  constructor(goClusters, clusterId) {
    this.goClusters = goClusters;
    this.clusterId = clusterId;
    this.handlers = [];
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  async processDecisions(interval = 200) {
    const decision = this.goClusters.getClusterDecision(this.clusterId);
    
    if (decision) {
      // Run through all handlers
      for (const handler of this.handlers) {
        try {
          await handler(decision);
        } catch (error) {
          console.error('Decision handler error:', error);
        }
      }
    }
    
    // Schedule next processing
    setTimeout(() => this.processDecisions(interval), interval);
  }
}

// Usage
const pipeline = new DecisionPipeline(goClusters, clusterId);

pipeline.addHandler(async (decision) => {
  console.log('Decision:', decision.action);
});

pipeline.addHandler(async (decision) => {
  if (decision.confidence > 0.8) {
    // High confidence decision - apply immediately
    await applyDecision(decision);
  }
});

pipeline.processDecisions();
```

### 5. Visualization Integration

Visualize cluster decisions in real-time:

```javascript
class ClusterVisualizer {
  constructor(goClusters, canvas) {
    this.goClusters = goClusters;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.decisionHistory = [];
  }

  async update() {
    const clusters = this.goClusters.listClusters();
    
    for (const clusterId of clusters) {
      const decision = this.goClusters.getClusterDecision(clusterId);
      if (decision) {
        this.decisionHistory.push(decision);
        if (this.decisionHistory.length > 100) {
          this.decisionHistory.shift();
        }
      }
    }
    
    this.render();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render decision history
    const barWidth = this.canvas.width / this.decisionHistory.length;
    
    this.decisionHistory.forEach((decision, i) => {
      const x = i * barWidth;
      const height = decision.confidence * this.canvas.height;
      const y = this.canvas.height - height;
      
      // Color based on action
      const color = this.getActionColor(decision.action);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, barWidth - 1, height);
    });
  }

  getActionColor(action) {
    const colors = {
      grow: '#00ff00',
      conserve: '#0000ff',
      reduce: '#ff0000',
      mutate_more: '#ffff00',
      mutate_less: '#ff00ff',
      maintain: '#00ffff'
    };
    return colors[action] || '#ffffff';
  }
}
```

### 6. Event-Driven Integration

Use events to coordinate cluster decisions:

```javascript
class ClusterEventEmitter extends EventTarget {
  constructor(goClusters, clusterId) {
    super();
    this.goClusters = goClusters;
    this.clusterId = clusterId;
    this.polling = false;
  }

  startPolling(interval = 200) {
    if (this.polling) return;
    this.polling = true;
    this.poll(interval);
  }

  stopPolling() {
    this.polling = false;
  }

  async poll(interval) {
    if (!this.polling) return;
    
    const decision = this.goClusters.getClusterDecision(this.clusterId);
    
    if (decision) {
      this.dispatchEvent(new CustomEvent('decision', { detail: decision }));
    }
    
    setTimeout(() => this.poll(interval), interval);
  }
}

// Usage
const emitter = new ClusterEventEmitter(goClusters, clusterId);

emitter.addEventListener('decision', (event) => {
  const decision = event.detail;
  console.log('New decision:', decision.action);
});

emitter.startPolling();
```

## Best Practices

### 1. Initialization Order

Always initialize Go clusters before using them:

```javascript
async function initializeSystem() {
  const clusters = new GoNeuralClusters();
  await clusters.init(); // Wait for initialization
  // Now safe to use clusters
}
```

### 2. Decision Timing

Wait at least 200ms after state updates before requesting decisions:

```javascript
clusters.updateClusterState(id, newState);
await new Promise(resolve => setTimeout(resolve, 200));
const decision = clusters.getClusterDecision(id);
```

### 3. Error Handling

Always wrap cluster operations in try-catch blocks:

```javascript
try {
  const decision = clusters.getClusterDecision(id);
  if (decision) {
    await processDecision(decision);
  }
} catch (error) {
  console.error('Cluster error:', error);
  // Fallback logic
}
```

### 4. Resource Cleanup

Stop clusters when no longer needed:

```javascript
// Stop individual cluster
clusters.stopCluster(id);

// Or stop all clusters on shutdown
window.addEventListener('beforeunload', () => {
  clusters.stopAllClusters();
});
```

### 5. State Validation

Validate state values before updating:

```javascript
function updateClusterSafely(clusters, id, state) {
  // Validate state
  const validated = {
    population: Math.max(0, Math.min(200, state.population || 50)),
    energy: Math.max(0, Math.min(100, state.energy || 50)),
    mutation_rate: Math.max(0, Math.min(1, state.mutation_rate || 0.05))
  };
  
  clusters.updateClusterState(id, validated);
}
```

## Testing Integration

Test the integration with mock data:

```javascript
async function testIntegration() {
  const clusters = new GoNeuralClusters();
  await clusters.init();
  
  const id = clusters.createCluster('test');
  
  // Test state update
  clusters.updateClusterState(id, {
    population: 100,
    energy: 50,
    mutation_rate: 0.05
  });
  
  // Test decision retrieval
  await new Promise(resolve => setTimeout(resolve, 200));
  const decision = clusters.getClusterDecision(id);
  
  console.assert(decision !== null, 'Should get decision');
  console.assert(decision.action, 'Decision should have action');
  console.assert(decision.confidence >= 0 && decision.confidence <= 1, 'Confidence in range');
  
  // Cleanup
  clusters.stopCluster(id);
  
  console.log('Integration test passed');
}
```

## Performance Considerations

- Each cluster generates decisions every 100ms
- Decision queue holds up to 100 decisions
- Multiple clusters run in parallel without blocking
- State updates are immediate but mutex-protected
- WASM initialization takes ~100ms

## Troubleshooting

### Decisions not appearing
- Wait at least 200ms after state updates
- Check that cluster is still active
- Verify state values are valid numbers

### High memory usage
- Stop unused clusters
- Limit number of concurrent clusters
- Clear decision queues regularly

### Slow performance
- Reduce number of active clusters
- Increase decision polling interval
- Check for blocking operations in handlers

## See Also

- [Go Bridge API Reference](./README.md)
- [Go Neural Cluster Implementation](../../wasm/go/neural_cluster.go)
- [ChimeraOrchestrator Documentation](../orchestrator/README.md)
