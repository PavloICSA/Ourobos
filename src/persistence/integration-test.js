/**
 * Persistence Manager Integration Tests
 * 
 * Tests:
 * - Save and load snapshots
 * - Export and import .obg files
 * - Blockchain proof verification
 * - Backward compatibility with v1.0
 * - Auto-save functionality
 */

import { PersistenceManager } from './manager.js';
import { ChimeraGenomeSnapshot, ChimeraOrganismState } from '../chimera/data-models.js';

// Mock localStorage for testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = value;
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
}

// Mock BlockchainBridge for testing
class MockBlockchainBridge {
  constructor(shouldSucceed = true) {
    this.connected = true;
    this.shouldSucceed = shouldSucceed;
    this.genomeRecords = new Map();
  }
  
  async getGenomeHistory(generation) {
    if (!this.shouldSucceed) {
      throw new Error('Blockchain query failed');
    }
    
    const record = this.genomeRecords.get(generation);
    if (!record) {
      throw new Error('Genome record not found');
    }
    
    return record;
  }
  
  addGenomeRecord(generation, hash, blockNumber, timestamp) {
    this.genomeRecords.set(generation, {
      generation,
      hash,
      blockNumber,
      timestamp
    });
  }
}

/**
 * Test 1: Save and load snapshot
 */
function test1_SaveAndLoad() {
  console.log('\n--- Test 1: Save and Load ---');
  
  // Setup
  global.localStorage = new MockLocalStorage();
  const persistence = new PersistenceManager();
  
  // Create snapshot
  const organism = new ChimeraOrganismState();
  organism.population = 150;
  organism.generation = 42;
  
  const snapshot = new ChimeraGenomeSnapshot('Test Snapshot');
  snapshot.setOrganismState(organism);
  
  // Save
  const saved = persistence.save('test-1', snapshot);
  console.log('Save result:', saved ? 'PASS ✓' : 'FAIL ✗');
  
  // Load
  const loaded = persistence.load('test-1');
  const loadSuccess = loaded !== null && loaded.name === 'Test Snapshot';
  console.log('Load result:', loadSuccess ? 'PASS ✓' : 'FAIL ✗');
  
  // Verify data
  const dataMatch = loaded.organism.population === 150 && 
                    loaded.organism.generation === 42;
  console.log('Data integrity:', dataMatch ? 'PASS ✓' : 'FAIL ✗');
  
  return saved && loadSuccess && dataMatch;
}

/**
 * Test 2: Export and import .obg file
 */
function test2_ExportImport() {
  console.log('\n--- Test 2: Export and Import ---');
  
  // Setup
  global.localStorage = new MockLocalStorage();
  const persistence = new PersistenceManager();
  
  // Create snapshot with blockchain proof
  const organism = new ChimeraOrganismState();
  organism.updateBlockchainState(
    '0x1234567890abcdef',
    12345,
    '0xabcdef123456'
  );
  organism.updateQuantumState('quantum-hash-123', 'hardware');
  organism.updateSensorState({
    light: 0.7,
    temperature: 0.6,
    acceleration: 0.3,
    timestamp: Date.now()
  }, 'real');
  
  const snapshot = new ChimeraGenomeSnapshot('Export Test');
  snapshot.setOrganismState(organism);
  
  // Export to OBG
  const obgData = snapshot.exportToOBG();
  console.log('Export result:', obgData.length > 0 ? 'PASS ✓' : 'FAIL ✗');
  
  // Import from OBG
  const imported = persistence.import(obgData);
  const importSuccess = imported !== null && imported.name === 'Export Test';
  console.log('Import result:', importSuccess ? 'PASS ✓' : 'FAIL ✗');
  
  // Verify blockchain proof preserved
  const proofPreserved = imported.hasBlockchainProof() &&
                         imported.blockchainProof.genomeHash === '0x1234567890abcdef';
  console.log('Blockchain proof:', proofPreserved ? 'PASS ✓' : 'FAIL ✗');
  
  // Verify quantum provenance preserved
  const quantumPreserved = imported.hasQuantumProvenance() &&
                           imported.quantumProvenance.entropyHash === 'quantum-hash-123';
  console.log('Quantum provenance:', quantumPreserved ? 'PASS ✓' : 'FAIL ✗');
  
  return obgData.length > 0 && importSuccess && proofPreserved && quantumPreserved;
}

