/**
 * Go Neural Clusters Integration Test
 * Tests the Go WASM bridge functionality
 */

import { GoNeuralClusters } from './bridge.js';

/**
 * Run integration tests for Go neural clusters
 */
export async function runIntegrationTests() {
  console.log('=== Go Neural Clusters Integration Tests ===\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function test(name, fn) {
    return async () => {
      try {
        await fn();
        results.passed++;
        results.tests.push({ name, status: 'PASS' });
        console.log(`✓ ${name}`);
      } catch (error) {
        results.failed++;
        results.tests.push({ name, status: 'FAIL', error: error.message });
        console.error(`✗ ${name}`);
        console.error(`  Error: ${error.message}`);
      }
    };
  }

  const clusters = new GoNeuralClusters();

  // Test 1: Initialization
  await test('Should initialize Go WASM runtime', async () => {
    await clusters.init();
    if (!clusters.isInitialized()) {
      throw new Error('Initialization failed');
    }
  })();

  // Test 2: Create cluster
  await test('Should create a neural cluster', async () => {
    const id = clusters.createCluster('test-cluster-1');
    if (id !== 'test-cluster-1') {
      throw new Error(`Expected 'test-cluster-1', got '${id}'`);
    }
  })();

  // Test 3: Get cluster state
  await test('Should get cluster state', async () => {
    const state = clusters.getClusterState('test-cluster-1');
    if (!state || typeof state !== 'object') {
      throw new Error('Failed to get cluster state');
    }
    if (!('population' in state) || !('energy' in state) || !('mutation_rate' in state)) {
      throw new Error('State missing required fields');
    }
  })();

  // Test 4: Update cluster state
  await test('Should update cluster state', async () => {
    clusters.updateClusterState('test-cluster-1', {
      population: 120,
      energy: 60,
      mutation_rate: 0.08
    });
    const state = clusters.getClusterState('test-cluster-1');
    if (state.population !== 120 || state.energy !== 60 || state.mutation_rate !== 0.08) {
      throw new Error('State not updated correctly');
    }
  })();

  // Test 5: Get cluster decision
  await test('Should get cluster decision after waiting', async () => {
    // Wait for decision to be generated
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision = clusters.getClusterDecision('test-cluster-1');
    if (!decision) {
      throw new Error('No decision available');
    }
    if (!decision.clusterId || !decision.action || typeof decision.confidence !== 'number') {
      throw new Error('Decision missing required fields');
    }
  })();

  // Test 6: Decision logic - low energy
  await test('Should make "conserve" decision when energy is low', async () => {
    clusters.updateClusterState('test-cluster-1', {
      population: 100,
      energy: 20,
      mutation_rate: 0.05
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision = clusters.getClusterDecision('test-cluster-1');
    if (!decision || decision.action !== 'conserve') {
      throw new Error(`Expected "conserve", got "${decision?.action}"`);
    }
  })();

  // Test 7: Decision logic - high population
  await test('Should make "reduce" decision when population is high', async () => {
    clusters.updateClusterState('test-cluster-1', {
      population: 150,
      energy: 50,
      mutation_rate: 0.05
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision = clusters.getClusterDecision('test-cluster-1');
    if (!decision || decision.action !== 'reduce') {
      throw new Error(`Expected "reduce", got "${decision?.action}"`);
    }
  })();

  // Test 8: Decision logic - grow
  await test('Should make "grow" decision when energy high and population low', async () => {
    clusters.updateClusterState('test-cluster-1', {
      population: 60,
      energy: 80,
      mutation_rate: 0.05
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision = clusters.getClusterDecision('test-cluster-1');
    if (!decision || decision.action !== 'grow') {
      throw new Error(`Expected "grow", got "${decision?.action}"`);
    }
  })();

  // Test 9: Multiple clusters
  await test('Should create and manage multiple clusters', async () => {
    const id2 = clusters.createCluster('test-cluster-2');
    const id3 = clusters.createCluster('test-cluster-3');
    const list = clusters.listClusters();
    if (!list.includes('test-cluster-1') || !list.includes(id2) || !list.includes(id3)) {
      throw new Error('Not all clusters in list');
    }
    if (clusters.getActiveClusterCount() < 3) {
      throw new Error('Incorrect active cluster count');
    }
  })();

  // Test 10: Stop cluster
  await test('Should stop a cluster', async () => {
    clusters.stopCluster('test-cluster-2');
    const list = clusters.listClusters();
    if (list.includes('test-cluster-2')) {
      throw new Error('Cluster still in list after stopping');
    }
  })();

  // Test 11: Error handling - invalid cluster
  await test('Should throw error for invalid cluster ID', async () => {
    try {
      clusters.getClusterState('non-existent-cluster');
      throw new Error('Should have thrown error');
    } catch (error) {
      if (!error.message.includes('not found')) {
        throw new Error('Wrong error message');
      }
    }
  })();

  // Test 12: Stop all clusters
  await test('Should stop all clusters', async () => {
    clusters.stopAllClusters();
    if (clusters.getActiveClusterCount() !== 0) {
      throw new Error('Not all clusters stopped');
    }
  })();

  // Test 13: Decision confidence range
  await test('Should return confidence values between 0 and 1', async () => {
    const id = clusters.createCluster('confidence-test');
    clusters.updateClusterState(id, {
      population: 100,
      energy: 50,
      mutation_rate: 0.05
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision = clusters.getClusterDecision(id);
    if (!decision || decision.confidence < 0 || decision.confidence > 1) {
      throw new Error(`Confidence out of range: ${decision?.confidence}`);
    }
    clusters.stopCluster(id);
  })();

  // Test 14: Decision timestamp
  await test('Should include valid timestamp in decisions', async () => {
    const id = clusters.createCluster('timestamp-test');
    await new Promise(resolve => setTimeout(resolve, 200));
    const decision = clusters.getClusterDecision(id);
    if (!decision || !decision.timestamp) {
      throw new Error('Decision missing timestamp');
    }
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(decision.timestamp - now) > 5) {
      throw new Error('Timestamp too far from current time');
    }
    clusters.stopCluster(id);
  })();

  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
  }

  return results;
}

// Run tests if this file is loaded directly
if (import.meta.url === new URL(document.currentScript?.src || '', window.location.href).href) {
  runIntegrationTests();
}
