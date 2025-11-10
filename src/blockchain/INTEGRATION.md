# Blockchain Integration Guide

Complete guide for integrating the blockchain governance layer into OuroborOS-Chimera.

## Quick Start

### 1. Install Dependencies

```bash
# Install ethers.js in main project
npm install ethers

# Install Hardhat dependencies in contracts folder
cd contracts
npm install
cd ..
```

### 2. Start Local Blockchain

```bash
cd contracts
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded accounts.

### 3. Deploy Smart Contract

In another terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy the OuroborosDAO contract
- Save configuration to `../src/blockchain/contract-config.json`
- Display contract address and initial state

### 4. Use in Your Application

```javascript
import { BlockchainBridge } from './blockchain/blockchain-bridge.js';

const bridge = new BlockchainBridge();
await bridge.connect();

// Now you can use the bridge
const proposalId = await bridge.proposeMutation(genomeHash, ourocodeHash);
```

## Integration with ChimeraOrchestrator

### Step 1: Initialize Bridge

```javascript
// src/orchestrator/chimera-orchestrator.js
import { BlockchainBridge } from '../blockchain/blockchain-bridge.js';

class ChimeraOrchestrator {
  constructor() {
    this.blockchainBridge = new BlockchainBridge();
    // ... other components
  }
  
  async init() {
    try {
      await this.blockchainBridge.connect();
      console.log('Blockchain connected');
      
      // Set up event listeners
      this.setupBlockchainEvents();
    } catch (error) {
      console.warn('Blockchain unavailable, using mock mode');
      this.useMockBlockchain = true;
    }
  }
  
  setupBlockchainEvents() {
    this.blockchainBridge.on('proposalCreated', (event) => {
      this.handleProposalCreated(event);
    });
    
    this.blockchainBridge.on('proposalExecuted', (event) => {
      this.handleProposalExecuted(event);
    });
  }
}
```

### Step 2: Propose Mutations

```javascript
async proposeMutation(code, language) {
  // Compile to Ourocode
  const ourocodeModule = this.metaCompiler.compile(code, language);
  const ourocodeHash = await this.metaCompiler.hash(ourocodeModule);
  
  // Generate genome hash
  const state = this.getCurrentState();
  const genomeHash = this.computeGenomeHash(state);
  
  // Submit to blockchain
  const proposalId = await this.blockchainBridge.proposeMutation(
    genomeHash,
    ourocodeHash
  );
  
  // Store for later execution
  this.pendingMutations.set(proposalId, {
    ourocodeModule,
    code,
    language
  });
  
  return proposalId;
}
```

### Step 3: Handle Voting

```javascript
async vote(proposalId, support) {
  await this.blockchainBridge.vote(proposalId, support);
  
  // Update UI
  this.terminal.writeLine(
    `Vote cast: ${support ? 'YES' : 'NO'} on proposal ${proposalId}`
  );
}
```

### Step 4: Execute Approved Mutations

```javascript
async executeMutation(proposalId) {
  // Execute on blockchain
  const { generation } = await this.blockchainBridge.executeProposal(proposalId);
  
  // Get mutation details
  const mutation = this.pendingMutations.get(proposalId);
  
  // Get quantum entropy
  const entropy = await this.quantumClient.getEntropy(256);
  
  // Get bio sensor readings
  const sensors = await this.bioSensorClient.getReadings();
  
  // Execute Ourocode
  await this.executeInRuntime(mutation.ourocodeModule, {
    entropy,
    sensors
  });
  
  // Update state
  this.currentGeneration = generation;
  
  // Update visualization
  this.visualizer.render(this.getCurrentState());
  
  // Clean up
  this.pendingMutations.delete(proposalId);
}
```

## Terminal Commands

Add blockchain commands to the Pascal terminal:

```javascript
// src/terminal/commands.js

export const blockchainCommands = {
  'propose-mutation': async (args, orchestrator) => {
    const code = args.join(' ');
    const proposalId = await orchestrator.proposeMutation(code, 'algol');
    return `Proposal ${proposalId} created. Voting period: 60 seconds`;
  },
  
  'vote': async (args, orchestrator) => {
    const proposalId = parseInt(args[0]);
    const support = args[1].toLowerCase() === 'yes';
    await orchestrator.vote(proposalId, support);
    return `Vote cast: ${support ? 'YES' : 'NO'}`;
  },
  
  'execute-proposal': async (args, orchestrator) => {
    const proposalId = parseInt(args[0]);
    await orchestrator.executeMutation(proposalId);
    return `Proposal ${proposalId} executed`;
  },
  
  'query-chain': async (args, orchestrator) => {
    const generation = parseInt(args[0]);
    const record = await orchestrator.blockchainBridge.getGenomeHistory(generation);
    return `Generation ${generation}:\n` +
           `  Hash: ${record.hash}\n` +
           `  Block: ${record.blockNumber}\n` +
           `  Time: ${new Date(record.timestamp * 1000).toISOString()}`;
  },
  
  'chain-status': async (args, orchestrator) => {
    const state = await orchestrator.blockchainBridge.getContractState();
    return `Blockchain Status:\n` +
           `  Proposals: ${state.proposalCount}\n` +
           `  Generation: ${state.currentGeneration}\n` +
           `  Voting Period: ${state.votingPeriod}s\n` +
           `  Quorum: ${state.quorum}%\n` +
           `  Paused: ${state.paused}`;
  }
};
```

## Configuration

### Environment Variables

Create `.env` file:

```bash
# Blockchain
BLOCKCHAIN_RPC=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...  # Set after deployment
CHAIN_ID=1337

