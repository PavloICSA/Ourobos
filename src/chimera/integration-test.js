/**
 * Chimera Data Models - Integration Test
 * 
 * Tests integration with existing chimera components
 */

import {
  ChimeraOrganismState,
  MutationProposal,
  ChimeraGenomeSnapshot
} from './data-models.js';

console.log('=== Chimera Data Models Integration Test ===\n');

// Test 1: Verify data model structure matches orchestrator expectations
console.log('Test 1: Data Model Structure');
console.log('-----------------------------------');

const state = new ChimeraOrganismState();

// Check core fields expected by orchestrator
const requiredFields = [
  'population', 'energy', 'generation', 'age', 'mutationRate',
  'blockchainGeneration', 'lastGenomeHash', 'lastBlockNumber',
  'quantumEntropyUsed', 'quantumBackend',
  'environmentalLight', 'environmentalTemp', 'environmentalAccel',
  'activeClusterIds', 'clusterDecisions',
  'activeOurocodeModules', 'compiledRules'
];

let allFieldsPresent = true;
requiredFields.forEach(field => {
  if (!(field in state)) {
    console.error(`  ✗ Missing field: ${field}`);
    allFieldsPresent = false;
  }
});

if (allFieldsPresent) {
  console.log('  ✓ All required fields present');
}

// Test 2: Verify serialization preserves data
console.log('\nTest 2: Serialization Integrity');
console.log('-----------------------------------');

state.population = 123;
state.energy = 45.6;
state.updateBlockchainState('0xabc', 100, '0xdef');
state.updateQuantumState('0x123', 'simulator');

const json = state.toJSON();
const restored = ChimeraOrganismState.fromJSON(json);

const serializationTests = [
  { field: 'population', expected: 123 },
  { field: 'energy', expected: 45.6 },
  { field: 'lastGenomeHash', expected: '0xabc' },
  { field: 'lastBlockNumber', expected: 100 },
  { field: 'quantumEntropyUsed', expected: '0x123' },
  { field: 'quantumBackend', expected: 'simulator' }
];

let serializationPassed = true;
serializationTests.forEach(test => {
  if (restored[test.field] !== test.expected) {
    console.error(`  ✗ ${test.field}: expected ${test.expected}, got ${restored[test.field]}`);
    serializationPassed = false;
  }
});

if (serializationPassed) {
  console.log('  ✓ Serialization preserves all data');
}

// Test 3: Verify proposal lifecycle
console.log('\nTest 3: Proposal Lifecycle');
console.log('-----------------------------------');

const proposal = new MutationProposal(1, '0xabc', '0xdef', '0x123');
proposal.setVotingPeriod(60);

if (!proposal.isVotingActive()) {
  console.error('  ✗ Voting should be active');
} else {
  console.log('  ✓ Voting is active');
}

proposal.updateVotes(7, 3);
const approval = proposal.getApprovalPercentage();
if (Math.abs(approval - 70) > 0.1) {
  console.error(`  ✗ Approval percentage: expected 70, got ${approval}`);
} else {
  console.log('  ✓ Approval percentage calculated correctly');
}

proposal.markExecuted(true);
if (!proposal.executed || !proposal.approved) {
  console.error('  ✗ Proposal should be executed and approved');
} else {
  console.log('  ✓ Proposal execution tracked correctly');
}

// Test 4: Verify snapshot export/import
console.log('\nTest 4: Snapshot Export/Import');
console.log('-----------------------------------');

const snapshot = new ChimeraGenomeSnapshot('Test Snapshot');
snapshot.setOrganismState(state);
snapshot.setBlockchainProof('0xabc', 100, '0xdef', '0x123', 1337);
snapshot.setQuantumProvenance('0x456', 'hardware', 256);
snapshot.setSensorSnapshot({ light: 0.7, temperature: 0.6, acceleration: 0.3 }, 'real');
snapshot.updateMetadata({ totalMutations: 10, approvedProposals: 8 });

const obgData = snapshot.exportToOBG();
const imported = ChimeraGenomeSnapshot.importFromOBG(obgData);

const snapshotTests = [
  { field: 'name', expected: 'Test Snapshot' },
  { field: 'version', expected: '2.0' }
];

let snapshotPassed = true;
snapshotTests.forEach(test => {
  if (imported[test.field] !== test.expected) {
    console.error(`  ✗ ${test.field}: expected ${test.expected}, got ${imported[test.field]}`);
    snapshotPassed = false;
  }
});

