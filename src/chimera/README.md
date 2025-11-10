# Chimera Data Models

Extended data structures for OuroborOS-Chimera that integrate blockchain governance, quantum entropy, bio sensors, neural clusters, and Ourocode compilation.

## Overview

The chimera data models provide the complete organism state with fields for:

- **Blockchain Provenance**: On-chain genome hashes, transaction IDs, and generation tracking
- **Quantum Entropy**: True random number generation state and backend information
- **Bio Sensor Readings**: Environmental data from physical sensors (light, temperature, acceleration)
- **Neural Cluster State**: Go-based concurrent decision-making processes
- **Ourocode Modules**: Compiled multi-language organism rules

## Data Models

### ChimeraOrganismState

Extended organism state that tracks all organism fields.

**Core Metrics**:
- `population`: Current population count
- `energy`: Available energy level
- `generation`: Generation number
- `age`: Organism age in cycles
- `mutationRate`: Current mutation probability

**Blockchain Fields**:
- `blockchainGeneration`: On-chain generation number
- `lastGenomeHash`: SHA-256 hash of last recorded genome
- `lastBlockNumber`: Block number of last transaction
- `lastTransactionId`: Transaction hash
- `pendingProposalId`: Currently active proposal

**Quantum Fields**:
- `quantumEntropyUsed`: Last quantum entropy hash
- `quantumBackend`: 'hardware' | 'simulator' | 'mock'
- `quantumEntropyTimestamp`: When entropy was generated

**Bio Sensor Fields**:
- `environmentalLight`: Normalized light level (0-1)
- `environmentalTemp`: Normalized temperature (0-1)
- `environmentalAccel`: Normalized acceleration (0-1)
- `sensorTimestamp`: When readings were taken
- `sensorMode`: 'real' | 'mock'

**Neural Cluster Fields**:
- `activeClusterIds`: Array of active Go cluster IDs
- `clusterDecisions`: Map of cluster decisions
- `lastClusterUpdate`: Timestamp of last update

**Ourocode Fields**:
- `activeOurocodeModules`: Array of active module names
- `compiledRules`: Map of compiled Ourocode modules
- `lastCompilationTime`: Timestamp of last compilation

**Methods**:
- `toJSON()`: Serialize to JSON
- `fromJSON(json)`: Restore from JSON
- `updateBlockchainState(hash, block, tx)`: Update blockchain fields
- `updateQuantumState(entropy, backend)`: Update quantum fields
- `updateSensorState(readings, mode)`: Update sensor fields
- `updateClusterState(id, decision)`: Update cluster state
- `addOurocodeModule(name, module)`: Add compiled module

### MutationProposal

Represents a mutation proposal with both on-chain and off-chain data.

**On-Chain Fields**:
- `id`: Proposal ID from smart contract
- `genomeHash`: SHA-256 hash of genome state
- `ourocodeHash`: SHA-256 hash of Ourocode module
- `proposer`: Ethereum address of proposer
- `createdAt`: Timestamp when created
- `votingEndsAt`: Timestamp when voting ends
- `votesFor`: Number of yes votes
- `votesAgainst`: Number of no votes
- `executed`: Whether proposal has been executed
- `approved`: Whether proposal was approved

**Off-Chain Fields**:
- `ourocodeModule`: Full OurocodeModule object
- `sourceCode`: Original source code
- `sourceLanguage`: 'algol' | 'lisp' | 'pascal' | 'rust' | 'go' | 'fortran'
- `compilationTime`: Time taken to compile (ms)
- `description`: Human-readable description
- `tags`: Array of tags for categorization

**Methods**:
- `updateVotes(for, against)`: Update vote counts
- `markExecuted(approved)`: Mark as executed
- `setVotingPeriod(seconds)`: Set voting duration
- `isVotingActive()`: Check if voting is ongoing
- `getApprovalPercentage()`: Calculate approval rate
- `toJSON()`: Serialize to JSON
- `fromJSON(json)`: Restore from JSON

### ChimeraGenomeSnapshot

Extended genome snapshot with complete evolutionary history and provenance.

**Base Fields**:
- `version`: Snapshot format version ('2.0' for chimera)
- `timestamp`: When snapshot was created
- `name`: Human-readable name
- `organism`: ChimeraOrganismState instance

**Blockchain Proof**:
- `genomeHash`: SHA-256 hash recorded on-chain
- `blockNumber`: Block number of transaction
- `transactionId`: Transaction hash
- `contractAddress`: Smart contract address
- `chainId`: Chain ID (1337 for local, etc.)
- `verified`: Whether proof has been verified

**Quantum Provenance**:
- `entropyHash`: Hash of quantum entropy used
- `backend`: 'hardware' | 'simulator' | 'mock'
- `timestamp`: When entropy was generated
- `bitsGenerated`: Number of quantum bits generated

**Sensor Snapshot**:
- `light`: Light level at time of snapshot
- `temperature`: Temperature at time of snapshot
- `acceleration`: Acceleration at time of snapshot
- `timestamp`: When readings were taken
- `mode`: 'real' | 'mock'

**Ourocode Modules**:
- Array of OurocodeModule objects

**Metadata**:
- `generation`: Generation number
- `totalMutations`: Total mutations applied
- `approvedProposals`: Number of approved proposals
- `rejectedProposals`: Number of rejected proposals
- `createdBy`: Creator identifier
- `notes`: User notes

