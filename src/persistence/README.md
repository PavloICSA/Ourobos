# Persistence Manager

Enhanced persistence system for OuroborOS-Chimera with blockchain proof verification, quantum provenance tracking, and .obg file format v2.

## Features

- **Blockchain Proof Storage**: Save and verify genome hashes recorded on-chain
- **Quantum Provenance**: Track quantum entropy sources used in mutations
- **Bio Sensor Snapshots**: Preserve environmental readings at time of snapshot
- **Ourocode Modules**: Store compiled code modules with snapshots
- **Backward Compatibility**: Automatically migrate v1.0 snapshots to v2.0 format
- **Verification**: Verify blockchain proofs against on-chain records

## Quick Start

```javascript
import { PersistenceManager } from './persistence/manager.js';
import { ChimeraGenomeSnapshot } from './chimera/data-models.js';
import { BlockchainBridge } from './blockchain/blockchain-bridge.js';

// Initialize
const persistence = new PersistenceManager();
const blockchain = new BlockchainBridge();
await blockchain.connect();

// Create snapshot
const snapshot = new ChimeraGenomeSnapshot('My Organism v1');
snapshot.setOrganismState(organismState);
snapshot.setBlockchainProof(
  genomeHash,
  blockNumber,
  transactionId,
  contractAddress,
  chainId
);

// Save to localStorage
persistence.save('my-snapshot', snapshot);

// Load from localStorage
const loaded = persistence.load('my-snapshot');

// Export to .obg file (download)
persistence.export(snapshot, 'organism.obg');

// Import from .obg file
const imported = persistence.import(obgFileContent);

// Verify blockchain proof
const verification = await persistence.verifyBlockchainProof(imported, blockchain);
console.log(verification.status); // 'verified', 'not_found', 'mismatch', etc.
```

## .OBG File Format v2.0

The .obg (Ouroboros Binary Genome) file format v2.0 is a JSON-based format that includes all chimera-specific fields.

### Format Structure

```json
{
  "version": "2.0",
  "timestamp": 1699564800000,
  "name": "Organism Generation 42",
  
  "organism": {
    "population": 150,
    "energy": 75,
    "generation": 42,
    "age": 1000,
    "mutationRate": 0.05,
    
    "blockchainGeneration": 42,
    "lastGenomeHash": "0x1234...",
    "lastBlockNumber": 12345,
    "lastTransactionId": "0xabcd...",
    
    "quantumEntropyUsed": "a1b2c3...",
    "quantumBackend": "hardware",
    "quantumEntropyTimestamp": 1699564700000,
    
    "environmentalLight": 0.7,
    "environmentalTemp": 0.6,
    "environmentalAccel": 0.3,
    "sensorTimestamp": 1699564700000,
    "sensorMode": "real",
    
    "activeClusterIds": [1, 2, 3],
    "clusterDecisions": [[1, {...}], [2, {...}]],
    "lastClusterUpdate": 1699564700000,
    
    "activeOurocodeModules": ["mutation_rules"],
    "compiledRules": [["mutation_rules", {...}]],
    "lastCompilationTime": 1699564700000
  },
  
  "blockchainProof": {
    "genomeHash": "0x1234...",
    "blockNumber": 12345,
    "transactionId": "0xabcd...",
    "contractAddress": "0x5678...",
    "chainId": 1337,
    "verified": true
  },
  
  "quantumProvenance": {
    "entropyHash": "a1b2c3...",
    "backend": "hardware",
    "timestamp": 1699564700000,
    "bitsGenerated": 256
  },
  
  "sensorSnapshot": {
    "light": 0.7,
    "temperature": 0.6,
    "acceleration": 0.3,
    "timestamp": 1699564700000,
    "mode": "real"
  },
  
  "ourocodeModules": [
    {
      "name": "mutation_rules",
      "version": "1.0",
      "source": "algol",
      "functions": {...}
    }
  ],
  
  "metadata": {
    "generation": 42,
    "totalMutations": 15,
    "approvedProposals": 12,
    "rejectedProposals": 3,
    "createdBy": "user@example.com",
    "notes": "Successful evolution with quantum entropy"
  }
}
```

