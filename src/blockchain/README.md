# Blockchain Bridge

JavaScript interface to the OuroborosDAO smart contract for decentralized organism mutation governance.

## Overview

The BlockchainBridge class provides a high-level API for interacting with the Ethereum blockchain and the OuroborosDAO smart contract. It handles:

- Connection management to local or remote Ethereum nodes
- Proposal creation with genome and Ourocode hashes
- Voting on mutation proposals
- Proposal execution after voting period
- Genome history queries
- Real-time event listening

## Usage

### Basic Setup

```javascript
import { BlockchainBridge } from './blockchain/blockchain-bridge.js';

// Create bridge instance
const bridge = new BlockchainBridge({
  rpcUrl: 'http://127.0.0.1:8545'  // Local Hardhat node
});

// Connect to blockchain
await bridge.connect();
```

### Propose a Mutation

```javascript
// Generate hashes
const genomeHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(organismState)));
const ourocodeHash = ethers.keccak256(ethers.toUtf8Bytes(ourocodeText));

// Submit proposal
const proposalId = await bridge.proposeMutation(genomeHash, ourocodeHash);
console.log('Proposal created:', proposalId);
```

### Vote on Proposal

```javascript
// Vote yes
await bridge.vote(proposalId, true);

// Vote no
await bridge.vote(proposalId, false);
```

### Execute Approved Proposal

```javascript
// Wait for voting period to end (60 seconds by default)
await new Promise(resolve => setTimeout(resolve, 61000));

// Execute proposal
const { generation } = await bridge.executeProposal(proposalId);
console.log('New generation:', generation);
```

### Query Genome History

```javascript
// Get genome record by generation
const record = await bridge.getGenomeHistory(1);
console.log('Genome:', record.hash);
console.log('Block:', record.blockNumber);
console.log('Timestamp:', new Date(record.timestamp * 1000));
```

### Listen to Events

```javascript
// Listen for new proposals
bridge.on('proposalCreated', (event) => {
  console.log('New proposal:', event.proposalId);
  console.log('Genome hash:', event.genomeHash);
});

// Listen for votes
bridge.on('voteCast', (event) => {
  console.log('Vote cast:', event.support ? 'YES' : 'NO');
  console.log('Current tally:', event.votesFor, 'for,', event.votesAgainst, 'against');
});

// Listen for executions
bridge.on('proposalExecuted', (event) => {
  console.log('Proposal executed:', event.proposalId);
  console.log('Generation:', event.generation);
});

// Listen for genome recordings
bridge.on('genomeRecorded', (event) => {
  console.log('Genome recorded:', event.hash);
  console.log('Generation:', event.generation);
});
```

## API Reference

### Constructor

```javascript
new BlockchainBridge(config)
```

**Parameters:**
- `config.rpcUrl` (string) - Ethereum RPC URL (default: 'http://127.0.0.1:8545')
- `config.contractAddress` (string) - Contract address (optional, loaded from config)
- `config.abi` (array) - Contract ABI (optional, loaded from config)

### Methods

#### `connect(contractConfig?)`

Connect to blockchain and initialize contract.

**Returns:** `Promise<boolean>`

#### `proposeMutation(genomeHash, ourocodeHash)`

Create a new mutation proposal.

**Parameters:**
- `genomeHash` (string) - Hash of organism state
- `ourocodeHash` (string) - Hash of compiled Ourocode

**Returns:** `Promise<number>` - Proposal ID

#### `vote(proposalId, support)`

Vote on a proposal.

**Parameters:**
- `proposalId` (number) - The proposal ID
- `support` (boolean) - True for yes, false for no

**Returns:** `Promise<TransactionReceipt>`

#### `executeProposal(proposalId)`

Execute an approved proposal.

**Parameters:**
- `proposalId` (number) - The proposal ID

**Returns:** `Promise<{receipt, generation}>`

#### `getGenomeHistory(generation)`

Query genome record by generation.

**Parameters:**
- `generation` (number) - The generation number

**Returns:** `Promise<{generation, hash, timestamp, blockNumber}>`

#### `getProposal(proposalId)`