/**
 * Test 3: Blockchain verification - verified
 */
async function test3_VerificationSuccess() {
  console.log('\n--- Test 3: Blockchain Verification (Success) ---');
  
  // Setup
  const persistence = new PersistenceManager();
  const blockchain = new MockBlockchainBridge(true);
  
  // Add genome record to mock blockchain
  const genomeHash = '0x1234567890abcdef';
  blockchain.addGenomeRecord(42, genomeHash, 12345, Date.now());
  
  // Create snapshot with matching proof
  const organism = new ChimeraOrganismState();
  organism.generation = 42;
  organism.updateBlockchainState(genomeHash, 12345, '0xabcdef');
  
  const snapshot = new ChimeraGenomeSnapshot('Verified Snapshot');
  snapshot.setOrganismState(organism);
  snapshot.setBlockchainProof(genomeHash, 12345, '0xabcdef', '0x5678', 1337);
  snapshot.updateMetadata({ generation: 42 });
  
  // Verify
  const result = await persistence.verifyBlockchainProof(snapshot, blockchain);
  
  console.log('Verification status:', result.status);
  console.log('Verified:', result.verified ? 'PASS ✓' : 'FAIL ✗');
  console.log('Status correct:', result.status === 'verified' ? 'PASS ✓' : 'FAIL ✗');
  
  return result.verified && result.status === 'verified';
}

/**
 * Test 4: Blockchain verification - not found
 */
async function test4_VerificationNotFound() {
  console.log('\n--- Test 4: Blockchain Verification (Not Found) ---');
  
  // Setup
  const persistence = new PersistenceManager();
  const blockchain = new MockBlockchainBridge(true);
  // Don't add any records
  
  // Create snapshot with proof
  const organism = new ChimeraOrganismState();
  organism.generation = 99;
  organism.updateBlockchainState('0xnonexistent', 99999, '0xnone');
  
  const snapshot = new ChimeraGenomeSnapshot('Not Found Snapshot');
  snapshot.setOrganismState(organism);
  snapshot.setBlockchainProof('0xnonexistent', 99999, '0xnone', '0x5678', 1337);
  snapshot.updateMetadata({ generation: 99 });
  
  // Verify
  const result = await persistence.verifyBlockchainProof(snapshot, blockchain);
  
  console.log('Verification status:', result.status);
  console.log('Not verified:', !result.verified ? 'PASS ✓' : 'FAIL ✗');
  console.log('Status correct:', result.status === 'not_found' ? 'PASS ✓' : 'FAIL ✗');
  
  return !result.verified && result.status === 'not_found';
}

/**
 * Test 5: Blockchain verification - mismatch
 */
async function test5_VerificationMismatch() {
  console.log('\n--- Test 5: Blockchain Verification (Mismatch) ---');
  
  // Setup
  const persistence = new PersistenceManager();
  const blockchain = new MockBlockchainBridge(true);
  
  // Add genome record with different hash
  blockchain.addGenomeRecord(42, '0xcorrect-hash', 12345, Date.now());
  
  // Create snapshot with wrong hash
  const organism = new ChimeraOrganismState();
  organism.generation = 42;
  organism.updateBlockchainState('0xwrong-hash', 12345, '0xabcdef');
  
  const snapshot = new ChimeraGenomeSnapshot('Mismatch Snapshot');
  snapshot.setOrganismState(organism);
  snapshot.setBlockchainProof('0xwrong-hash', 12345, '0xabcdef', '0x5678', 1337);
  snapshot.updateMetadata({ generation: 42 });
  
  // Verify
  const result = await persistence.verifyBlockchainProof(snapshot, blockchain);
  
  console.log('Verification status:', result.status);
  console.log('Not verified:', !result.verified ? 'PASS ✓' : 'FAIL ✗');
  console.log('Status correct:', result.status === 'mismatch' ? 'PASS ✓' : 'FAIL ✗');
  
  return !result.verified && result.status === 'mismatch';
}

