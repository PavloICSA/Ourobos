/**
 * ChimeraOrchestrator Example
 * 
 * Demonstrates how to use the ChimeraOrchestrator to:
 * - Initialize all services
 * - Propose mutations
 * - Vote on proposals
 * - Execute approved mutations
 * - Monitor service health
 */

import { ChimeraOrchestrator } from './chimera-orchestrator.js';

async function main() {
  console.log('=== ChimeraOrchestrator Example ===\n');
  
  // Create orchestrator instance
  const orchestrator = new ChimeraOrchestrator({
    enableBlockchain: true,
    enableQuantum: true,
    enableBioSensor: true,
    useMockQuantum: false,  // Try real quantum first
    useMockBioSensor: false // Try real sensors first
  });
  
  // Listen for events
  orchestrator.on('proposalCreated', (event) => {
    console.log('\n[EVENT] Proposal Created:', event.proposalId);
  });
  
  orchestrator.on('voteCast', (event) => {
    console.log('\n[EVENT] Vote Cast:', event.support ? 'YES' : 'NO');
  });
  
  orchestrator.on('mutationComplete', (event) => {
    console.log('\n[EVENT] Mutation Complete!');
    console.log('  Generation:', event.generation);
    console.log('  New State:', event.newState);
  });
  
  orchestrator.on('serviceHealthChanged', (health) => {
    console.log('\n[EVENT] Service Health Changed:');
    console.log('  Blockchain:', health.blockchain ? '✓' : '✗');
    console.log('  Quantum:', health.quantum ? '✓' : '✗');
    console.log('  Bio Sensor:', health.bioSensor ? '✓' : '✗');
    console.log('  Go WASM:', health.goWasm ? '✓' : '✗');
  });
  
  try {
    // Initialize orchestrator
    console.log('Step 1: Initializing orchestrator...\n');
    await orchestrator.init();
    
    console.log('\nOrchestrator initialized successfully!');
    console.log('Current state:', orchestrator.getCurrentState());
    
    // Check service health
    console.log('\n\nStep 2: Checking service health...\n');
    const health = orchestrator.getServiceHealth();
    console.log('Service Health:');
    console.log('  Blockchain:', health.blockchain ? '✓ Online' : '✗ Offline');
    console.log('  Quantum:', health.quantum ? '✓ Online' : '✗ Mock Mode');
    console.log('  Bio Sensor:', health.bioSensor ? '✓ Online' : '✗ Mock Mode');
    console.log('  Go WASM:', health.goWasm ? '✓ Online' : '✗ Offline');
    
    // Get detailed status
    const detailedStatus = orchestrator.getDetailedServiceStatus();
    console.log('\nOverall System Health:', detailedStatus.overall);
    
    // Propose a mutation
    console.log('\n\nStep 3: Proposing mutation...\n');
    
    const mutationCode = `
      IF population > 100 THEN
        mutation_rate := 0.05
      ELSE
        mutation_rate := 0.1
      END
    `;
    
    const proposalId = await orchestrator.proposeMutation(mutationCode, 'algol');
    
    console.log('\nProposal submitted!');
    console.log('Proposal ID:', proposalId);
    
    // Get proposal details
    const proposal = await orchestrator.getProposal(proposalId);
    console.log('Proposal details:', proposal);
    
    // Vote on the proposal
    console.log('\n\nStep 4: Voting on proposal...\n');
    await orchestrator.vote(proposalId, true); // Vote YES
    
    console.log('Vote recorded!');
    
    // Check voting status
    const votingStatus = await orchestrator.getVotingStatus(proposalId);
    console.log('Voting status:', votingStatus);
    
    // Wait for voting period (in real scenario, this would be 60 seconds)
    console.log('\n\nStep 5: Waiting for voting period...');
    console.log('(In production, wait 60 seconds for voting to complete)');
    console.log('(For demo, we\'ll proceed immediately)\n');
    
    // Check proposal state
    const proposalState = await orchestrator.getProposalState(proposalId);
    console.log('Proposal state:', proposalState);
    
    // Execute the mutation (if approved)
    if (proposalState === 'approved' || proposalState === 'voting') {
      console.log('\n\nStep 6: Executing mutation...\n');
      
      const result = await orchestrator.executeMutation(proposalId);
      
      console.log('\nMutation executed successfully!');
      console.log('Result:', result);
      
      // Get updated state
      const newState = orchestrator.getCurrentState();
      console.log('\nUpdated organism state:');
      console.log('  Population:', newState.population);
      console.log('  Energy:', newState.energy);
      console.log('  Mutation Rate:', newState.mutationRate);
      console.log('  Generation:', newState.generation);
      console.log('  Blockchain Generation:', newState.blockchainGeneration);
    } else {
      console.log('\nProposal not approved, skipping execution');
    }
    
    // List pending mutations
    console.log('\n\nStep 7: Checking pending mutations...\n');
    const pending = orchestrator.listPendingMutations();
    console.log('Pending mutations:', pending.length);
    
    // Get health monitor stats
    const healthMonitor = orchestrator.getHealthMonitor();
    if (healthMonitor) {
      console.log('\n\nHealth Monitor Statistics:');
      console.log(healthMonitor.getStats());
    }
    
    console.log('\n\n=== Example Complete ===');
    
  } catch (error) {
    console.error('\nError:', error);
    console.error(error.stack);
  }
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
