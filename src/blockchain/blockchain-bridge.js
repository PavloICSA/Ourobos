/**
 * BlockchainBridge - JavaScript interface to OuroborosDAO smart contract
 * Provides methods for proposal creation, voting, execution, and event listening
 */

import { ethers } from 'ethers';

export class BlockchainBridge {
  constructor(config = {}) {
    this.rpcUrl = config.rpcUrl || 'http://127.0.0.1:8545';
    this.contractAddress = config.contractAddress || null;
    this.abi = config.abi || null;
    
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.connected = false;
    
    // Event listeners
    this.eventListeners = {
      proposalCreated: [],
      voteCast: [],
      proposalExecuted: [],
      genomeRecorded: []
    };
  }
  
  /**
   * Connect to blockchain and initialize contract
   * @param {Object} contractConfig - Optional contract configuration
   */
  async connect(contractConfig = null) {
    try {
      // Load contract config if provided
      if (contractConfig) {
        this.contractAddress = contractConfig.address;
        this.abi = contractConfig.abi;
      }
      
      // If no config provided, try to load from file
      if (!this.contractAddress || !this.abi) {
        const config = await this.loadContractConfig();
        this.contractAddress = config.address;
        this.abi = config.abi;
      }
      
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      
      // Get signer (first account)
      this.signer = await this.provider.getSigner();
      
      // Initialize contract
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.abi,
        this.signer
      );
      
      this.connected = true;
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('BlockchainBridge connected to:', this.contractAddress);
      
      return true;
    } catch (error) {
      console.error('Failed to connect to blockchain:', error);
      this.connected = false;
      throw error;
    }
  }
  
  /**
   * Load contract configuration from file
   */
  async loadContractConfig() {
    try {
      const response = await fetch('/src/blockchain/contract-config.json');
      if (!response.ok) {
        throw new Error('Contract config not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load contract config:', error);
      throw new Error('Contract not deployed. Run: cd contracts && npm run deploy');
    }
  }
  
  /**
   * Propose a mutation with genome and Ourocode hashes
   * @param {string} genomeHash - Hash of organism state
   * @param {string} ourocodeHash - Hash of compiled Ourocode
   * @returns {Promise<number>} Proposal ID
   */
  async proposeMutation(genomeHash, ourocodeHash) {
    if (!this.connected) {
      throw new Error('Not connected to blockchain');
    }
    
    try {
      console.log('Proposing mutation...');
      console.log('  Genome Hash:', genomeHash);
      console.log('  Ourocode Hash:', ourocodeHash);
      
      // Submit transaction
      const tx = await this.contract.proposeMutation(genomeHash, ourocodeHash);
      console.log('  Transaction hash:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('  Transaction confirmed in block:', receipt.blockNumber);
      
      // Extract proposal ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed && parsed.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const proposalId = Number(parsed.args.id);
        console.log('  Proposal ID:', proposalId);
        return proposalId;
      }
      
      throw new Error('ProposalCreated event not found');
    } catch (error) {
      console.error('Failed to propose mutation:', error);
      throw error;
    }
  }
  
  /**
   * Vote on a proposal
   * @param {number} proposalId - The proposal ID
   * @param {boolean} support - True for yes, false for no
   */
  async vote(proposalId, support) {
    if (!this.connected) {
      throw new Error('Not connected to blockchain');
    }
    
    try {
      console.log(`Voting on proposal ${proposalId}:`, support ? 'YES' : 'NO');
      
      const tx = await this.contract.vote(proposalId, support);
      console.log('  Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('  Vote recorded in block:', receipt.blockNumber);
      
      return receipt;
    } catch (error) {
      console.error('Failed to vote:', error);
      throw error;
    }
  }
  
  /**
   * Execute an approved proposal
   * @param {number} proposalId - The proposal ID
   */
  async executeProposal(proposalId) {
    if (!this.connected) {
      throw new Error('Not connected to blockchain');
    }
    
    try {
      console.log(`Executing proposal ${proposalId}...`);
      
      const tx = await this.contract.executeProposal(proposalId);
      console.log('  Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('  Proposal executed in block:', receipt.blockNumber);
      
      // Extract generation from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed && parsed.name === 'GenomeRecorded';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const generation = Number(parsed.args.generation);
        console.log('  New generation:', generation);
        return { receipt, generation };
      }
      
      return { receipt, generation: null };
    } catch (error) {
      console.error('Failed to execute proposal:', error);
      throw error;
    }
  }
  
  /**
   * Query genome history by generation
   * @param {number} generation - The generation number
   * @returns {Promise<Object>} Genome record
   */
  async getGenomeHistory(generation) {
    if (!this.connected) {
      throw new Error('Not connected to blockchain');
    }
    
    try {
      const [hash, timestamp, blockNumber] = await this.contract.getGenomeHistory(generation);
      
      return {
        generation,
        hash,
        timestamp: Number(timestamp),
        blockNumber: Number(blockNumber)
      };
    } catch (error) {
      console.error('Failed to get genome history:', error);
      throw error;
    }
  }
  
  /**
   * Get proposal details
   * @param {number} proposalId - The proposal ID
   * @returns {Promise<Object>} Proposal details
   */
  async getProposal(proposalId) {
    if (!this.connected) {
      throw new Error('Not connected to blockchain');
    }
    
    try {
      const proposal = await this.contract.getProposal(proposalId);
      
      return {
        id: Number(proposal.id),
        genomeHash: proposal.genomeHash,
        ourocodeHash: proposal.ourocodeHash,
        proposer: proposal.proposer,
        createdAt: Number(proposal.createdAt),
        votesFor: Number(proposal.votesFor),
        votesAgainst: Number(proposal.votesAgainst),
        executed: proposal.executed
      };
    } catch (error) {
      console.error('Failed to get proposal:', error);
      throw error;
    }
  }
  
  /**
   * Check if address has voted on proposal
   * @param {number} proposalId - The proposal ID
   * @param {string} voter - The voter address
   * @returns {Promise<boolean>} True if voted
   */
  async hasVoted(proposalId, voter = null) {
    if (!this.connected) {
      throw new Error('Not connected to blockchain');
    }
    
    try {
      const address = voter || await this.signer.getAddress();
      return await this.contract.hasVotedOnProposal(proposalId, address);
    } catch (error) {
      console.error('Failed to check vote status:', error);
      throw error;
    }
  }
  
  /**
   * Get current contract state
   * @returns {Promise<Object>} Contract state
   */
  async getContractState() {
    if (!this.connected) {
      throw new Error('Not connected to blockchain');
    }
    
    try {
      const [proposalCount, currentGeneration, votingPeriod, quorum, owner, paused] = 
        await Promise.all([
          this.contract.proposalCount(),
          this.contract.currentGeneration(),
          this.contract.votingPeriod(),
          this.contract.quorum(),
          this.contract.owner(),
          this.contract.paused()
        ]);
      
      return {
        proposalCount: Number(proposalCount),
        currentGeneration: Number(currentGeneration),
        votingPeriod: Number(votingPeriod),
        quorum: Number(quorum),
        owner,
        paused
      };
    } catch (error) {
      console.error('Failed to get contract state:', error);
      throw error;
    }
  }
  
  /**
   * Connection health check
   * @returns {Promise<boolean>} True if connected and healthy
   */
  async healthCheck() {
    try {
      if (!this.connected || !this.contract) {
        return false;
      }
      
      // Try to read contract state
      await this.contract.proposalCount();
      
      // Check provider connection
      const blockNumber = await this.provider.getBlockNumber();
      
      return blockNumber > 0;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
  
  /**
   * Set up event listeners for contract events
   */
  setupEventListeners() {
    if (!this.contract) return;
    
    // ProposalCreated event
    this.contract.on('ProposalCreated', (id, genomeHash, ourocodeHash, proposer, createdAt) => {
      const event = {
        type: 'ProposalCreated',
        proposalId: Number(id),
        genomeHash,
        ourocodeHash,
        proposer,
        createdAt: Number(createdAt)
      };
      
      console.log('Event: ProposalCreated', event);
      this.eventListeners.proposalCreated.forEach(callback => callback(event));
    });
    
    // VoteCast event
    this.contract.on('VoteCast', (proposalId, voter, support, votesFor, votesAgainst) => {
      const event = {
        type: 'VoteCast',
        proposalId: Number(proposalId),
        voter,
        support,
        votesFor: Number(votesFor),
        votesAgainst: Number(votesAgainst)
      };
      
      console.log('Event: VoteCast', event);
      this.eventListeners.voteCast.forEach(callback => callback(event));
    });
    
    // ProposalExecuted event
    this.contract.on('ProposalExecuted', (proposalId, genomeHash, generation) => {
      const event = {
        type: 'ProposalExecuted',
        proposalId: Number(proposalId),
        genomeHash,
        generation: Number(generation)
      };
      
      console.log('Event: ProposalExecuted', event);
      this.eventListeners.proposalExecuted.forEach(callback => callback(event));
    });
    
    // GenomeRecorded event
    this.contract.on('GenomeRecorded', (generation, hash, blockNumber, timestamp) => {
      const event = {
        type: 'GenomeRecorded',
        generation: Number(generation),
        hash,
        blockNumber: Number(blockNumber),
        timestamp: Number(timestamp)
      };
      
      console.log('Event: GenomeRecorded', event);
      this.eventListeners.genomeRecorded.forEach(callback => callback(event));
    });
  }
  
  /**
   * Register event listener
   * @param {string} eventType - Event type (proposalCreated, voteCast, etc.)
   * @param {Function} callback - Callback function
   */
  on(eventType, callback) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].push(callback);
    } else {
      console.warn(`Unknown event type: ${eventType}`);
    }
  }
  
  /**
   * Remove event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function to remove
   */
  off(eventType, callback) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType] = this.eventListeners[eventType]
        .filter(cb => cb !== callback);
    }
  }
  
  /**
   * Disconnect from blockchain
   */
  disconnect() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
    
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.connected = false;
    
    console.log('BlockchainBridge disconnected');
  }
  
  /**
   * Get current signer address
   * @returns {Promise<string>} Signer address
   */
  async getSignerAddress() {
    if (!this.signer) {
      throw new Error('Not connected');
    }
    return await this.signer.getAddress();
  }
  
  /**
   * Get network information
   * @returns {Promise<Object>} Network info
   */
  async getNetwork() {
    if (!this.provider) {
      throw new Error('Not connected');
    }
    
    const network = await this.provider.getNetwork();
    return {
      name: network.name,
      chainId: Number(network.chainId)
    };
  }
}

export default BlockchainBridge;