# Enable/disable blockchain
ENABLE_BLOCKCHAIN=true
```

### Config Module

```javascript
// src/config/index.js
export const config = {
  blockchain: {
    rpcUrl: import.meta.env.VITE_BLOCKCHAIN_RPC || 'http://127.0.0.1:8545',
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
    chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '1337'),
    enabled: import.meta.env.VITE_ENABLE_BLOCKCHAIN !== 'false'
  }
};
```

## Mock Mode

For development without blockchain:

```javascript
class MockBlockchainBridge {
  constructor() {
    this.proposals = new Map();
    this.proposalCount = 0;
    this.generation = 0;
  }
  
  async connect() {
    console.log('Using mock blockchain');
    return true;
  }
  
  async proposeMutation(genomeHash, ourocodeHash) {
    this.proposalCount++;
    this.proposals.set(this.proposalCount, {
      id: this.proposalCount,
      genomeHash,
      ourocodeHash,
      votesFor: 0,
      votesAgainst: 0,
      executed: false
    });
    return this.proposalCount;
  }
  
  async vote(proposalId, support) {
    const proposal = this.proposals.get(proposalId);
    if (support) proposal.votesFor++;
    else proposal.votesAgainst++;
  }
  
  async executeProposal(proposalId) {
    const proposal = this.proposals.get(proposalId);
    proposal.executed = true;
    this.generation++;
    return { generation: this.generation };
  }
  
  // ... other methods
}

// Use mock when blockchain unavailable
const bridge = config.blockchain.enabled 
  ? new BlockchainBridge()
  : new MockBlockchainBridge();
```

## Testing

### Unit Tests

```javascript
// test/blockchain-bridge.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { BlockchainBridge } from '../src/blockchain/blockchain-bridge.js';

describe('BlockchainBridge', () => {
  let bridge;
  
  beforeEach(async () => {
    bridge = new BlockchainBridge({
      rpcUrl: 'http://127.0.0.1:8545'
    });
    await bridge.connect();
  });
  
  it('should propose mutation', async () => {
    const genomeHash = '0x1234...';
    const ourocodeHash = '0x5678...';
    const proposalId = await bridge.proposeMutation(genomeHash, ourocodeHash);
    expect(proposalId).toBeGreaterThan(0);
  });
  
  // ... more tests
});
```

### Integration Tests

```javascript
// test/mutation-lifecycle.test.js
describe('Full Mutation Lifecycle', () => {
  it('should complete propose-vote-execute cycle', async () => {
    const orchestrator = new ChimeraOrchestrator();
    await orchestrator.init();
    
    // Propose
    const proposalId = await orchestrator.proposeMutation(
      'IF population > 100 THEN mutation_rate := 0.05',
      'algol'
    );
    
    // Vote
    await orchestrator.vote(proposalId, true);
    
    // Wait for voting period
    await new Promise(resolve => setTimeout(resolve, 61000));
    
    // Execute
    await orchestrator.executeMutation(proposalId);
    
    // Verify
    const state = await orchestrator.blockchainBridge.getContractState();
    expect(state.currentGeneration).toBeGreaterThan(0);
  }, 120000);
});
```

## Troubleshooting

### Contract Not Deployed

**Error:** `Contract not deployed`

**Solution:**
```bash
cd contracts
npx hardhat node  # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2
```

### Connection Refused

**Error:** `connect ECONNREFUSED 127.0.0.1:8545`

**Solution:** Make sure Hardhat node is running:
```bash
cd contracts
npx hardhat node
```

### Transaction Reverted

**Error:** `Transaction reverted: Not authorized to propose`

**Solution:** Authorize your address:
```javascript
await bridge.contract.authorizeProposer(yourAddress);
```

### Voting Period Not Ended

**Error:** `Voting period ongoing`

**Solution:** Wait for voting period (default 60 seconds) before executing.

## Production Deployment

### Deploy to Testnet

1. Update `hardhat.config.js`:

```javascript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

2. Deploy:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. Update frontend config with new contract address.

### Security Considerations

1. **Private Keys**: Never commit private keys. Use environment variables.
2. **Rate Limiting**: Implement rate limiting on proposal creation.
3. **Gas Optimization**: Monitor gas costs and optimize contract calls.
4. **Access Control**: Carefully manage authorized proposers.
5. **Pause Mechanism**: Use pause function in emergencies.

## Next Steps

1. ✅ Smart contract implemented
2. ✅ JavaScript bridge created
3. ⏳ Integrate with ChimeraOrchestrator
4. ⏳ Add terminal commands
5. ⏳ Implement visualization updates
6. ⏳ Add persistence with blockchain proof

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