Get proposal details.

**Parameters:**
- `proposalId` (number) - The proposal ID

**Returns:** `Promise<Object>` - Proposal details

#### `hasVoted(proposalId, voter?)`

Check if address has voted on proposal.

**Parameters:**
- `proposalId` (number) - The proposal ID
- `voter` (string, optional) - Voter address (defaults to current signer)

**Returns:** `Promise<boolean>`

#### `getContractState()`

Get current contract state.

**Returns:** `Promise<Object>` - Contract state including proposal count, generation, etc.

#### `healthCheck()`

Check connection health.

**Returns:** `Promise<boolean>`

#### `on(eventType, callback)`

Register event listener.

**Parameters:**
- `eventType` (string) - Event type: 'proposalCreated', 'voteCast', 'proposalExecuted', 'genomeRecorded'
- `callback` (function) - Callback function

#### `off(eventType, callback)`

Remove event listener.

#### `disconnect()`

Disconnect from blockchain.

#### `getSignerAddress()`

Get current signer address.

**Returns:** `Promise<string>`

#### `getNetwork()`

Get network information.

**Returns:** `Promise<{name, chainId}>`

## Configuration

The bridge automatically loads contract configuration from `contract-config.json` which is generated during contract deployment. This file contains:

```json
{
  "address": "0x...",
  "chainId": 1337,
  "network": "hardhat",
  "deployedAt": "2024-01-01T00:00:00.000Z",
  "deployer": "0x...",
  "abi": [...]
}
```

## Error Handling

All methods throw errors that should be caught:

```javascript
try {
  await bridge.proposeMutation(genomeHash, ourocodeHash);
} catch (error) {
  if (error.message.includes('Not authorized')) {
    console.error('Address not authorized to propose');
  } else if (error.message.includes('paused')) {
    console.error('Contract is paused');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## Events

### ProposalCreated

Emitted when a new proposal is created.

```javascript
{
  type: 'ProposalCreated',
  proposalId: number,
  genomeHash: string,
  ourocodeHash: string,
  proposer: string,
  createdAt: number
}
```

### VoteCast

Emitted when a vote is cast.

```javascript
{
  type: 'VoteCast',
  proposalId: number,
  voter: string,
  support: boolean,
  votesFor: number,
  votesAgainst: number
}
```

### ProposalExecuted

Emitted when a proposal is executed.

```javascript
{
  type: 'ProposalExecuted',
  proposalId: number,
  genomeHash: string,
  generation: number
}
```

### GenomeRecorded

Emitted when a genome is recorded on-chain.

```javascript
{
  type: 'GenomeRecorded',
  generation: number,
  hash: string,
  blockNumber: number,
  timestamp: number
}
```

## Integration Example

```javascript
import { BlockchainBridge } from './blockchain/blockchain-bridge.js';
import { MetaCompiler } from './metacompiler/meta-compiler.js';

class ChimeraOrchestrator {
  constructor() {
    this.bridge = new BlockchainBridge();
    this.compiler = new MetaCompiler();
  }
  
  async init() {
    await this.bridge.connect();
    
    // Listen for approved proposals
    this.bridge.on('proposalExecuted', async (event) => {
      console.log('Mutation approved! Executing...');
      await this.executeMutation(event.proposalId);
    });
  }
  
  async proposeMutation(code, language) {
    // Compile to Ourocode
    const module = this.compiler.compile(code, language);
    const ourocodeHash = await this.compiler.hash(module);
    
    // Generate genome hash
    const state = this.getCurrentState();
    const genomeHash = this.computeGenomeHash(state);
    
    // Submit to blockchain
    const proposalId = await this.bridge.proposeMutation(
      genomeHash,
      ourocodeHash
    );
    
    return proposalId;
  }
}
```

## Testing

The bridge can be tested against a local Hardhat network:

```bash
# Terminal 1: Start Hardhat node
cd contracts
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Run your application
npm run dev
```

## Requirements

- ethers.js v6+
- Running Ethereum node (Hardhat, Ganache, or remote RPC)
- Deployed OuroborosDAO contract

## License

MIT
