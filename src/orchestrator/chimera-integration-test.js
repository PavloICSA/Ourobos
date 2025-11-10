/**
 * ChimeraOrchestrator Integration Test
 * 
 * Tests the complete integration of all orchestrator components
 */

import { ChimeraOrchestrator } from './chimera-orchestrator.js';

async function testOrchestrator() {
  console.log('=== ChimeraOrchestrator Integration Test ===\n');
  
  let passed = 0;
  let failed = 0;
  
  function assert(condition, message) {
    if (condition) {
      console.log('✓', message);
      passed++;
    } else {
      console.error('✗', message);
      failed++;
    }
  }
  
  try {
    // Test 1: Initialization
    console.log('\n--- Test 1: Initialization ---');
    const orchestrator = new ChimeraOrchestrator({
      enableBlockchain: false, // Use mock mode for testing
      enableQuantum: true,
      enableBioSensor: true,
      useMockQuantum: true,
      useMockBioSensor: true
    });
    
    assert(!orchestrator.isInitialized(), 'Orchestrator not initialized before init()');
    
    await orchestrator.init();
    
    assert(orchestrator.isInitialized(), 'Orchestrator initialized after init()');
    assert(orchestrator.metaCompiler !== null, 'Meta-compiler initialized');
    assert(orchestrator.ourocodeExecutor !== null, 'Ourocode executor initialized');
    assert(orchestrator.quantumClient !== null, 'Quantum client initialized');
    assert(orchestrator.bioSensorClient !== null, 'Bio sensor client initialized');
    
    // Test 2: State Management
    console.log('\n--- Test 2: State Management ---');
    const initialState = orchestrator.getCurrentState();
    
    assert(initialState.population === 100, 'Initial population is 100');
    assert(initialState.energy === 50, 'Initial energy is 50');
    assert(initialState.mutationRate === 0.05, 'Initial mutation rate is 0.05');
    assert(initialState.generation === 0, 'Initial generation is 0');
    
    orchestrator.updateState({ population: 150, energy: 75 });
    const updatedState = orchestrator.getCurrentState();
    
    assert(updatedState.population === 150, 'Population updated to 150');
    assert(updatedState.energy === 75, 'Energy updated to 75');
    
    // Test 3: Mutation Proposal
    console.log('\n--- Test 3: Mutation Proposal ---');
    const code = `IF population > 100 THEN mutation_rate := 0.05 END`;
    
    const proposalId = await orchestrator.proposeMutation(code, 'algol');
    
    assert(typeof proposalId === 'number', 'Proposal ID is a number');
    assert(proposalId > 0, 'Proposal ID is positive');
    
    const pending = orchestrator.getPendingMutation(proposalId);
    
    assert(pending !== null, 'Pending mutation exists');
    assert(pending.code === code, 'Pending mutation has correct code');
    assert(pending.language === 'algol', 'Pending mutation has correct language');
    assert(pending.ourocodeModule !== null, 'Ourocode module generated');
    
    // Test 4: Voting
    console.log('\n--- Test 4: Voting ---');
    
    // In mock mode, voting doesn't fail
    await orchestrator.vote(proposalId, true);
    assert(true, 'Vote submitted successfully');
    
    const proposal = await orchestrator.getProposal(proposalId);
    assert(proposal !== null, 'Proposal retrieved');
    assert(proposal.mock === true, 'Proposal is in mock mode');
    
    // Test 5: Voting Status
    console.log('\n--- Test 5: Voting Status ---');
    const votingStatus = await orchestrator.getVotingStatus(proposalId);
    
    assert(votingStatus.found === true, 'Voting status found');
    assert(votingStatus.proposalId === proposalId, 'Correct proposal ID');
    
    const proposalState = await orchestrator.getProposalState(proposalId);
    assert(['voting', 'approved', 'rejected'].includes(proposalState), 
           `Proposal state is valid: ${proposalState}`);
    
    // Test 6: Mutation Execution
    console.log('\n--- Test 6: Mutation Execution ---');
    
    const result = await orchestrator.executeMutation(proposalId);
    
    assert(result.success === true, 'Mutation executed successfully');
    assert(result.proposalId === proposalId, 'Correct proposal ID in result');
    assert(result.newState !== null, 'New state returned');
    assert(result.quantumEntropy !== '', 'Quantum entropy generated');
    assert(result.sensorReadings !== null, 'Sensor readings obtained');
    
    // Verify mutation was removed from pending
    const pendingAfter = orchestrator.getPendingMutation(proposalId);
    assert(pendingAfter === null, 'Pending mutation removed after execution');
    
    // Test 7: Service Health
    console.log('\n--- Test 7: Service Health ---');
    const health = orchestrator.getServiceHealth();
    
    assert(typeof health.blockchain === 'boolean', 'Blockchain health is boolean');
    assert(typeof health.quantum === 'boolean', 'Quantum health is boolean');
    assert(typeof health.bioSensor === 'boolean', 'Bio sensor health is boolean');
    assert(typeof health.goWasm === 'boolean', 'Go WASM health is boolean');
    
    const detailedStatus = orchestrator.getDetailedServiceStatus();
    assert(detailedStatus.overall !== undefined, 'Overall health status exists');
    assert(['healthy', 'degraded', 'critical', 'unknown'].includes(detailedStatus.overall),
           `Overall health is valid: ${detailedStatus.overall}`);
    
    // Test 8: Health Monitor
    console.log('\n--- Test 8: Health Monitor ---');
    const healthMonitor = orchestrator.getHealthMonitor();
    
    assert(healthMonitor !== null, 'Health monitor exists');
    
    const stats = healthMonitor.getStats();
    assert(stats.isMonitoring === true, 'Health monitoring is active');
    assert(Array.isArray(stats.services), 'Services array exists');
    assert(stats.services.length === 4, 'Four services monitored');
    
    // Test 9: Event System
    console.log('\n--- Test 9: Event System ---');
    let eventFired = false;
    
    orchestrator.on('mutationComplete', (event) => {
      eventFired = true;
    });
    
    // Propose and execute another mutation to trigger event
    const proposalId2 = await orchestrator.proposeMutation(
      'IF energy > 50 THEN population := population + 10 END',
      'algol'
    );
    
    await orchestrator.executeMutation(proposalId2);
    
    // Give event time to fire
    await new Promise(resolve => setTimeout(resolve, 100));
    
    assert(eventFired === true, 'Mutation complete event fired');
    
    // Test 10: Multiple Pending Mutations
    console.log('\n--- Test 10: Multiple Pending Mutations ---');
    
    const proposalId3 = await orchestrator.proposeMutation(
      'mutation_rate := 0.1',
      'algol'
    );
    
    const proposalId4 = await orchestrator.proposeMutation(
      'energy := energy - 5',
      'algol'
    );
    
    const allPending = orchestrator.listPendingMutations();
    assert(allPending.length === 2, `Two pending mutations: ${allPending.length}`);
    
    // Clean up
    await orchestrator.executeMutation(proposalId3);
    await orchestrator.executeMutation(proposalId4);
    
    const noPending = orchestrator.listPendingMutations();
    assert(noPending.length === 0, 'All pending mutations executed');
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    if (failed === 0) {
      console.log('\n✓ All tests passed!');
      return true;
    } else {
      console.log(`\n✗ ${failed} test(s) failed`);
      return false;
    }
    
  } catch (error) {
    console.error('\n✗ Test error:', error);
    console.error(error.stack);
    return false;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testOrchestrator()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { testOrchestrator };