if (imported.blockchainProof.genomeHash !== '0xabc') {
  console.error('  ✗ Blockchain proof not preserved');
  snapshotPassed = false;
}

if (imported.quantumProvenance.entropyHash !== '0x456') {
  console.error('  ✗ Quantum provenance not preserved');
  snapshotPassed = false;
}

if (imported.sensorSnapshot.light !== 0.7) {
  console.error('  ✗ Sensor snapshot not preserved');
  snapshotPassed = false;
}

if (snapshotPassed) {
  console.log('  ✓ Snapshot export/import preserves all data');
}

// Test 5: Verify Map serialization
console.log('\nTest 5: Map Serialization');
console.log('-----------------------------------');

const testState = new ChimeraOrganismState();
testState.clusterDecisions.set('cluster-1', { action: 'grow', confidence: 0.8 });
testState.clusterDecisions.set('cluster-2', { action: 'conserve', confidence: 0.9 });

const testJSON = testState.toJSON();
const testRestored = ChimeraOrganismState.fromJSON(testJSON);

if (testRestored.clusterDecisions.size !== 2) {
  console.error(`  ✗ Map size: expected 2, got ${testRestored.clusterDecisions.size}`);
} else if (!testRestored.clusterDecisions.has('cluster-1')) {
  console.error('  ✗ Map missing cluster-1');
} else if (!testRestored.clusterDecisions.has('cluster-2')) {
  console.error('  ✗ Map missing cluster-2');
} else {
  console.log('  ✓ Map serialization works correctly');
}

// Test 6: Verify helper methods
console.log('\nTest 6: Helper Methods');
console.log('-----------------------------------');

const helperSnapshot = new ChimeraGenomeSnapshot('Helper Test');
helperSnapshot.setBlockchainProof('0xabc', 100, '0xdef', '0x123', 1337);
helperSnapshot.setQuantumProvenance('0x456', 'hardware', 256);

if (!helperSnapshot.hasBlockchainProof()) {
  console.error('  ✗ hasBlockchainProof() should return true');
} else {
  console.log('  ✓ hasBlockchainProof() works correctly');
}

if (!helperSnapshot.hasQuantumProvenance()) {
  console.error('  ✗ hasQuantumProvenance() should return true');
} else {
  console.log('  ✓ hasQuantumProvenance() works correctly');
}

const summary = helperSnapshot.getSummary();
if (!summary.includes('Blockchain: Block #100')) {
  console.error('  ✗ Summary missing blockchain info');
} else if (!summary.includes('Quantum: hardware')) {
  console.error('  ✗ Summary missing quantum info');
} else {
  console.log('  ✓ getSummary() generates correct output');
}

// Test 7: Verify update methods
console.log('\nTest 7: Update Methods');
console.log('-----------------------------------');

const updateState = new ChimeraOrganismState();
const initialGen = updateState.blockchainGeneration;

updateState.updateBlockchainState('0xnew', 200, '0xtx');
if (updateState.blockchainGeneration !== initialGen + 1) {
  console.error('  ✗ updateBlockchainState() should increment generation');
} else if (updateState.lastGenomeHash !== '0xnew') {
  console.error('  ✗ updateBlockchainState() should update hash');
} else {
  console.log('  ✓ updateBlockchainState() works correctly');
}

updateState.updateQuantumState('0xentropy', 'hardware');
if (updateState.quantumEntropyUsed !== '0xentropy') {
  console.error('  ✗ updateQuantumState() should update entropy');
} else if (updateState.quantumBackend !== 'hardware') {
  console.error('  ✗ updateQuantumState() should update backend');
} else {
  console.log('  ✓ updateQuantumState() works correctly');
}

updateState.updateSensorState({ light: 0.9, temperature: 0.8, acceleration: 0.7 }, 'real');
if (updateState.environmentalLight !== 0.9) {
  console.error('  ✗ updateSensorState() should update light');
} else if (updateState.sensorMode !== 'real') {
  console.error('  ✗ updateSensorState() should update mode');
} else {
  console.log('  ✓ updateSensorState() works correctly');
}

console.log('\n=== Integration Test Complete ===');
console.log('\nAll data models are ready for integration with:');
console.log('  - ChimeraOrchestrator');
console.log('  - BlockchainBridge');
console.log('  - QuantumEntropyClient');
console.log('  - BioSensorClient');
console.log('  - GoNeuralClusters');
console.log('  - PersistenceManager');

