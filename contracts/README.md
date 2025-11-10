# OuroborOS-Chimera Smart Contracts

Solidity smart contracts for blockchain governance of organism mutations.

## Overview

The smart contracts implement a DAO (Decentralized Autonomous Organization) that:
- Accepts mutation proposals with genome hashes
- Manages voting on proposals
- Executes approved mutations
- Records genome history on-chain
- Validates Ourocode syntax

## Structure

```
contracts/
├── contracts/          # Solidity source files
│   └── OuroborosDAO.sol
├── scripts/           # Deployment scripts
│   └── deploy.js
├── test/             # Contract tests
│   └── OuroborosDAO.test.js
├── hardhat.config.js # Hardhat configuration
└── package.json      # Dependencies
```

## Setup

```bash
cd contracts
npm install
```

## Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Start local blockchain
npm run node

# Deploy contracts (in another terminal)
npm run deploy
```

## Contract Address

After deployment, the contract address and ABI will be saved to:
`../src/blockchain/contract-config.json`

This file contains:
- Contract address
- ABI (Application Binary Interface)
- Chain ID and network name
- Deployment timestamp
- Deployer address

## Networks

- **hardhat**: Local development network (chainId: 1337)
- **localhost**: Local Hardhat node (http://127.0.0.1:8545)

## Contract API

### Proposal Functions

- `proposeMutation(bytes32 genomeHash, bytes32 ourocodeHash)` - Create mutation proposal
- `vote(uint256 proposalId, bool support)` - Vote on proposal
- `executeProposal(uint256 proposalId)` - Execute approved proposal

### Query Functions

- `getProposal(uint256 proposalId)` - Get proposal details
- `getGenomeHistory(uint256 generation)` - Query genome by generation
- `hasVotedOnProposal(uint256 proposalId, address voter)` - Check vote status

### Admin Functions (Owner Only)

- `authorizeProposer(address)` - Authorize proposer
- `revokeProposer(address)` - Revoke proposer
- `pause()` / `unpause()` - Emergency pause mechanism
- `transferOwnership(address)` - Transfer ownership
- `setVotingPeriod(uint256)` - Update voting period
- `setQuorum(uint256)` - Update quorum threshold

## Security Features

1. **Reentrancy Guard**: Prevents reentrancy attacks
2. **Access Control**: Only authorized proposers
3. **Pause Mechanism**: Emergency stop functionality
4. **Double-Vote Prevention**: One vote per address per proposal
5. **Validation**: Ourocode hash validation

## Requirements

- Node.js 18+
- Hardhat
- ethers.js v6