### Version Compatibility

#### v2.0 (Chimera)
- Full chimera features
- Blockchain proof
- Quantum provenance
- Bio sensor snapshots
- Ourocode modules
- Neural cluster state

#### v1.0 (Legacy)
- Base organism state only
- No blockchain proof
- No quantum provenance
- No sensor data
- Automatically migrated to v2.0 on import

### Migration from v1.0 to v2.0

When importing a v1.0 snapshot, the system automatically:

1. Detects version from `version` field (defaults to "1.0" if missing)
2. Migrates base organism fields (population, energy, generation, etc.)
3. Initializes chimera fields with default values
4. Updates version to "2.0"
5. Logs migration process

```javascript
// v1.0 snapshot is automatically migrated
const v1Snapshot = persistence.import(v1ObgContent);
console.log(v1Snapshot.version); // "2.0"
console.log(v1Snapshot.hasBlockchainProof()); // false (no proof in v1)
```

## API Reference

### PersistenceManager

#### Constructor
```javascript
const manager = new PersistenceManager();
```

#### Methods

##### save(name, snapshot)
Save snapshot to localStorage.

**Parameters:**
- `name` (string): Snapshot name
- `snapshot` (ChimeraGenomeSnapshot): Snapshot to save

**Returns:** boolean - Success status

##### load(name)
Load snapshot from localStorage.

**Parameters:**
- `name` (string): Snapshot name

**Returns:** ChimeraGenomeSnapshot | null

##### export(snapshot, filename)
Export snapshot to .obg file (triggers download).

**Parameters:**
- `snapshot` (ChimeraGenomeSnapshot): Snapshot to export
- `filename` (string, optional): Filename (defaults to snapshot name)

**Returns:** boolean - Success status

##### import(obgData)
Import snapshot from .obg file content.

**Parameters:**
- `obgData` (string): OBG file content (JSON string)

**Returns:** ChimeraGenomeSnapshot | null

##### verifyBlockchainProof(snapshot, blockchainBridge)
Verify blockchain proof against on-chain record.

**Parameters:**
- `snapshot` (ChimeraGenomeSnapshot): Snapshot to verify
- `blockchainBridge` (BlockchainBridge): Connected blockchain bridge

**Returns:** Promise<Object> - Verification result

**Verification Result:**
```javascript
{
  verified: boolean,
  status: 'verified' | 'no_proof' | 'not_connected' | 'not_found' | 'mismatch' | 'error',
  message: string,
  onChainRecord: { generation, hash, blockNumber, timestamp } // if verified
}
```

##### importAndVerify(obgData, blockchainBridge)
Import and automatically verify blockchain proof.

**Parameters:**
- `obgData` (string): OBG file content
- `blockchainBridge` (BlockchainBridge, optional): Blockchain bridge for verification

**Returns:** Promise<Object> - Import result with verification

##### listSnapshots()
List all saved snapshots.

**Returns:** Object - Map of snapshot names to metadata

##### delete(name)
Delete a snapshot.

**Parameters:**
- `name` (string): Snapshot name

**Returns:** boolean - Success status

##### autoSave(snapshot)
Save current state as auto-save.

**Parameters:**
- `snapshot` (ChimeraGenomeSnapshot): Current snapshot

**Returns:** boolean - Success status

##### loadAutoSave()
Load auto-saved state.

**Returns:** ChimeraGenomeSnapshot | null

##### clearAll()
Clear all snapshots (use with caution).

**Returns:** boolean - Success status

##### getStorageStats()
Get storage usage statistics.

**Returns:** Object - Storage stats
```javascript
{
  count: number,
  totalSize: number,
  totalSizeKB: string,
  totalSizeMB: string
}
```

##### formatVerificationResult(verificationResult)
Format verification result for terminal display.

**Parameters:**
- `verificationResult` (Object): Result from verifyBlockchainProof

**Returns:** string - Formatted message

## Blockchain Verification

### Verification Process