**Methods**:
- `setOrganismState(state)`: Set organism state
- `setBlockchainProof(...)`: Set blockchain proof details
- `markProofVerified(verified)`: Mark proof as verified
- `setQuantumProvenance(...)`: Set quantum provenance
- `setSensorSnapshot(readings, mode)`: Set sensor snapshot
- `addOurocodeModule(module)`: Add Ourocode module
- `updateMetadata(updates)`: Update metadata
- `toJSON()`: Serialize to JSON
- `fromJSON(json)`: Restore from JSON
- `exportToOBG()`: Export to .obg file format
- `importFromOBG(string)`: Import from .obg file
- `hasBlockchainProof()`: Check if has blockchain proof
- `hasQuantumProvenance()`: Check if has quantum provenance
- `getSummary()`: Get summary string for display

### Decision

Represents a decision made by a Go neural cluster.

**Fields**:
- `clusterID`: Cluster identifier
- `action`: Action string ('grow', 'conserve', 'maintain', etc.)
- `confidence`: Confidence level (0-1)
- `timestamp`: When decision was made

**Methods**:
- `toJSON()`: Serialize to JSON
- `fromJSON(json)`: Restore from JSON

## Usage Examples

### Creating a New Organism State

```javascript
import { ChimeraOrganismState } from './data-models.js';

const state = new ChimeraOrganismState();
state.population = 150;
state.energy = 75;

// Update blockchain state after mutation
state.updateBlockchainState(
  '0x1234...', // genome hash
  12345,       // block number
  '0xabcd...'  // transaction ID
);

// Update quantum state
state.updateQuantumState(
  '0x5678...', // entropy hash
  'simulator'  // backend
);

// Update sensor state
state.updateSensorState({
  light: 0.7,
  temperature: 0.6,
  acceleration: 0.3,
  timestamp: Date.now()
}, 'real');
```

### Creating a Mutation Proposal

```javascript
import { MutationProposal } from './data-models.js';

const proposal = new MutationProposal(
  1,           // proposal ID
  '0x1234...', // genome hash
  '0x5678...', // ourocode hash
  '0xabcd...'  // proposer address
);

proposal.sourceCode = 'IF population > 100 THEN mutation_rate := 0.05';
proposal.sourceLanguage = 'algol';
proposal.setVotingPeriod(60); // 60 seconds

// Update votes
proposal.updateVotes(5, 2); // 5 for, 2 against

// Check status
console.log(`Approval: ${proposal.getApprovalPercentage()}%`);
console.log(`Voting active: ${proposal.isVotingActive()}`);
```

### Creating a Genome Snapshot

```javascript
import { ChimeraGenomeSnapshot, ChimeraOrganismState } from './data-models.js';

const snapshot = new ChimeraGenomeSnapshot('Generation 42');

// Set organism state
const state = new ChimeraOrganismState();
state.generation = 42;
state.population = 200;
snapshot.setOrganismState(state);

// Set blockchain proof
snapshot.setBlockchainProof(
  '0x1234...',  // genome hash
  12345,        // block number
  '0xabcd...',  // transaction ID
  '0xdef0...',  // contract address
  1337          // chain ID
);

// Set quantum provenance
snapshot.setQuantumProvenance(
  '0x5678...', // entropy hash
  'hardware',  // backend
  256          // bits generated
);

// Export to .obg file
const obgData = snapshot.exportToOBG();
console.log(snapshot.getSummary());
```

### Importing a Snapshot

```javascript
import { ChimeraGenomeSnapshot } from './data-models.js';

// Import from .obg file
const obgString = '{ "version": "2.0", ... }';
const snapshot = ChimeraGenomeSnapshot.importFromOBG(obgString);

console.log(`Loaded: ${snapshot.name}`);
console.log(`Generation: ${snapshot.metadata.generation}`);
console.log(`Has blockchain proof: ${snapshot.hasBlockchainProof()}`);
console.log(`Has quantum provenance: ${snapshot.hasQuantumProvenance()}`);
```

## File Format

### .obg File Format v2.0

The `.obg` file format is a JSON structure containing:

```json
{
  "version": "2.0",
  "timestamp": 1699564800000,
  "name": "Generation 42",
  "organism": {
    "population": 200,
    "energy": 75,
    "generation": 42,
    "blockchainGeneration": 42,
    "lastGenomeHash": "0x1234...",
    ...
  },
  "blockchainProof": {
    "genomeHash": "0x1234...",
    "blockNumber": 12345,
    "transactionId": "0xabcd...",
    "contractAddress": "0xdef0...",
    "chainId": 1337,
    "verified": true
  },
  "quantumProvenance": {
    "entropyHash": "0x5678...",
    "backend": "hardware",
    "timestamp": 1699564800000,
    "bitsGenerated": 256
  },
  "sensorSnapshot": {
    "light": 0.7,
    "temperature": 0.6,
    "acceleration": 0.3,
    "timestamp": 1699564800000,
    "mode": "real"
  },
  "ourocodeModules": [...],
  "metadata": {
    "generation": 42,
    "totalMutations": 15,
    "approvedProposals": 12,
    "rejectedProposals": 3,
    "createdBy": "user@example.com",
    "notes": "Stable evolution phase"
  }
}
```

## Integration

These data models are used by:

- **ChimeraOrchestrator**: Main orchestration layer
- **BlockchainBridge**: Smart contract interaction
- **QuantumEntropyClient**: Quantum entropy generation
- **BioSensorClient**: Physical sensor readings
- **GoNeuralClusters**: Neural cluster management
- **MetaCompiler**: Ourocode compilation
- **PersistenceManager**: Save/load functionality
- **Visualization**: Display organism state

## Requirements Mapping

- **Requirement 8.1**: Blockchain provenance tracking
- **Requirement 8.2**: Quantum entropy state
- **Requirement 8.4**: Bio sensor integration
- **Requirement 8.5**: Neural cluster state
- **Requirement 1.1, 1.2, 1.3**: Mutation proposal fields
- **Requirement 5.2**: Ourocode module storage
- **Requirement 14.1, 14.2, 14.3, 14.4**: Blockchain proof and verification