/**
 * Test 6: Backward compatibility - v1.0 to v2.0
 */
function test6_BackwardCompatibility() {
  console.log('\n--- Test 6: Backward Compatibility (v1.0 → v2.0) ---');
  
  // Setup
  const persistence = new PersistenceManager();
  
  // Create v1.0 snapshot
  const v1Snapshot = {
    version: '1.0',
    timestamp: Date.now(),
    name: 'Legacy Snapshot',
    organism: {
      population: 100,
      energy: 50,
      generation: 10,
      age: 500,
      mutationRate: 0.01
    },
    metadata: {
      generation: 10,
      totalMutations: 5
    }
  };
  
  const v1ObgData = JSON.stringify(v1Snapshot);
  
  // Import (should auto-migrate)
  const imported = persistence.import(v1ObgData);
  
  console.log('Import success:', imported !== null ? 'PASS ✓' : 'FAIL ✗');
  console.log('Version migrated:', imported.version === '2.0' ? 'PASS ✓' : 'FAIL ✗');
  console.log('Data preserved:', imported.organism.population === 100 ? 'PASS ✓' : 'FAIL ✗');
  console.log('Chimera fields initialized:', 
    imported.organism.blockchainGeneration === 0 ? 'PASS ✓' : 'FAIL ✗');
  
  return imported !== null && 
         imported.version === '2.0' && 
         imported.organism.population === 100;
}

/**
 * Test 7: Auto-save and recovery
 */
function test7_AutoSave() {
  console.log('\n--- Test 7: Auto-Save and Recovery ---');
  
  // Setup
  global.localStorage = new MockLocalStorage();
  const persistence = new PersistenceManager();
  
  // Create snapshot
  const organism = new ChimeraOrganismState();
  organism.population = 200;
  organism.generation = 50;
  
  const snapshot = new ChimeraGenomeSnapshot('Auto-Save Test');
  snapshot.setOrganismState(organism);
  
  // Auto-save
  const saved = persistence.autoSave(snapshot);
  console.log('Auto-save:', saved ? 'PASS ✓' : 'FAIL ✗');
  
  // Load auto-save
  const recovered = persistence.loadAutoSave();
  const loadSuccess = recovered !== null && recovered.organism.generation === 50;
  console.log('Recovery:', loadSuccess ? 'PASS ✓' : 'FAIL ✗');
  
  return saved && loadSuccess;
}

/**
 * Test 8: List and delete snapshots
 */
function test8_ListAndDelete() {
  console.log('\n--- Test 8: List and Delete ---');
  
  // Setup
  global.localStorage = new MockLocalStorage();
  const persistence = new PersistenceManager();
  
  // Create multiple snapshots
  for (let i = 1; i <= 3; i++) {
    const organism = new ChimeraOrganismState();
    organism.generation = i * 10;
    
    const snapshot = new ChimeraGenomeSnapshot(`Snapshot ${i}`);
    snapshot.setOrganismState(organism);
    
    persistence.save(`snap-${i}`, snapshot);
  }
  
  // List snapshots
  const snapshots = persistence.listSnapshots();
  const listSuccess = Object.keys(snapshots).length === 3;
  console.log('List count:', listSuccess ? 'PASS ✓' : 'FAIL ✗');
  
  // Delete one
  persistence.delete('snap-2');
  const afterDelete = persistence.listSnapshots();
  const deleteSuccess = Object.keys(afterDelete).length === 2 && 
                        !afterDelete['snap-2'];
  console.log('Delete:', deleteSuccess ? 'PASS ✓' : 'FAIL ✗');
  
  // Storage stats
  const stats = persistence.getStorageStats();
  const statsSuccess = stats.count === 2;
  console.log('Storage stats:', statsSuccess ? 'PASS ✓' : 'FAIL ✗');
  
  return listSuccess && deleteSuccess && statsSuccess;
}

/**
 * Test 9: Import and verify in one step
 */
