/**
 * Chimera Data Models - Usage Examples
 * 
 * Demonstrates how to use the extended data models for OuroborOS-Chimera
 */

import {
  ChimeraOrganismState,
  MutationProposal,
  ChimeraGenomeSnapshot,
  Decision
} from './data-models.js';

console.log('=== Chimera Data Models Examples ===\n');

// Example 1: Creating and updating organism state
console.log('Example 1: ChimeraOrganismState');
console.log('-----------------------------------');

const state = new ChimeraOrganismState();
state.population = 150;
state.energy = 75;
state.generation = 5;

console.log('Initial state:');
console.log(`  Population: ${state.population}`);
console.log(`  Energy: ${state.energy}`);
console.log(`  Generation: ${state.generation}`);

// Simulate blockchain mutation approval
state.updateBlockchainState(
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  12345,
  '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
);

console.log('\nAfter blockchain update:');
console.log(`  Blockchain Generation: ${state.blockchainGeneration}`);
console.log(`  Last Genome Hash: ${state.lastGenomeHash?.substring(0, 16)}...`);
console.log(`  Last Block Number: ${state.lastBlockNumber}`);

// Simulate quantum entropy generation
state.updateQuantumState(
  '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
  'simulator'
);

console.log('\nAfter quantum update:');
console.log(`  Quantum Backend: ${state.quantumBackend}`);
console.log(`  Quantum Entropy: ${state.quantumEntropyUsed?.substring(0, 16)}...`);

// Simulate bio sensor readings
state.updateSensorState({
  light: 0.7,
  temperature: 0.6,
  acceleration: 0.3,
  timestamp: Date.now()
}, 'real');

console.log('\nAfter sensor update:');
console.log(`  Light: ${state.environmentalLight}`);
console.log(`  Temperature: ${state.environmentalTemp}`);
console.log(`  Acceleration: ${state.environmentalAccel}`);
console.log(`  Sensor Mode: ${state.sensorMode}`);

// Simulate neural cluster decision
const decision = new Decision('cluster-1', 'grow', 0.85, Date.now());
state.updateClusterState('cluster-1', decision);

console.log('\nAfter cluster update:');
console.log(`  Active Clusters: ${state.activeClusterIds.join(', ')}`);
console.log(`  Cluster Decision: ${decision.action} (confidence: ${decision.confidence})`);

// Serialize to JSON
const stateJSON = state.toJSON();
console.log('\nSerialized state size:', JSON.stringify(stateJSON).length, 'bytes');

// Restore from JSON
const restoredState = ChimeraOrganismState.fromJSON(stateJSON);
console.log('Restored state population:', restoredState.population);

console.log('\n');

// Example 2: Creating and managing mutation proposals
console.log('Example 2: MutationProposal');
console.log('-----------------------------------');

const proposal = new MutationProposal(
  1,
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
  '0xabcdef1234567890abcdef1234567890abcdef12'
);

proposal.sourceCode = 'IF population > 100 THEN mutation_rate := 0.05';
proposal.sourceLanguage = 'algol';
proposal.description = 'Reduce mutation rate for stable populations';
proposal.tags = ['stability', 'population-control'];
proposal.setVotingPeriod(60); // 60 seconds

console.log('Proposal created:');
console.log(`  ID: ${proposal.id}`);
console.log(`  Language: ${proposal.sourceLanguage}`);
console.log(`  Description: ${proposal.description}`);
console.log(`  Voting ends at: ${new Date(proposal.votingEndsAt).toISOString()}`);

// Simulate voting
proposal.updateVotes(7, 2);

console.log('\nVoting status:');
console.log(`  Votes For: ${proposal.votesFor}`);
console.log(`  Votes Against: ${proposal.votesAgainst}`);
console.log(`  Approval: ${proposal.getApprovalPercentage().toFixed(1)}%`);
console.log(`  Voting Active: ${proposal.isVotingActive()}`);

// Simulate execution
proposal.markExecuted(true);

console.log('\nAfter execution:');
console.log(`  Executed: ${proposal.executed}`);
console.log(`  Approved: ${proposal.approved}`);

// Serialize and restore
const proposalJSON = proposal.toJSON();
const restoredProposal = MutationProposal.fromJSON(proposalJSON);
console.log('Restored proposal ID:', restoredProposal.id);

console.log('\n');

// Example 3: Creating genome snapshots with full provenance
console.log('Example 3: ChimeraGenomeSnapshot');
console.log('-----------------------------------');

const snapshot = new ChimeraGenomeSnapshot('Generation 42 - Stable Evolution');

// Set organism state
snapshot.setOrganismState(state);

// Set blockchain proof
snapshot.setBlockchainProof(
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  12345,
  '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  '0xdef0123456789abcdef0123456789abcdef01234',
  1337
);

// Set quantum provenance
snapshot.setQuantumProvenance(
  '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
  'hardware',
  256
);

