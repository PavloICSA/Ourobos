# Quick Start Guide - Blockchain Layer

## 🚀 Get Started in 3 Steps

### 1. Start Local Blockchain

```bash
cd contracts
npx hardhat node
```

Keep this terminal running. You'll see 20 accounts with 10000 ETH each.

### 2. Deploy Contract

In a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

You'll see:
```
OuroborosDAO deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Contract configuration saved to: ../src/blockchain/contract-config.json
```

### 3. Use in Your App

```javascript
import { BlockchainBridge } from './blockchain/blockchain-bridge.js';

const bridge = new BlockchainBridge();
await bridge.connect();

// Create proposal
const proposalId = await bridge.proposeMutation(genomeHash, ourocodeHash);

// Vote
await bridge.vote(proposalId, true);

// Execute (after 60 seconds)
await bridge.executeProposal(proposalId);
```

## 🧪 Run Tests

```bash
cd contracts
npx hardhat test
```

Expected output: ✓ 40+ tests passing

## 📚 Key Files

- `contracts/OuroborosDAO.sol` - Smart contract
- `scripts/deploy.js` - Deployment script
- `test/OuroborosDAO.test.js` - Test suite
- `../src/blockchain/blockchain-bridge.js` - JavaScript interface
- `../src/blockchain/INTEGRATION.md` - Full integration guide

## 🔧 Common Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run tests with coverage
npx hardhat coverage

# Start local node
npx hardhat node

# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost

# Clean build artifacts
npx hardhat clean
```

## 💡 Terminal Commands (After Integration)

```
> propose-mutation IF population > 100 THEN mutation_rate := 0.05
Proposal 1 created. Voting period: 60 seconds

> vote 1 yes
Vote cast: YES

> chain-status
Blockchain Status:
  Proposals: 1
  Generation: 0
  Voting Period: 60s
  Quorum: 50%
```

## 🐛 Troubleshooting

**Problem:** `Contract not deployed`
**Solution:** Run deployment script (step 2)

**Problem:** `Connection refused`
**Solution:** Start Hardhat node (step 1)

**Problem:** `Voting period ongoing`
**Solution:** Wait 60 seconds after proposal creation

**Problem:** `Not authorized to propose`
**Solution:** Your address needs authorization (owner can authorize)

## 📖 Learn More

- Full API: `../src/blockchain/README.md`
- Integration: `../src/blockchain/INTEGRATION.md`
- Examples: `../src/blockchain/example.js`
- Contract docs: `README.md`

## ✅ Verification

Check everything works:

```bash
# 1. Compile
npx hardhat compile
# Should see: Compiled 1 Solidity file successfully

# 2. Test
npx hardhat test
# Should see: 40+ passing tests

# 3. Deploy
npx hardhat node &
npx hardhat run scripts/deploy.js --network localhost
# Should see: Contract deployed + config saved
```

## 🎯 Next Steps

1. ✅ Blockchain layer complete
2. ⏳ Integrate with ChimeraOrchestrator
3. ⏳ Add terminal commands
4. ⏳ Update visualization
5. ⏳ Add persistence with blockchain proof

---

**Ready to build!** 🚀
