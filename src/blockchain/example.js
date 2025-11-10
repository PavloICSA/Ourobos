/**
 * Example usage of BlockchainBridge
 * Demonstrates the complete mutation proposal lifecycle
 */

import { BlockchainBridge } from './blockchain-bridge.js';
import { ethers } from 'ethers';

async function runExample() {
  console.log('=== BlockchainBridge Example ===\n');
  
  // Create bridge instance
  const bridge = new BlockchainBridge({
    rpcUrl: 'http://127.0.0.1:8545'
  });
  
  try {
    // Step 1: Connect to blockchain
    console.log('1. Connecting to blockchain...');
    await bridge.connect();
    
    const network = await bridge.getNetwork();
    const signerAddress = await bridge.getSignerAddress();
    console.log(`   Connected to ${network.name} (chainId: ${network.chainId})`);
    console.log(`   Signer: ${signerAddress}\n`);
    
    // Step 2: Check contract state
    console.log('2. Checking contract state...');
    const state = await bridge.getContractState();
    console.log(`   Proposal Count: ${state.proposalCount}`);
    console.log(`   Current Generation: ${state.currentGeneration}`);
    console.log(`   Voting Period: ${state.votingPeriod} seconds`);
    console.log(`   Quorum: ${state.quorum}%`);
    console.log(`   Owner: ${state.owner}`);
    console.log(`   Paused: ${state.paused}\n`);
    
    // Step 3: Set up event listeners
    console.log('3. Setting up event listeners...');
    
    bridge.on('proposalCreated', (event) => {
      console.log(`   [EVENT] Proposal ${event.proposalId} created by ${event.proposer}`);
    });
    
    bridge.on('voteCast', (event) => {
      console.log(`   [EVENT] Vote cast: ${event.support ? 'YES' : 'NO'} (${event.votesFor} for, ${event.votesAgainst} against)`);
    });
    
    bridge.on('proposalExecuted', (event) => {
      console.log(`   [EVENT] Proposal ${event.proposalId} executed! Generation: ${event.generation}`);
    });
    
    bridge.on('genomeRecorded', (event) => {
      console.log(`   [EVENT] Genome recorded: Generation ${event.generation} at block ${event.blockNumber}`);
    });
    
    console.log('   Event listeners registered\n');
    
    // Step 4: Create a mutation proposal
    console.log('4. Creating mutation proposal...');
    
    // Simulate organism state
    const organismState = {
      population: 100,
      energy: 75.5,
      mutationRate: 0.05,
      generation: 1
    };
    
    // Simulate Ourocode
    const ourocodeText = `
      @module organism_rules
      @version 1.0
      @source algol
      
      define @mutate_rule(%s: %state) -> %state {
        entry:
          %pop = extract %s, 0
          %rate = const 0.05
          %new_state = insert %s, 2, %rate
          ret %new_state
      }
    `;
    
    // Generate hashes
    const genomeHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(organismState))
    );
    const ourocodeHash = ethers.keccak256(
      ethers.toUtf8Bytes(ourocodeText)
    );
    
    console.log(`   Genome Hash: ${genomeHash}`);
    console.log(`   Ourocode Hash: ${ourocodeHash}`);
    
    const proposalId = await bridge.proposeMutation(genomeHash, ourocodeHash);
    console.log(`   Proposal ID: ${proposalId}\n`);
    
    // Step 5: Get proposal details
    console.log('5. Fetching proposal details...');
    const proposal = await bridge.getProposal(proposalId);
    console.log(`   ID: ${proposal.id}`);
    console.log(`   Proposer: ${proposal.proposer}`);
    console.log(`   Created At: ${new Date(proposal.createdAt * 1000).toISOString()}`);
    console.log(`   Votes For: ${proposal.votesFor}`);
    console.log(`   Votes Against: ${proposal.votesAgainst}`);
    console.log(`   Executed: ${proposal.executed}\n`);
    
    // Step 6: Vote on proposal
    console.log('6. Voting on proposal...');
    
    // Check if already voted
    const hasVoted = await bridge.hasVoted(proposalId);
    if (hasVoted) {
      console.log('   Already voted on this proposal\n');
    } else {
      await bridge.vote(proposalId, true);
      console.log('   Vote cast: YES\n');
    }
    
    // Step 7: Wait for voting period
    console.log('7. Waiting for voting period to end...');
    console.log(`   (Voting period: ${state.votingPeriod} seconds)`);
    console.log('   Simulating wait...\n');
    
    // In a real scenario, you would wait the full voting period
    // For this example, we'll just note that you need to wait
    console.log('   [NOTE] In production, wait for voting period before executing\n');
    
    // Step 8: Execute proposal (would fail if voting period not ended)
    console.log('8. Executing proposal...');
    console.log('   [NOTE] This will fail if voting period has not ended');
    console.log('   [NOTE] Run this example again after 60+ seconds to execute\n');
    
    try {
      const { generation } = await bridge.executeProposal(proposalId);
      console.log(`   Proposal executed! New generation: ${generation}\n`);
      
      // Step 9: Query genome history
      console.log('9. Querying genome history...');
      const record = await bridge.getGenomeHistory(generation);
      console.log(`   Generation: ${record.generation}`);
      console.log(`   Hash: ${record.hash}`);
      console.log(`   Block Number: ${record.blockNumber}`);
      console.log(`   Timestamp: ${new Date(record.timestamp * 1000).toISOString()}\n`);
    } catch (error) {
      if (error.message.includes('Voting period ongoing')) {
        console.log('   ⏳ Voting period still ongoing. Wait and try again.\n');
      } else if (error.message.includes('Quorum not met')) {
        console.log('   ❌ Quorum not met. Need more votes.\n');
      } else {
        throw error;
      }
    }
    
    // Step 10: Health check
    console.log('10. Running health check...');
    const healthy = await bridge.healthCheck();
    console.log(`   Connection healthy: ${healthy}\n`);
    
    console.log('=== Example Complete ===');
    console.log('\nTo see full lifecycle:');
    console.log('1. Run this example to create proposal and vote');
    console.log('2. Wait 60+ seconds');
    console.log('3. Run again to execute proposal\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('Contract not deployed')) {
      console.log('\n💡 Solution: Deploy the contract first:');
      console.log('   cd contracts');
      console.log('   npx hardhat node  # In one terminal');
      console.log('   npx hardhat run scripts/deploy.js --network localhost  # In another');
    }
  } finally {
    // Cleanup
    bridge.disconnect();
  }
}

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}

export { runExample };