// Set sensor snapshot
snapshot.setSensorSnapshot({
  light: 0.7,
  temperature: 0.6,
  acceleration: 0.3,
  timestamp: Date.now()
}, 'real');

// Update metadata
snapshot.updateMetadata({
  totalMutations: 15,
  approvedProposals: 12,
  rejectedProposals: 3,
  createdBy: 'user@example.com',
  notes: 'Stable evolution phase with high approval rate'
});

console.log('Snapshot created:');
console.log(`  Name: ${snapshot.name}`);
console.log(`  Version: ${snapshot.version}`);
console.log(`  Generation: ${snapshot.metadata.generation}`);
console.log(`  Has Blockchain Proof: ${snapshot.hasBlockchainProof()}`);
console.log(`  Has Quantum Provenance: ${snapshot.hasQuantumProvenance()}`);

console.log('\nSnapshot Summary:');
console.log(snapshot.getSummary());

// Export to .obg file format
const obgData = snapshot.exportToOBG();
console.log('\n.obg file size:', obgData.length, 'bytes');

// Import from .obg file
const importedSnapshot = ChimeraGenomeSnapshot.importFromOBG(obgData);
console.log('\nImported snapshot:');
console.log(`  Name: ${importedSnapshot.name}`);
console.log(`  Generation: ${importedSnapshot.metadata.generation}`);
console.log(`  Blockchain verified: ${importedSnapshot.blockchainProof.verified}`);

console.log('\n');

// Example 4: Working with neural cluster decisions
console.log('Example 4: Neural Cluster Decisions');
console.log('-----------------------------------');

const decisions = [
  new Decision('cluster-1', 'grow', 0.85, Date.now()),
  new Decision('cluster-2', 'conserve', 0.92, Date.now()),
  new Decision('cluster-3', 'maintain', 0.67, Date.now())
];

console.log('Cluster decisions:');
decisions.forEach(d => {
  console.log(`  ${d.clusterID}: ${d.action} (confidence: ${d.confidence})`);
});

// Find highest confidence decision
const bestDecision = decisions.reduce((best, current) => 
  current.confidence > best.confidence ? current : best
);

console.log(`\nHighest confidence: ${bestDecision.clusterID} - ${bestDecision.action}`);

// Serialize decisions
const decisionsJSON = decisions.map(d => d.toJSON());
const restoredDecisions = decisionsJSON.map(d => Decision.fromJSON(d));
console.log(`Restored ${restoredDecisions.length} decisions`);

console.log('\n');

// Example 5: Complete mutation lifecycle
console.log('Example 5: Complete Mutation Lifecycle');
console.log('-----------------------------------');

// 1. Create initial state
const lifecycleState = new ChimeraOrganismState();
lifecycleState.population = 100;
lifecycleState.energy = 50;
console.log('1. Initial state created');

// 2. Create mutation proposal
const lifecycleProposal = new MutationProposal(
  1,
  '0x1111111111111111111111111111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222222222222222222222222222',
  '0x3333333333333333333333333333333333333333'
);
lifecycleProposal.sourceCode = 'IF energy < 30 THEN mutation_rate := 0.02';
lifecycleProposal.sourceLanguage = 'algol';
lifecycleProposal.setVotingPeriod(60);
console.log('2. Mutation proposal created');

// 3. Voting phase
lifecycleProposal.updateVotes(8, 1);
console.log(`3. Voting complete: ${lifecycleProposal.getApprovalPercentage().toFixed(1)}% approval`);

// 4. Execution approved
lifecycleProposal.markExecuted(true);
console.log('4. Proposal executed and approved');

// 5. Update state with quantum entropy
lifecycleState.updateQuantumState(
  '0x4444444444444444444444444444444444444444444444444444444444444444',
  'simulator'
);
console.log('5. Quantum entropy applied');

// 6. Update state with sensor readings
lifecycleState.updateSensorState({
  light: 0.8,
  temperature: 0.7,
  acceleration: 0.2,
  timestamp: Date.now()
}, 'real');
console.log('6. Bio sensor readings applied');

// 7. Update blockchain state
lifecycleState.updateBlockchainState(
  '0x5555555555555555555555555555555555555555555555555555555555555555',
  12346,
  '0x6666666666666666666666666666666666666666666666666666666666666666'
);
console.log('7. Blockchain state recorded');

// 8. Create snapshot
const lifecycleSnapshot = new ChimeraGenomeSnapshot('Mutation Lifecycle Complete');
lifecycleSnapshot.setOrganismState(lifecycleState);
lifecycleSnapshot.setBlockchainProof(
  lifecycleState.lastGenomeHash,
  lifecycleState.lastBlockNumber,
  lifecycleState.lastTransactionId,
  '0x7777777777777777777777777777777777777777',
  1337
);
console.log('8. Snapshot created');

console.log('\nLifecycle complete!');
console.log(lifecycleSnapshot.getSummary());

console.log('\n=== Examples Complete ===');

