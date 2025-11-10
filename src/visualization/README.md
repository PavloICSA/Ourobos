# ChimeraVisualizer

Enhanced visualization system for OuroborOS-Chimera that provides real-time display of blockchain governance, quantum entropy, bio sensors, and neural cluster topology.

## Features

### 1. Neural Topology Fractal (Top-Left)
- Mandelbrot set rendering colored by neural cluster activity
- Zoom and pan controls
- Real-time updates based on organism state
- Cluster confidence mapped to color intensity

### 2. Blockchain Timeline (Top-Right)
- Current blockchain generation display
- Last genome hash with verification status
- Pending proposal voting progress
- Recent generation history (last 5)
- Transaction confirmation indicators

### 3. Quantum Entropy Status (Middle-Right)
- Backend type (hardware/simulator/mock)
- Service health indicator
- Entropy pool level bar (0-10)
- Bits used counter
- Last generation timestamp

### 4. Bio Sensor Readings (Bottom-Left)
- Real-time sensor values (light, temperature, acceleration)
- Mode indicator (real/mock)
- Health status
- Visual bars for each sensor
- Average influence calculation
- Update timestamp

### 5. Neural Cluster Status (Bottom-Right)
- Active cluster count
- Per-cluster decision display
- Action type and confidence level
- Color-coded confidence bars
- Real-time decision updates

## Usage

```javascript
import { ChimeraVisualizer } from './chimera-visualizer.js';

// Create visualizer
const canvas = document.getElementById('visualization');
const visualizer = new ChimeraVisualizer(canvas, 1200, 800);

// Update organism state
visualizer.updateState({
  population: 150,
  energy: 75,
  mutationRate: 0.08,
  generation: 42,
  blockchainGeneration: 15,
  lastGenomeHash: '0x1234...',
  lastBlockNumber: 12345,
  pendingProposalId: 7
});

// Add blockchain generation
visualizer.addBlockchainGeneration({
  generation: 15,
  hash: '0xabcd...',
  blockNumber: 12345,
  timestamp: Date.now(),
  verified: true
});

// Update quantum status
visualizer.updateQuantumStatus({
  backend: 'simulator',
  poolLevel: 7,
  entropyUsed: 256,
  lastGenerated: Date.now(),
  healthy: true
});

// Update sensor readings
visualizer.updateSensorReadings({
  light: 0.65,
  temperature: 0.58,
  acceleration: 0.42,
  timestamp: Date.now(),
  mode: 'real',
  healthy: true
});

// Update cluster decision
visualizer.updateClusterDecision('main', {
  action: 'grow',
  confidence: 0.85,
  timestamp: Date.now()
});

// Start animation loop
visualizer.startAnimation();
```

## Integration with ChimeraOrchestrator

```javascript
import { ChimeraOrchestrator } from '../orchestrator/chimera-orchestrator.js';
import { ChimeraVisualizer } from './chimera-visualizer.js';

const orchestrator = new ChimeraOrchestrator();
const visualizer = new ChimeraVisualizer(canvas, 1200, 800);

// Set visualizer in orchestrator
orchestrator.setVisualizer(visualizer);

// Initialize
await orchestrator.init();

// Listen for state changes
orchestrator.on('mutationComplete', (event) => {
  visualizer.updateState(orchestrator.getCurrentState());
});

orchestrator.on('proposalCreated', (event) => {
  visualizer.updateState(orchestrator.getCurrentState());
});

// Start visualization
visualizer.startAnimation();
```

## Interactive Controls

```javascript
// Zoom fractal
visualizer.zoom(0.1);  // Zoom in
visualizer.zoom(-0.1); // Zoom out

// Pan fractal
visualizer.pan(10, 0);  // Pan right
visualizer.pan(0, -10); // Pan up

// Reset view
visualizer.resetView();

// Stop animation
visualizer.stopAnimation();

// Clear all data
visualizer.clear();
```

## Layout Configuration

The visualizer uses a 6-panel layout:

```
┌─────────────────────┬─────────────┐
│                     │ Blockchain  │
│  Neural Topology    │  Timeline   │
│     (Fractal)       ├─────────────┤
│                     │  Quantum    │
│                     │  Entropy    │
├─────────────────────┼─────────────┤
│                     │   Neural    │
│   Bio Sensors       │  Clusters   │
│                     │             │
└─────────────────────┴─────────────┘
```

- Fractal: 60% width, 60% height (top-left)
- Blockchain: 40% width, 30% height (top-right)
- Quantum: 40% width, 30% height (middle-right)
- Sensors: 60% width, 40% height (bottom-left)
- Clusters: 40% width, 40% height (bottom-right)

## Performance

- Target frame rate: 30 FPS
- Fractal rendering optimized for real-time updates
- Throttled animation loop to prevent excessive CPU usage
- Efficient canvas operations with minimal redraws

## Requirements Satisfied

- **8.5**: Blockchain generation display and verification status
- **9.1, 9.2, 9.3, 9.4**: Complete organism state visualization
- **3.1, 3.2, 3.3**: Quantum entropy backend and pool visualization
- **4.2, 4.3, 4.4**: Bio sensor readings and health status
- **7.2, 7.3**: Neural cluster decisions and topology mapping

## Color Scheme

- Background: Black (#000000)
- Blockchain: Green (#00ff00)
- Quantum: Cyan (#00ffff)
- Bio Sensors: Green/Yellow/Orange (#00ff00, #ffff00, #ff8800)
- Neural Clusters: Magenta (#ff00ff)
- Panel borders: Green (#00ff00)
- Health indicators: Green (online), Red (offline), Yellow (degraded)

## Example

See `example.js` for a complete working example with simulated data updates.
