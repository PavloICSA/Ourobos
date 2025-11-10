/**
 * Persistence Manager Example
 * 
 * Demonstrates:
 * - Creating and saving snapshots with blockchain proof
 * - Loading and verifying snapshots
 * - Exporting and importing .obg files
 * - Backward compatibility with v1.0 format
 */

import { PersistenceManager } from './manager.js';
import { ChimeraGenomeSnapshot, ChimeraOrganismState } from '../chimera/data-models.js';
import { BlockchainBridge } from '../blockchain/blockchain-bridge.js';

// Initialize managers
const persistence = new PersistenceManager();
const blockchain = new BlockchainBridge({
  rpcUrl: 'http://127.0.0.1:8545'
});

/**
 * Example 1: Create and save a snapshot with blockchain proof
 */
async function example1_SaveWithBlockchainProof() {
  console.log('\n=== Example 1: Save Snapshot with Blockchain Proof ===\n');
  
  // Create organism state
  const organism = new ChimeraOrganismState();
  organism.population = 150;
  organism.energy = 75;
  organism.generation = 42;
  organism.mutationRate = 0.05;
  
  // Update blockchain state (simulated)
  organism.updateBlockchainState(
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    12345,
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  );
  
  // Update quantum state
  organism.updateQuantumState(
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    'hardware'
  );
  
  // Update sensor state
  organism.updateSensorState({
    light: 0.7,
    temperature: 0.6,
    acceleration: 0.3,
    timestamp: Date.now()
  }, 'real');
  
  // Create snapshot
  const snapshot = new ChimeraGenomeSnapshot('Organism Generation 42');
  snapshot.setOrganismState(organism);
  snapshot.setBlockchainProof(
    organism.lastGenomeHash,
    organism.lastBlockNumber,
    organism.lastTransactionId,
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    1337
  );
  
  // Update metadata
  snapshot.updateMetadata({
    totalMutations: 15,
    approvedProposals: 12,
    rejectedProposals: 3,
    createdBy: 'example-user',
    notes: 'Successful evolution with quantum entropy'
  });
  
  // Save to localStorage
  const saved = persistence.save('gen-42', snapshot);
  
  console.log('Snapshot saved:', saved);
  console.log('Summary:');
  console.log(snapshot.getSummary());
}

/**
 * Example 2: Load and verify a snapshot
 */
async function example2_LoadAndVerify() {
  console.log('\n=== Example 2: Load and Verify Snapshot ===\n');
  
  // Load snapshot
  const snapshot = persistence.load('gen-42');
  
  if (!snapshot) {
    console.log('Snapshot not found');
    return;
  }
  
  console.log('Snapshot loaded:');
  console.log(snapshot.getSummary());
  
  // Connect to blockchain (if available)
  try {
    await blockchain.connect();
    console.log('\nBlockchain connected, verifying proof...');
    
    // Verify blockchain proof
    const verification = await persistence.verifyBlockchainProof(snapshot, blockchain);
    
    console.log('\nVerification result:');
    console.log(persistence.formatVerificationResult(verification));
  } catch (error) {
    console.log('\nBlockchain not available, skipping verification');
    console.log('Error:', error.message);
  }
}

/**
 * Example 3: Export snapshot to .obg file
 */
async function example3_ExportSnapshot() {
  console.log('\n=== Example 3: Export Snapshot ===\n');
  
  // Load snapshot
  const snapshot = persistence.load('gen-42');
  
  if (!snapshot) {
    console.log('Snapshot not found');
    return;
  }
  
  // Export to .obg file (in browser, this would trigger download)
  // For this example, we'll just get the OBG data
  const obgData = snapshot.exportToOBG();
  
  console.log('Snapshot exported to OBG format');
  console.log('Size:', (obgData.length / 1024).toFixed(2), 'KB');
  console.log('\nFirst 500 characters:');
  console.log(obgData.substring(0, 500) + '...');
  
  return obgData;
}

/**
 * Example 4: Import snapshot from .obg file
 */
async function example4_ImportSnapshot(obgData) {
  console.log('\n=== Example 4: Import Snapshot ===\n');
  
  // Import snapshot
  const snapshot = persistence.import(obgData);
  
  if (!snapshot) {
    console.log('Failed to import snapshot');
    return;
  }
  
  console.log('Snapshot imported successfully');
  console.log('Version:', snapshot.version);
  console.log('Name:', snapshot.name);
  console.log('Generation:', snapshot.metadata.generation);
  console.log('Has blockchain proof:', snapshot.hasBlockchainProof());
  console.log('Has quantum provenance:', snapshot.hasQuantumProvenance());
}

/**
 * Example 5: Import and verify in one step
 */
async function example5_ImportAndVerify(obgData) {
  console.log('\n=== Example 5: Import and Verify ===\n');
  
  try {
    await blockchain.connect();
    
    // Import and verify
    const result = await persistence.importAndVerify(obgData, blockchain);
    
    console.log('Import result:', result.success);
    
    if (result.snapshot) {
      console.log('Snapshot:', result.snapshot.name);
      console.log('Generation:', result.snapshot.metadata.generation);
    }
    
    if (result.verification) {
      console.log('\nVerification:');
      console.log(persistence.formatVerificationResult(result.verification));
    }
  } catch (error) {
    console.log('Blockchain not available');
    
    // Import without verification
    const snapshot = persistence.import(obgData);
    console.log('Snapshot imported (not verified):', snapshot.name);
  }
}