1. Check if snapshot has blockchain proof
2. Connect to blockchain via BlockchainBridge
3. Query on-chain genome history for the generation
4. Compare genome hash and block number
5. Mark snapshot as verified if match

### Verification Statuses

- **verified**: Proof matches on-chain record ✓
- **no_proof**: Snapshot doesn't contain blockchain proof
- **not_connected**: Blockchain not connected
- **not_found**: Genome record not found on blockchain ✗
- **mismatch**: Proof doesn't match on-chain record ✗
- **error**: Verification error occurred

### Example: Verify Command

```javascript
// In terminal command handler
async function handleVerifyCommand(snapshotName) {
  const snapshot = persistence.load(snapshotName);
  
  if (!snapshot) {
    console.log('Snapshot not found');
    return;
  }
  
  if (!snapshot.hasBlockchainProof()) {
    console.log('Snapshot does not contain blockchain proof');
    return;
  }
  
  const verification = await persistence.verifyBlockchainProof(
    snapshot,
    blockchainBridge
  );
  
  const formatted = persistence.formatVerificationResult(verification);
  console.log(formatted);
}
```

## Storage Management

### LocalStorage Keys

- `ouroboros-chimera-snapshots`: Snapshot list/index
- `ouroboros-chimera-snapshots-{name}`: Individual snapshot data
- `ouroboros-chimera-current`: Auto-save data

### Storage Limits

Browser localStorage typically has a 5-10 MB limit. Monitor usage with:

```javascript
const stats = persistence.getStorageStats();
console.log(`Snapshots: ${stats.count}`);
console.log(`Total size: ${stats.totalSizeMB} MB`);
```

### Best Practices

1. **Regular Exports**: Export important snapshots to .obg files
2. **Clean Up**: Delete old snapshots to free space
3. **Verify Imports**: Always verify blockchain proofs after import
4. **Auto-Save**: Use auto-save for crash recovery
5. **Backup**: Keep .obg files backed up externally

## Integration with Terminal

### Save Command
```javascript
// terminal command: save my-snapshot
const snapshot = createSnapshotFromCurrentState();
persistence.save('my-snapshot', snapshot);
terminal.writeLine('Snapshot saved: my-snapshot');
```

### Load Command
```javascript
// terminal command: load my-snapshot
const snapshot = persistence.load('my-snapshot');
if (snapshot) {
  restoreOrganismState(snapshot.organism);
  terminal.writeLine('Snapshot loaded: my-snapshot');
}
```

### Export Command
```javascript
// terminal command: export my-snapshot
const snapshot = persistence.load('my-snapshot');
if (snapshot) {
  persistence.export(snapshot);
  terminal.writeLine('Snapshot exported to file');
}
```

### Verify Command
```javascript
// terminal command: verify my-snapshot
const snapshot = persistence.load('my-snapshot');
const verification = await persistence.verifyBlockchainProof(
  snapshot,
  blockchainBridge
);
const formatted = persistence.formatVerificationResult(verification);
terminal.writeLine(formatted);
```

### List Command
```javascript
// terminal command: list-snapshots
const snapshots = persistence.listSnapshots();
terminal.writeLine('Saved snapshots:');
Object.entries(snapshots).forEach(([name, meta]) => {
  terminal.writeLine(`  ${name} - Gen ${meta.generation} - ${meta.hasBlockchainProof ? '✓' : '✗'}`);
});
```

## Requirements Satisfied

- **14.1**: Export .obg files with blockchain proof, quantum provenance, sensor data
- **14.2**: Include quantum provenance and sensor snapshots in exports
- **14.3**: Verify blockchain proof on import by querying on-chain records
- **14.4**: Maintain backward compatibility with v1.0 format
- **14.5**: Display verification results (verified/unverified/not found)

## See Also

- [ChimeraGenomeSnapshot](../chimera/data-models.js) - Snapshot data structure
- [BlockchainBridge](../blockchain/blockchain-bridge.js) - Blockchain interface
- [Terminal Commands](../terminal/commands.js) - Terminal integration
