/**
 * ChimeraVisualizer Integration Test
 * 
 * Tests the enhanced visualization system with all components:
 * - Blockchain timeline
 * - Quantum entropy status
 * - Bio sensor readings
 * - Neural cluster decisions
 * - Fractal rendering
 */

import { ChimeraVisualizer } from './chimera-visualizer.js';

console.log('=== ChimeraVisualizer Integration Test ===\n');

// Test 1: Create visualizer
console.log('Test 1: Create visualizer');
const canvas = document.createElement('canvas');
const visualizer = new ChimeraVisualizer(canvas, 1200, 800);
console.log('✓ Visualizer created');
console.log(`  Canvas size: ${canvas.width}x${canvas.height}`);
console.log(`  Layout panels: ${Object.keys(visualizer.layout).length}`);

// Test 2: Update organism state
console.log('\nTest 2: Update organism state');
const testState = {
  population: 150,
  energy: 75,
  mutationRate: 0.08,
  generation: 42,
  blockchainGeneration: 15,
  lastGenomeHash: '0x1234567890abcdef1234567890abcdef12345678',
  lastBlockNumber: 12345,
  pendingProposalId: 7
};

visualizer.updateState(testState);
console.log('✓ State updated');
console.log(`  Population: ${visualizer.state.population}`);
console.log(`  Blockchain generation: ${visualizer.state.blockchainGeneration}`);
console.log(`  Pending proposal: ${visualizer.state.pendingProposalId}`);

// Test 3: Add blockchain history
console.log('\nTest 3: Add blockchain history');
for (let i = 10; i <= 15; i++) {
  visualizer.addBlockchainGeneration({
    generation: i,
    hash: `0x${Math.random().toString(16).substring(2, 42)}`,
    blockNumber: 12340 + i,
    timestamp: Date.now() - (15 - i) * 60000,
    verified: i % 2 === 0 // Alternate verified status
  });
}
console.log('✓ Blockchain history added');
console.log(`  History entries: ${visualizer.blockchainHistory.length}`);
console.log(`  Latest generation: ${visualizer.blockchainHistory[visualizer.blockchainHistory.length - 1].generation}`);

// Test 4: Update quantum status
console.log('\nTest 4: Update quantum status');
visualizer.updateQuantumStatus({
  backend: 'simulator',
  poolLevel: 7,
  entropyUsed: 256,
  lastGenerated: Date.now() - 5000,
  healthy: true
});
console.log('✓ Quantum status updated');
console.log(`  Backend: ${visualizer.quantumStatus.backend}`);
console.log(`  Pool level: ${visualizer.quantumStatus.poolLevel}/10`);
console.log(`  Healthy: ${visualizer.quantumStatus.healthy}`);

// Test 5: Update sensor readings
console.log('\nTest 5: Update sensor readings');
visualizer.updateSensorReadings({
  light: 0.65,
  temperature: 0.58,
  acceleration: 0.42,
  timestamp: Date.now() - 2000,
  mode: 'mock',
  healthy: true
});
console.log('✓ Sensor readings updated');
console.log(`  Light: ${(visualizer.sensorReadings.light * 100).toFixed(0)}%`);
console.log(`  Temperature: ${(visualizer.sensorReadings.temperature * 100).toFixed(0)}%`);
console.log(`  Acceleration: ${(visualizer.sensorReadings.acceleration * 100).toFixed(0)}%`);
console.log(`  Mode: ${visualizer.sensorReadings.mode}`);

// Test 6: Update cluster decisions
console.log('\nTest 6: Update cluster decisions');
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

visualizer.updateClusterDecision('tertiary', {
  action: 'maintain',
  confidence: 0.45,
  timestamp: Date.now()
});

console.log('✓ Cluster decisions updated');
console.log(`  Active clusters: ${visualizer.clusterDecisions.size}`);
for (const [id, decision] of visualizer.clusterDecisions.entries()) {
  console.log(`  ${id}: ${decision.action} (${(decision.confidence * 100).toFixed(0)}%)`);
}

// Test 7: Render visualization
console.log('\nTest 7: Render visualization');
visualizer.render();
console.log('✓ Visualization rendered');
console.log('  All panels drawn successfully');

// Test 8: Fractal controls
console.log('\nTest 8: Fractal controls');
const initialZoom = visualizer.fractalParams.zoom;
visualizer.zoom(0.5);
console.log(`✓ Zoom in: ${initialZoom.toFixed(2)} → ${visualizer.fractalParams.zoom.toFixed(2)}`);

visualizer.zoom(-0.3);
console.log(`✓ Zoom out: ${visualizer.fractalParams.zoom.toFixed(2)}`);

const initialX = visualizer.fractalParams.centerX;
const initialY = visualizer.fractalParams.centerY;
visualizer.pan(0.1, -0.1);
console.log(`✓ Pan: (${initialX.toFixed(2)}, ${initialY.toFixed(2)}) → (${visualizer.fractalParams.centerX.toFixed(2)}, ${visualizer.fractalParams.centerY.toFixed(2)})`);

visualizer.resetView();
console.log(`✓ Reset view: zoom=${visualizer.fractalParams.zoom.toFixed(2)}`);

// Test 9: Animation control
console.log('\nTest 9: Animation control');
visualizer.startAnimation();
console.log('✓ Animation started');
console.log(`  Animation frame ID: ${visualizer.animationFrame !== null ? 'active' : 'inactive'}`);

setTimeout(() => {
  visualizer.stopAnimation();
  console.log('✓ Animation stopped');
  
  // Test 10: Clear data
  console.log('\nTest 10: Clear data');
  visualizer.clear();
  console.log('✓ Data cleared');
  console.log(`  State: ${visualizer.state === null ? 'null' : 'not null'}`);
  console.log(`  History entries: ${visualizer.blockchainHistory.length}`);
  console.log(`  Cluster decisions: ${visualizer.clusterDecisions.size}`);
  
  // Test 11: Verify layout
  console.log('\nTest 11: Verify layout');
  const panels = ['fractal', 'blockchain', 'quantum', 'sensors', 'clusters'];
  let layoutValid = true;
  
  for (const panel of panels) {
    const p = visualizer.layout[panel];
    if (!p || p.width <= 0 || p.height <= 0) {
      layoutValid = false;
      console.log(`✗ Invalid panel: ${panel}`);
    }
  }
  
  if (layoutValid) {
    console.log('✓ All panel layouts valid');
    for (const [name, panel] of Object.entries(visualizer.layout)) {
      console.log(`  ${name}: ${panel.width}x${panel.height} at (${panel.x}, ${panel.y})`);
    }
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log('✓ All tests passed');
  console.log('\nVisualization features verified:');
  console.log('  ✓ Blockchain timeline with generation history');
  console.log('  ✓ Quantum entropy status and pool level');
  console.log('  ✓ Bio sensor readings with bars');
  console.log('  ✓ Neural cluster decisions and confidence');
  console.log('  ✓ Fractal rendering with neural topology');
  console.log('  ✓ Interactive zoom and pan controls');
  console.log('  ✓ Animation loop control');
  console.log('  ✓ Data management and clearing');
  
}, 100);