/**
 * Example 6: List all snapshots
 */
function example6_ListSnapshots() {
  console.log('\n=== Example 6: List Snapshots ===\n');
  
  const snapshots = persistence.listSnapshots();
  const count = Object.keys(snapshots).length;
  
  console.log(`Total snapshots: ${count}`);
  console.log('');
  
  Object.entries(snapshots).forEach(([name, meta]) => {
    console.log(`${name}:`);
    console.log(`  Generation: ${meta.generation}`);
    console.log(`  Timestamp: ${new Date(meta.timestamp).toLocaleString()}`);
    console.log(`  Blockchain proof: ${meta.hasBlockchainProof ? 'Yes ✓' : 'No'}`);
    console.log(`  Version: ${meta.version}`);
    console.log('');
  });
  
  // Storage stats
  const stats = persistence.getStorageStats();
  console.log('Storage usage:');
  console.log(`  Count: ${stats.count}`);
  console.log(`  Total size: ${stats.totalSizeKB} KB (${stats.totalSizeMB} MB)`);
}

/**
 * Example 7: Backward compatibility - Import v1.0 snapshot
 */
function example7_BackwardCompatibility() {
  console.log('\n=== Example 7: Backward Compatibility (v1.0) ===\n');
  
  // Simulate v1.0 snapshot (legacy format)
  const v1Snapshot = {
    version: '1.0',
    timestamp: Date.now(),
    name: 'Legacy Organism',
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
  
  const v1ObgData = JSON.stringify(v1Snapshot, null, 2);
  
  console.log('Importing v1.0 snapshot...');
  console.log('Original version:', v1Snapshot.version);
  
  // Import (will auto-migrate to v2.0)
  const imported = persistence.import(v1ObgData);
  
  console.log('\nAfter import:');
  console.log('Version:', imported.version);
  console.log('Name:', imported.name);
  console.log('Generation:', imported.metadata.generation);
  console.log('Has blockchain proof:', imported.hasBlockchainProof());
  console.log('Has quantum provenance:', imported.hasQuantumProvenance());
  console.log('\nMigration successful! v1.0 → v2.0');
}

/**
 * Example 8: Auto-save and recovery
 */
function example8_AutoSave() {
  console.log('\n=== Example 8: Auto-Save and Recovery ===\n');
  
  // Create current state
  const organism = new ChimeraOrganismState();
  organism.population = 200;
  organism.generation = 50;
  
  const snapshot = new ChimeraGenomeSnapshot('Auto-Save');
  snapshot.setOrganismState(organism);
  
  // Auto-save
  console.log('Performing auto-save...');
  persistence.autoSave(snapshot);
  
  // Simulate crash and recovery
  console.log('Simulating crash...');
  console.log('Recovering from auto-save...');
  
  const recovered = persistence.loadAutoSave();
  
  if (recovered) {
    console.log('Recovery successful!');
    console.log('Generation:', recovered.metadata.generation);
    console.log('Population:', recovered.organism.population);
  } else {
    console.log('No auto-save found');
  }
}

/**
 * Example 9: Delete snapshot
 */
function example9_DeleteSnapshot() {
  console.log('\n=== Example 9: Delete Snapshot ===\n');
  
  // Create a temporary snapshot
  const organism = new ChimeraOrganismState();
  const snapshot = new ChimeraGenomeSnapshot('Temporary');
  snapshot.setOrganismState(organism);
  
  persistence.save('temp-snapshot', snapshot);
  console.log('Created temporary snapshot');
  
  // List before delete
  let snapshots = persistence.listSnapshots();
  console.log('Snapshots before delete:', Object.keys(snapshots).length);
  
  // Delete
  persistence.delete('temp-snapshot');
  console.log('Deleted temporary snapshot');
  
  // List after delete
  snapshots = persistence.listSnapshots();
  console.log('Snapshots after delete:', Object.keys(snapshots).length);
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     OuroborOS-Chimera Persistence Manager Examples    ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    // Example 1: Save with blockchain proof
    await example1_SaveWithBlockchainProof();
    
    // Example 2: Load and verify
    await example2_LoadAndVerify();
    
    // Example 3: Export
    const obgData = await example3_ExportSnapshot();
    
    // Example 4: Import
    await example4_ImportSnapshot(obgData);
    
    // Example 5: Import and verify
    await example5_ImportAndVerify(obgData);
    
    // Example 6: List snapshots
    example6_ListSnapshots();
    
    // Example 7: Backward compatibility
    example7_BackwardCompatibility();
    
    // Example 8: Auto-save
    example8_AutoSave();
    
    // Example 9: Delete
    example9_DeleteSnapshot();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              All examples completed!                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('Error running examples:', error);
  } finally {
    // Cleanup
    if (blockchain.connected) {
      blockchain.disconnect();
    }
  }
}

// Run examples if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runPersistenceExamples = runAllExamples;
  console.log('Persistence examples loaded. Run: runPersistenceExamples()');
} else {
  // Node environment
  runAllExamples();
}

export {
  example1_SaveWithBlockchainProof,
  example2_LoadAndVerify,
  example3_ExportSnapshot,
  example4_ImportSnapshot,
  example5_ImportAndVerify,
  example6_ListSnapshots,
  example7_BackwardCompatibility,
  example8_AutoSave,
  example9_DeleteSnapshot,
  runAllExamples
};
