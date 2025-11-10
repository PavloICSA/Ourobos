# Persistence Manager - Quick Start

Get started with OuroborOS-Chimera persistence in 5 minutes.

## Installation

No installation needed - the persistence manager is part of the core system.

```javascript
import { PersistenceManager } from './persistence/manager.js';
import { ChimeraGenomeSnapshot } from './chimera/data-models.js';
```

## Basic Usage

### 1. Save a Snapshot

```javascript
const persistence = new PersistenceManager();

// Create snapshot from current organism state
const snapshot = new ChimeraGenomeSnapshot('My First Snapshot');
snapshot.setOrganismState(currentOrganismState);

// Save to localStorage
persistence.save('snapshot-1', snapshot);
```

### 2. Load a Snapshot

```javascript
const snapshot = persistence.load('snapshot-1');

if (snapshot) {
  // Restore organism state
  restoreOrganismState(snapshot.organism);
  console.log('Loaded generation:', snapshot.metadata.generation);
}
```

### 3. Export to File

```javascript
// Export triggers browser download
persistence.export(snapshot, 'my-organism.obg');
```

### 4. Import from File

```javascript
// User selects .obg file, read as text
const fileContent = await file.text();

// Import snapshot
const imported = persistence.import(fileContent);

if (imported) {
  console.log('Imported:', imported.name);
  console.log('Generation:', imported.metadata.generation);
}
```

### 5. Verify Blockchain Proof

```javascript
import { BlockchainBridge } from './blockchain/blockchain-bridge.js';

const blockchain = new BlockchainBridge();
await blockchain.connect();

// Verify imported snapshot
const verification = await persistence.verifyBlockchainProof(
  imported,
  blockchain
);

console.log('Status:', verification.status);
console.log('Verified:', verification.verified);
```

## Common Patterns

### Auto-Save for Crash Recovery

```javascript
// Save current state periodically
setInterval(() => {
  const snapshot = createCurrentSnapshot();
  persistence.autoSave(snapshot);
}, 60000); // Every minute

// On startup, check for auto-save
const recovered = persistence.loadAutoSave();
if (recovered) {
  console.log('Recovered from crash');
  restoreOrganismState(recovered.organism);
}
```

### List All Snapshots

```javascript
const snapshots = persistence.listSnapshots();

Object.entries(snapshots).forEach(([name, meta]) => {
  console.log(`${name}:`);
  console.log(`  Generation: ${meta.generation}`);
  console.log(`  Blockchain: ${meta.hasBlockchainProof ? '✓' : '✗'}`);
});
```

### Import with Automatic Verification

```javascript
const result = await persistence.importAndVerify(
  obgFileContent,
  blockchainBridge
);

if (result.success) {
  console.log('Imported:', result.snapshot.name);
  
  if (result.verification) {
    console.log('Verification:', result.verification.status);
  }
}
```

### Storage Management

```javascript
// Check storage usage
const stats = persistence.getStorageStats();
console.log(`Using ${stats.totalSizeMB} MB`);

// Delete old snapshots
persistence.delete('old-snapshot');

// Clear all (careful!)
persistence.clearAll();
```

## Terminal Commands

Add these commands to your terminal interface:

```javascript
// Save command
commands.save = (name) => {
  const snapshot = createCurrentSnapshot();
  persistence.save(name, snapshot);
  terminal.writeLine(`Snapshot saved: ${name}`);
};

// Load command
commands.load = (name) => {
  const snapshot = persistence.load(name);
  if (snapshot) {
    restoreOrganismState(snapshot.organism);
    terminal.writeLine(`Snapshot loaded: ${name}`);
  } else {
    terminal.writeLine(`Snapshot not found: ${name}`);
  }
};

// Export command
commands.export = (name) => {
  const snapshot = persistence.load(name);
  if (snapshot) {
    persistence.export(snapshot);
    terminal.writeLine('Snapshot exported');
  }
};

// Verify command
commands.verify = async (name) => {
  const snapshot = persistence.load(name);
  if (!snapshot) {
    terminal.writeLine('Snapshot not found');
    return;
  }
  
  const verification = await persistence.verifyBlockchainProof(
    snapshot,
    blockchainBridge
  );
  
  const formatted = persistence.formatVerificationResult(verification);
  terminal.writeLine(formatted);
};

// List command
commands.list = () => {
  const snapshots = persistence.listSnapshots();
  terminal.writeLine('Saved snapshots:');
  
  Object.entries(snapshots).forEach(([name, meta]) => {
    const proof = meta.hasBlockchainProof ? '✓' : '✗';
    terminal.writeLine(`  ${name} - Gen ${meta.generation} - ${proof}`);
  });
};
```

## File Upload Handler

```javascript
// HTML
<input type="file" id="import-file" accept=".obg" />

// JavaScript
document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const content = await file.text();
  const result = await persistence.importAndVerify(content, blockchainBridge);
  
  if (result.success) {
    restoreOrganismState(result.snapshot.organism);
    
    if (result.verification?.verified) {
      console.log('✓ Blockchain proof verified');
    }
  }
});
```

## Backward Compatibility

v1.0 snapshots are automatically migrated:

```javascript
// Import v1.0 snapshot
const v1Snapshot = persistence.import(v1ObgContent);

// Automatically migrated to v2.0
console.log(v1Snapshot.version); // "2.0"

// Chimera fields initialized with defaults
console.log(v1Snapshot.hasBlockchainProof()); // false
console.log(v1Snapshot.organism.sensorMode); // "mock"
```

## Error Handling

```javascript
try {
  const snapshot = persistence.load('my-snapshot');
  
  if (!snapshot) {
    console.error('Snapshot not found');
    return;
  }
  
  const verification = await persistence.verifyBlockchainProof(
    snapshot,
    blockchainBridge
  );
  
  if (!verification.verified) {
    console.warn('Verification failed:', verification.status);
    // Still allow loading, but show warning
  }
  
  restoreOrganismState(snapshot.organism);
  
} catch (error) {
  console.error('Error loading snapshot:', error);
  // Fallback to default state
}
```

## Next Steps

- Read the [full README](./README.md) for detailed API documentation
- Check [examples](./example.js) for more usage patterns
- Run [integration tests](./integration-test.js) to verify functionality
- See [ChimeraGenomeSnapshot](../chimera/data-models.js) for data structure details

## Tips

1. **Always verify imports**: Use `importAndVerify()` for blockchain-backed snapshots
2. **Export regularly**: Keep .obg files backed up externally
3. **Monitor storage**: Check `getStorageStats()` to avoid hitting browser limits
4. **Use auto-save**: Implement periodic auto-save for crash recovery
5. **Handle errors**: Always check if load/import returns null

## Support

For issues or questions:
- Check the [README](./README.md) for detailed documentation
- Review [examples](./example.js) for common patterns
- Run [tests](./integration-test.js) to verify functionality