async function test9_ImportAndVerify() {
  console.log('\n--- Test 9: Import and Verify ---');
  
  // Setup
  const persistence = new PersistenceManager();
  const blockchain = new MockBlockchainBridge(true);
  
  // Add genome record
  const genomeHash = '0xverified-hash';
  blockchain.addGenomeRecord(42, genomeHash, 12345, Date.now());
  
  // Create snapshot
  const organism = new ChimeraOrganismState();
  organism.generation = 42;
  organism.updateBlockchainState(genomeHash, 12345, '0xabcdef');
  
  const snapshot = new ChimeraGenomeSnapshot('Import and Verify Test');
  snapshot.setOrganismState(organism);
  snapshot.setBlockchainProof(genomeHash, 12345, '0xabcdef', '0x5678', 1337);
  snapshot.updateMetadata({ generation: 42 });
  
  const obgData = snapshot.exportToOBG();
  
  // Import and verify
  const result = await persistence.importAndVerify(obgData, blockchain);
  
  console.log('Import success:', result.success ? 'PASS ✓' : 'FAIL ✗');
  console.log('Snapshot loaded:', result.snapshot !== null ? 'PASS ✓' : 'FAIL ✗');
  console.log('Verification performed:', result.verification !== null ? 'PASS ✓' : 'FAIL ✗');
  console.log('Verified:', result.verification?.verified ? 'PASS ✓' : 'FAIL ✗');
  
  return result.success && result.verification?.verified;
}

/**
 * Test 10: Format verification result
 */
function test10_FormatVerification() {
  console.log('\n--- Test 10: Format Verification Result ---');
  
  const persistence = new PersistenceManager();
  
  // Test verified status
  const verifiedResult = {
    status: 'verified',
    verified: true,
    onChainRecord: {
      generation: 42,
      hash: '0x1234567890abcdef',
      blockNumber: 12345
    }
  };
  
  const formatted = persistence.formatVerificationResult(verifiedResult);
  const hasVerified = formatted.includes('VERIFIED ✓');
  console.log('Format verified:', hasVerified ? 'PASS ✓' : 'FAIL ✗');
  
  // Test not found status
  const notFoundResult = {
    status: 'not_found',
    verified: false
  };
  
  const formatted2 = persistence.formatVerificationResult(notFoundResult);
  const hasNotFound = formatted2.includes('NOT FOUND ✗');
  console.log('Format not found:', hasNotFound ? 'PASS ✓' : 'FAIL ✗');
  
  return hasVerified && hasNotFound;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   OuroborOS-Chimera Persistence Integration Tests     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  try {
    results.push({ name: 'Save and Load', pass: test1_SaveAndLoad() });
    results.push({ name: 'Export and Import', pass: test2_ExportImport() });
    results.push({ name: 'Verification Success', pass: await test3_VerificationSuccess() });
    results.push({ name: 'Verification Not Found', pass: await test4_VerificationNotFound() });
    results.push({ name: 'Verification Mismatch', pass: await test5_VerificationMismatch() });
    results.push({ name: 'Backward Compatibility', pass: test6_BackwardCompatibility() });
    results.push({ name: 'Auto-Save', pass: test7_AutoSave() });
    results.push({ name: 'List and Delete', pass: test8_ListAndDelete() });
    results.push({ name: 'Import and Verify', pass: await test9_ImportAndVerify() });
    results.push({ name: 'Format Verification', pass: test10_FormatVerification() });
    
    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    Test Summary                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    
    results.forEach(result => {
      const status = result.pass ? '✓ PASS' : '✗ FAIL';
      console.log(`${status} - ${result.name}`);
    });
    
    console.log(`\nTotal: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! 🎉\n');
    } else {
      console.log(`\n⚠️  ${total - passed} test(s) failed\n`);
    }
    
    return passed === total;
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runPersistenceTests = runAllTests;
  console.log('Persistence tests loaded. Run: runPersistenceTests()');
} else {
  // Node environment
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export {
  test1_SaveAndLoad,
  test2_ExportImport,
  test3_VerificationSuccess,
  test4_VerificationNotFound,
  test5_VerificationMismatch,
  test6_BackwardCompatibility,
  test7_AutoSave,
  test8_ListAndDelete,
  test9_ImportAndVerify,
  test10_FormatVerification,
  runAllTests
};
