# Go Neural Clusters WASM Module

This directory contains the Go implementation of neural clusters for OuroborOS-Chimera.

## Overview

Neural clusters are concurrent decision-making processes implemented using Go goroutines. Each cluster maintains its own state and continuously generates decisions based on that state. The clusters run in parallel and communicate with the JavaScript orchestrator via the WASM bridge.

## Architecture

- **NeuralCluster**: Struct representing a concurrent decision-making process
- **Decision**: Struct representing a decision made by a cluster
- **Goroutines**: Each cluster runs its own goroutine for continuous decision-making
- **Channels**: Used for decision queuing and cluster lifecycle management

## Exported Functions

The following functions are exported to JavaScript:

- `goCreateCluster(id)`: Creates a new neural cluster with the given ID
- `goUpdateClusterState(id, stateJSON)`: Updates the state of a cluster
- `goGetClusterDecision(id)`: Retrieves the next decision from a cluster's queue
- `goStopCluster(id)`: Stops a cluster and cleans up resources
- `goGetClusterState(id)`: Retrieves the current state of a cluster
- `goListClusters()`: Returns a list of all active cluster IDs

## Building

### Prerequisites

- Go 1.21 or later
- GOOS=js and GOARCH=wasm support

### Build Commands

**Linux/Mac:**
```bash
./build_go_wasm.sh
```

**Windows:**
```cmd
build_go_wasm.cmd
```

The build process will:
1. Compile `neural_cluster.go` to `neural_cluster.wasm`
2. Copy the WASM module to `public/wasm/go/`
3. Copy `wasm_exec.js` from the Go installation to `public/wasm/go/`

## Output

- `public/wasm/go/neural_cluster.wasm`: Compiled WASM module
- `public/wasm/go/wasm_exec.js`: Go WASM runtime support

## Testing

A comprehensive test suite is available in `test-wasm.html`. After building the module:

1. Start a local web server in the project root
2. Open `wasm/go/test-wasm.html` in your browser
3. The test suite includes:
   - Module loading verification
   - Cluster creation and management
   - State updates and retrieval
   - Decision making (single and continuous)
   - Performance benchmarks

## Usage

See `src/go-bridge/README.md` for JavaScript integration examples.

Quick test from browser console:
```javascript
// After loading wasm_exec.js and the WASM module
const id = goCreateCluster('test');
goUpdateClusterState(id, JSON.stringify({population: 100, energy: 50}));
setTimeout(() => {
  const decision = goGetClusterDecision(id);
  console.log(JSON.parse(decision));
}, 200);
```

## Decision Logic

Clusters make decisions based on their current state:

- **grow**: When energy > 70 and population < 80
- **conserve**: When energy < 30
- **reduce**: When population > 120
- **mutate_more**: When mutation_rate < 0.03
- **mutate_less**: When mutation_rate > 0.15
- **maintain**: Default action

Each decision includes:
- `clusterId`: The ID of the cluster that made the decision
- `action`: The action to take
- `confidence`: Confidence level (0-1)
- `timestamp`: Unix timestamp when the decision was made

## Concurrency

- Each cluster runs in its own goroutine
- State updates are protected by mutexes
- Decision channels are buffered (100 decisions)
- Clusters can be stopped gracefully via stop channels
