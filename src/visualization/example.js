/**
 * ChimeraVisualizer Example
 * 
 * Demonstrates how to use the enhanced visualization system
 * for OuroborOS-Chimera with blockchain, quantum, and bio sensor displays.
 */

import { ChimeraVisualizer } from './chimera-visualizer.js';

// Create canvas
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// Create visualizer
const visualizer = new ChimeraVisualizer(canvas, 1200, 800);

// Example organism state
const exampleState = {
  population: 150,
  energy: 75,
  mutationRate: 0.08,
  generation: 42,
  blockchainGeneration: 15,
  lastGenomeHash: '0x1234567890abcdef1234567890abcdef12345678',
  lastBlockNumber: 12345,
  pendingProposalId: null
};

// Update state
visualizer.updateState(exampleState);

// Add blockchain history
for (let i = 10; i <= 15; i++) {
  visualizer.addBlockchainGeneration({
    generation: i,
    hash: `0x${Math.random().toString(16).substring(2, 42)}`,
    blockNumber: 12340 + i,
    timestamp: Date.now() - (15 - i) * 60000,
    verified: true
  });
}

// Update quantum status
visualizer.updateQuantumStatus({
  backend: 'simulator',
  poolLevel: 7,
  entropyUsed: 256,
  lastGenerated: Date.now() - 5000,
  healthy: true
});

// Update sensor readings
visualizer.updateSensorReadings({
  light: 0.65,
  temperature: 0.58,
  acceleration: 0.42,
  timestamp: Date.now() - 2000,
  mode: 'mock',
  healthy: true
});

// Update cluster decisions
visualizer.updateClusterDecision('main', {
  action: 'grow',
  confidence: 0.85,
  timestamp: Date.now()
});

visualizer.updateClusterDecision('secondary', {
  action: 'conserve',
  confidence: 0.62,
  timestamp: Date.now()
});

// Start animation
visualizer.startAnimation();

// Simulate updates
setInterval(() => {
  // Update sensor readings
  visualizer.updateSensorReadings({
    light: 0.5 + Math.random() * 0.3,
    temperature: 0.5 + Math.random() * 0.3,
    acceleration: 0.3 + Math.random() * 0.4,
    timestamp: Date.now(),
    mode: 'mock',
    healthy: true
  });
  
  // Update quantum pool
  const currentPool = visualizer.quantumStatus?.poolLevel || 7;
  visualizer.updateQuantumStatus({
    backend: 'simulator',
    poolLevel: Math.max(0, currentPool - 0.1),
    entropyUsed: 256,
    lastGenerated: Date.now(),
    healthy: true
  });
}, 2000);

console.log('ChimeraVisualizer example running');
console.log('Visualizer displays:');
console.log('  - Neural topology fractal (top-left)');
console.log('  - Blockchain timeline (top-right)');
console.log('  - Quantum entropy status (middle-right)');
console.log('  - Bio sensor readings (bottom-left)');
console.log('  - Neural cluster status (bottom-right)');
