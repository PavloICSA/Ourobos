/**
 * Go Neural Clusters Example
 * Demonstrates usage of the Go WASM bridge
 */

import { GoNeuralClusters } from './bridge.js';

async function runExample() {
  console.log('=== Go Neural Clusters Example ===\n');

  // Create instance
  const clusters = new GoNeuralClusters();

  try {
    // Initialize Go WASM runtime
    console.log('1. Initializing Go WASM runtime...');
    await clusters.init();
    console.log('   ✓ Initialized\n');

    // Create a neural cluster
    console.log('2. Creating neural cluster...');
    const clusterId = clusters.createCluster('main-cluster');
    console.log(`   ✓ Created cluster: ${clusterId}\n`);

    // Update cluster state
    console.log('3. Updating cluster state...');
    clusters.updateClusterState(clusterId, {
      population: 100,
      energy: 75,
      mutation_rate: 0.05
    });
    console.log('   ✓ State updated\n');

    // Get current state
    console.log('4. Getting cluster state...');
    const state = clusters.getClusterState(clusterId);
    console.log('   Current state:', state);
    console.log('');

    // Wait for decisions to be generated
    console.log('5. Waiting for decisions (500ms)...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get decisions
    console.log('6. Getting cluster decisions...');
    for (let i = 0; i < 5; i++) {
      const decision = clusters.getClusterDecision(clusterId);
      if (decision) {
        console.log(`   Decision ${i + 1}:`, {
          action: decision.action,
          confidence: decision.confidence.toFixed(2),
          timestamp: new Date(decision.timestamp * 1000).toISOString()
        });
      } else {
        console.log(`   Decision ${i + 1}: No decision available`);
      }
    }
    console.log('');

    // Test different state scenarios
    console.log('7. Testing different state scenarios...\n');

    // Low energy scenario
    console.log('   Scenario A: Low energy (should conserve)');
    clusters.updateClusterState(clusterId, {
      population: 100,
      energy: 20,
      mutation_rate: 0.05
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision1 = clusters.getClusterDecision(clusterId);
    if (decision1) {
      console.log(`   → Action: ${decision1.action}, Confidence: ${decision1.confidence.toFixed(2)}`);
    }

    // High population scenario
    console.log('   Scenario B: High population (should reduce)');
    clusters.updateClusterState(clusterId, {
      population: 150,
      energy: 50,
      mutation_rate: 0.05
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision2 = clusters.getClusterDecision(clusterId);
    if (decision2) {
      console.log(`   → Action: ${decision2.action}, Confidence: ${decision2.confidence.toFixed(2)}`);
    }

    // High energy, low population scenario
    console.log('   Scenario C: High energy, low population (should grow)');
    clusters.updateClusterState(clusterId, {
      population: 50,
      energy: 80,
      mutation_rate: 0.05
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision3 = clusters.getClusterDecision(clusterId);
    if (decision3) {
      console.log(`   → Action: ${decision3.action}, Confidence: ${decision3.confidence.toFixed(2)}`);
    }
    console.log('');

    // Create multiple clusters
    console.log('8. Creating multiple clusters...');
    const cluster2 = clusters.createCluster('cluster-2');
    const cluster3 = clusters.createCluster('cluster-3');
    console.log(`   ✓ Created ${cluster2} and ${cluster3}\n`);

    // List all clusters
    console.log('9. Listing all clusters...');
    const allClusters = clusters.listClusters();
    console.log('   Active clusters:', allClusters);
    console.log(`   Total count: ${clusters.getActiveClusterCount()}\n`);

    // Stop individual cluster
    console.log('10. Stopping cluster-2...');
    clusters.stopCluster(cluster2);
    console.log(`    ✓ Stopped ${cluster2}`);
    console.log(`    Remaining clusters: ${clusters.getActiveClusterCount()}\n`);

    // Stop all clusters
    console.log('11. Stopping all remaining clusters...');
    clusters.stopAllClusters();
    console.log(`    ✓ All clusters stopped`);
    console.log(`    Active clusters: ${clusters.getActiveClusterCount()}\n`);

    console.log('=== Example Complete ===');

  } catch (error) {
    console.error('Error during example:', error);
  }
}

// Run example if this file is loaded directly
if (import.meta.url === new URL(document.currentScript?.src || '', window.location.href).href) {
  runExample();
}

export { runExample };
