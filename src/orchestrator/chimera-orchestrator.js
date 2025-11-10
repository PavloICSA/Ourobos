/**
 * ChimeraOrchestrator - Integrated orchestrator for OuroborOS-Chimera
 * 
 * Coordinates all components in the mutation lifecycle:
 * - Blockchain governance (proposals, voting, execution)
 * - Quantum entropy generation
 * - Bio sensor readings
 * - Meta-compiler (Ourocode compilation)
 * - Runtime execution (Rust, Fortran, Go, Lisp)
 * - Neural clusters
 * - Visualization
 */

import { BlockchainBridge } from '../blockchain/blockchain-bridge.js';
import { QuantumEntropyClient } from '../quantum/client.js';
import { BioSensorClient } from '../biosensor/client.js';
import { MetaCompiler } from '../metacompiler/meta-compiler.js';
import { OurocodeExecutor } from '../metacompiler/ourocode-executor.js';
import { GoNeuralClusters } from '../go-bridge/bridge.js';
import { ServiceHealthMonitor } from './service-health-monitor.js';
import { ServiceIntegration } from './service-integration.js';
import { ErrorRecovery } from './error-recovery.js';
import config from '../config/index.js';

/**
 * Service health status
 * @typedef {Object} ServiceHealth
 * @property {boolean} blockchain - Blockchain service health
 * @property {boolean} quantum - Quantum service health
 * @property {boolean} bioSensor - Bio sensor service health
 * @property {boolean} goWasm - Go WASM health
 */

/**
 * Chimera organism state
 * @typedef {Object} ChimeraOrganismState
 * @property {number} population - Population count
 * @property {number} energy - Energy level
 * @property {number} mutationRate - Mutation rate
 * @property {number} generation - Generation number
 * @property {number} blockchainGeneration - Blockchain generation
 * @property {string} lastGenomeHash - Last genome hash
 * @property {string} quantumEntropyUsed - Last quantum entropy used
 * @property {Object} sensorReadings - Last sensor readings
 * @property {string[]} activeClusterIds - Active neural cluster IDs
 */

export class ChimeraOrchestrator {
  constructor(options = {}) {
    // Component clients
    this.blockchainBridge = null;
    this.quantumClient = null;
    this.bioSensorClient = null;
    this.metaCompiler = null;
    this.ourocodeExecutor = null;
    this.goNeuralClusters = null;
    
    // WASM modules (to be loaded)
    this.rustEngine = null;
    this.fortranEngine = null;
    this.lispInterpreter = null;
    
    // Visualization (to be set externally)
    this.visualizer = null;
    
    // State management
    this.pendingMutations = new Map(); // proposalId -> OurocodeModule
    this.activeClusterIds = ['main', 'secondary'];
    this.currentState = this.createInitialState();
    
    // Service health monitoring
    this.serviceHealth = {
      blockchain: false,
      quantum: false,
      bioSensor: false,
      goWasm: false
    };
    
    // Service health monitor
    this.healthMonitor = null;
    
    // Service integration manager
    this.serviceIntegration = null;
    
    // Error recovery manager
    this.errorRecovery = null;
    
    // Event listeners
    this.eventListeners = {
      proposalCreated: [],
      voteCast: [],
      proposalExecuted: [],
      mutationComplete: [],
      serviceHealthChanged: [],
      sensorUpdate: [],
      clusterDecision: [],
      stateUpdate: [],
      initialized: []
    };
    
    // Initialization flag
    this.initialized = false;
    
    // Options
    this.options = {
      enableBlockchain: options.enableBlockchain ?? config.blockchain.enabled,
      enableQuantum: options.enableQuantum ?? config.quantum.enabled,
      enableBioSensor: options.enableBioSensor ?? config.bioSensor.enabled,
      useMockQuantum: options.useMockQuantum ?? config.quantum.useMock,
      useMockBioSensor: options.useMockBioSensor ?? config.bioSensor.useMock,
      ...options
    };
  }
  
  /**
   * Initialize all components and load WASM modules
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      console.warn('ChimeraOrchestrator already initialized');
      return;
    }
    
    console.log('Initializing ChimeraOrchestrator...');
    
    try {
      // Initialize meta-compiler and executor (always needed)
      this.metaCompiler = new MetaCompiler();
      this.ourocodeExecutor = new OurocodeExecutor({
        maxInstructions: config.compiler.maxInstructions,
        maxMemory: config.compiler.maxMemory,
        timeout: config.compiler.timeout
      });
      
      // Initialize blockchain bridge
      if (this.options.enableBlockchain) {
        await this.initBlockchain();
      } else {
        console.log('Blockchain disabled');
      }
      
      // Initialize quantum client
      if (this.options.enableQuantum) {
        await this.initQuantum();
      } else {
        console.log('Quantum service disabled');
      }
      
      // Initialize bio sensor client
      if (this.options.enableBioSensor) {
        await this.initBioSensor();
      } else {
        console.log('Bio sensor disabled');
      }
      
      // Initialize Go neural clusters
      await this.initGoNeuralClusters();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize and start health monitoring
      this.initHealthMonitoring();
      
      // Initialize service integration and connect all clients
      await this.initServiceIntegration();
      
      // Initialize error recovery
      this.initErrorRecovery();
      
      this.initialized = true;
      console.log('ChimeraOrchestrator initialized successfully');
      
      // Emit initialization complete event
      this.emit('initialized', { serviceHealth: this.serviceHealth });
      
    } catch (error) {
      console.error('Failed to initialize ChimeraOrchestrator:', error);
      throw error;
    }
  }
  
  /**
   * Initialize blockchain bridge
   * @private
   */
  async initBlockchain() {
    try {
      console.log('Initializing blockchain bridge...');
      
      this.blockchainBridge = new BlockchainBridge({
        rpcUrl: config.blockchain.rpcUrl,
        contractAddress: config.blockchain.contractAddress
      });
      
      await this.blockchainBridge.connect();
      
      this.serviceHealth.blockchain = true;
      console.log('Blockchain bridge initialized');
      
    } catch (error) {
      console.warn('Blockchain initialization failed:', error.message);
      this.serviceHealth.blockchain = false;
      
      // Don't throw - allow graceful degradation
      if (this.options.enableBlockchain) {
        console.log('Continuing without blockchain (mock mode)');
      }
    }
  }
  
  /**
   * Initialize quantum entropy client
   * @private
   */
  async initQuantum() {
    try {
      console.log('Initializing quantum entropy client...');
      
      this.quantumClient = new QuantumEntropyClient(
        config.quantum.apiUrl,
        this.options.useMockQuantum
      );
      
      // Check health
      const healthy = await this.quantumClient.healthCheck();
      this.serviceHealth.quantum = healthy;
      
      if (healthy) {
        console.log('Quantum entropy client initialized');
      } else {
        console.log('Quantum service unavailable, using mock mode');
      }
      
    } catch (error) {
      console.warn('Quantum initialization failed:', error.message);
      this.serviceHealth.quantum = false;
      
      // Create client in mock mode
      this.quantumClient = new QuantumEntropyClient(
        config.quantum.apiUrl,
        true // force mock
      );
    }
  }
  
  /**
   * Initialize bio sensor client
   * @private
   */
  async initBioSensor() {
    try {
      console.log('Initializing bio sensor client...');
      
      this.bioSensorClient = new BioSensorClient(
        config.bioSensor.apiUrl,
        this.options.useMockBioSensor
      );
      
      // Check health
      const healthy = await this.bioSensorClient.healthCheck();
      this.serviceHealth.bioSensor = healthy;
      
      if (healthy) {
        console.log('Bio sensor client initialized');
      } else {
        console.log('Bio sensor unavailable, using mock mode');
      }
      
    } catch (error) {
      console.warn('Bio sensor initialization failed:', error.message);
      this.serviceHealth.bioSensor = false;
      
      // Create client in mock mode
      this.bioSensorClient = new BioSensorClient(
        config.bioSensor.apiUrl,
        true // force mock
      );
    }
  }
  
  /**
   * Initialize Go neural clusters
   * @private
   */
  async initGoNeuralClusters() {
    try {
      console.log('Initializing Go neural clusters...');
      
      this.goNeuralClusters = new GoNeuralClusters();
      await this.goNeuralClusters.init();
      
      // Create initial clusters
      for (const clusterId of this.activeClusterIds) {
        this.goNeuralClusters.createCluster(clusterId);
        
        // Initialize with current state
        this.goNeuralClusters.updateClusterState(clusterId, {
          population: this.currentState.population,
          energy: this.currentState.energy,
          mutation_rate: this.currentState.mutationRate
        });
      }
      
      this.serviceHealth.goWasm = true;
      console.log('Go neural clusters initialized');
      
    } catch (error) {
      console.warn('Go neural clusters initialization failed:', error.message);
      this.serviceHealth.goWasm = false;
      
      // Continue without Go clusters
      console.log('Continuing without Go neural clusters');
    }
  }
  
  /**
   * Set up event listeners for blockchain events
   * @private
   */
  setupEventListeners() {
    if (!this.blockchainBridge) return;
    
    // Listen for proposal created events
    this.blockchainBridge.on('proposalCreated', (event) => {
      console.log('Proposal created:', event);
      this.emit('proposalCreated', event);
    });
    
    // Listen for vote cast events
    this.blockchainBridge.on('voteCast', (event) => {
      console.log('Vote cast:', event);
      this.emit('voteCast', event);
    });
    
    // Listen for proposal executed events
    this.blockchainBridge.on('proposalExecuted', (event) => {
      console.log('Proposal executed:', event);
      this.emit('proposalExecuted', event);
    });
    
    // Listen for genome recorded events
    this.blockchainBridge.on('genomeRecorded', (event) => {
      console.log('Genome recorded:', event);
      this.currentState.blockchainGeneration = event.generation;
      this.currentState.lastGenomeHash = event.hash;
    });
  }
  
  /**
   * Initialize health monitoring
   * @private
   */
  initHealthMonitoring() {
    console.log('Initializing service health monitor...');
    
    // Create health monitor
    this.healthMonitor = new ServiceHealthMonitor({
      blockchainBridge: this.blockchainBridge,
      quantumClient: this.quantumClient,
      bioSensorClient: this.bioSensorClient,
      goNeuralClusters: this.goNeuralClusters
    });
    
    // Set check interval from config
    this.healthMonitor.setCheckInterval(config.monitoring.healthCheckInterval);
    
    // Listen for health changes
    this.healthMonitor.on('healthChanged', (status) => {
      // Update local service health
      this.serviceHealth.blockchain = status.blockchain.healthy;
      this.serviceHealth.quantum = status.quantum.healthy;
      this.serviceHealth.bioSensor = status.bioSensor.healthy;
      this.serviceHealth.goWasm = status.goWasm.healthy;
      
      // Emit event
      this.emit('serviceHealthChanged', this.serviceHealth);
    });
    
    // Listen for service down events
    this.healthMonitor.on('serviceDown', (event) => {
      console.warn(`Service ${event.service} went down:`, event.error);
    });
    
    // Listen for service up events
    this.healthMonitor.on('serviceUp', (event) => {
      console.log(`Service ${event.service} is back up`);
    });
    
    // Start monitoring
    this.healthMonitor.startMonitoring();
  }
  
  /**
   * Initialize service integration
   * @private
   */
  async initServiceIntegration() {
    console.log('Initializing service integration...');
    
    // Create service integration manager
    this.serviceIntegration = new ServiceIntegration(this);
    
    // Connect all service clients
    await this.serviceIntegration.connect();
    
    console.log('Service integration complete');
  }
  
  /**
   * Initialize error recovery
   * @private
   */
  initErrorRecovery() {
    console.log('Initializing error recovery...');
    
    // Create error recovery manager
    this.errorRecovery = new ErrorRecovery(this);
    
    // Listen for service health changes and trigger reconnection
    this.on('serviceHealthChanged', (health) => {
      // Check for services that went down
      if (!health.blockchain && this.options.enableBlockchain) {
        this.errorRecovery.reconnectService('blockchain');
      }
      if (!health.quantum && this.options.enableQuantum) {
        this.errorRecovery.reconnectService('quantum');
      }
      if (!health.bioSensor && this.options.enableBioSensor) {
        this.errorRecovery.reconnectService('bioSensor');
      }
    });
    
    console.log('Error recovery initialized');
  }
  
  /**
   * Check health of all services
   * @returns {Promise<ServiceHealth>}
   */
  async checkServiceHealth() {
    if (this.healthMonitor) {
      await this.healthMonitor.checkHealth();
      return this.serviceHealth;
    }
    
    // Fallback to simple health check if monitor not initialized
    const previousHealth = { ...this.serviceHealth };
    
    // Check blockchain
    if (this.blockchainBridge) {
      try {
        this.serviceHealth.blockchain = await this.blockchainBridge.healthCheck();
      } catch {
        this.serviceHealth.blockchain = false;
      }
    }
    
    // Check quantum
    if (this.quantumClient) {
      try {
        this.serviceHealth.quantum = await this.quantumClient.healthCheck();
      } catch {
        this.serviceHealth.quantum = false;
      }
    }
    
    // Check bio sensor
    if (this.bioSensorClient) {
      try {
        this.serviceHealth.bioSensor = await this.bioSensorClient.healthCheck();
      } catch {
        this.serviceHealth.bioSensor = false;
      }
    }
    
    // Check Go WASM
    if (this.goNeuralClusters) {
      this.serviceHealth.goWasm = this.goNeuralClusters.isInitialized();
    }
    
    // Emit event if health changed
    if (JSON.stringify(previousHealth) !== JSON.stringify(this.serviceHealth)) {
      this.emit('serviceHealthChanged', this.serviceHealth);
    }
    
    return this.serviceHealth;
  }
  
  /**
   * Get current service health status
   * @returns {ServiceHealth}
   */
  getServiceHealth() {
    return { ...this.serviceHealth };
  }
  
  /**
   * Get detailed service status from health monitor
   * @returns {Object} Detailed service status
   */
  getDetailedServiceStatus() {
    if (this.healthMonitor) {
      return this.healthMonitor.getServiceStatus();
    }
    
    // Fallback to simple status
    return {
      blockchain: { healthy: this.serviceHealth.blockchain, status: this.serviceHealth.blockchain ? 'online' : 'offline' },
      quantum: { healthy: this.serviceHealth.quantum, status: this.serviceHealth.quantum ? 'online' : 'mock' },
      bioSensor: { healthy: this.serviceHealth.bioSensor, status: this.serviceHealth.bioSensor ? 'online' : 'mock' },
      goWasm: { healthy: this.serviceHealth.goWasm, status: this.serviceHealth.goWasm ? 'online' : 'offline' },
      overall: 'unknown'
    };
  }
  
  /**
   * Get health monitor instance
   * @returns {ServiceHealthMonitor|null}
   */
  getHealthMonitor() {
    return this.healthMonitor;
  }
  
  /**
   * Create initial organism state
   * @private
   */
  createInitialState() {
    return {
      population: 100,
      energy: 50,
      mutationRate: 0.05,
      generation: 0,
      blockchainGeneration: 0,
      lastGenomeHash: '',
      quantumEntropyUsed: '',
      sensorReadings: {
        light: 0.5,
        temperature: 0.5,
        acceleration: 0.5
      },
      activeClusterIds: ['main', 'secondary']
    };
  }
  
  /**
   * Get current organism state
   * @returns {ChimeraOrganismState}
   */
  getCurrentState() {
    return { ...this.currentState };
  }
  
  /**
   * Update organism state
   * @param {Partial<ChimeraOrganismState>} updates
   */
  updateState(updates) {
    this.currentState = {
      ...this.currentState,
      ...updates
    };
    
    // Emit state update event (service integration will handle cluster updates)
    this.emit('stateUpdate', this.currentState);
    
    // Legacy: Update neural clusters directly if service integration not active
    if (!this.serviceIntegration && this.goNeuralClusters && this.serviceHealth.goWasm) {
      for (const clusterId of this.activeClusterIds) {
        try {
          this.goNeuralClusters.updateClusterState(clusterId, {
            population: this.currentState.population,
            energy: this.currentState.energy,
            mutation_rate: this.currentState.mutationRate
          });
        } catch (error) {
          console.warn(`Failed to update cluster ${clusterId}:`, error.message);
        }
      }
    }
  }
  
  /**
   * Register event listener
   * @param {string} eventType - Event type
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
   * @param {Function} callback - Callback function
   */
  off(eventType, callback) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType] = this.eventListeners[eventType]
        .filter(cb => cb !== callback);
    }
  }
  
  /**
   * Emit event to all listeners
   * @private
   */
  emit(eventType, data) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }
  
  /**
   * Set visualizer instance
   * @param {Object} visualizer - Visualizer instance
   */
  setVisualizer(visualizer) {
    this.visualizer = visualizer;
  }
  
  /**
   * Check if orchestrator is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }
  
  /**
   * Ensure orchestrator is initialized
   * @private
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('ChimeraOrchestrator not initialized. Call init() first.');
    }
  }
  
  // ============================================================================
  // MUTATION PROPOSAL FLOW
  // ============================================================================
  
  /**
   * Propose a mutation to the organism
   * 
   * Flow:
   * 1. Compile code to Ourocode using meta-compiler
   * 2. Validate Ourocode syntax
   * 3. Generate genome hash and Ourocode hash
   * 4. Submit proposal to blockchain
   * 5. Store pending mutation for later execution
   * 
   * @param {string} code - Source code for mutation
   * @param {string} language - Source language (algol, lisp, pascal, rust, go, fortran)
   * @returns {Promise<number>} Proposal ID
   */
  async proposeMutation(code, language) {
    this.ensureInitialized();
    
    console.log(`Proposing mutation in ${language}...`);
    
    try {
      // Step 1: Compile code to Ourocode
      console.log('Step 1: Compiling to Ourocode...');
      const ourocodeModule = this.metaCompiler.compile(code, language);
      console.log('  Compilation successful');
      
      // Step 2: Validate Ourocode syntax
      console.log('Step 2: Validating Ourocode...');
      const isValid = this.metaCompiler.validate(ourocodeModule);
      
      if (!isValid) {
        throw new Error('Invalid Ourocode generated');
      }
      console.log('  Validation successful');
      
      // Step 3: Generate hashes
      console.log('Step 3: Generating hashes...');
      const ourocodeHash = await this.metaCompiler.hash(ourocodeModule);
      const genomeHash = await this.computeGenomeHash(ourocodeModule);
      console.log('  Ourocode hash:', ourocodeHash);
      console.log('  Genome hash:', genomeHash);
      
      // Step 4: Submit to blockchain (with fallback)
      console.log('Step 4: Submitting to blockchain...');
      
      let proposalId;
      
      if (this.errorRecovery) {
        // Use error recovery fallback chain
        proposalId = await this.errorRecovery.submitProposalWithFallback(
          genomeHash,
          ourocodeHash
        );
      } else {
        // Legacy fallback
        if (!this.blockchainBridge || !this.serviceHealth.blockchain) {
          console.warn('Blockchain unavailable, using mock proposal ID');
          proposalId = Date.now() % 10000;
        } else {
          proposalId = await this.blockchainBridge.proposeMutation(
            genomeHash,
            ourocodeHash
          );
        }
      }
      
      console.log('  Proposal ID:', proposalId);
      
      // Step 5: Store pending mutation for later execution
      console.log('Step 5: Storing pending mutation...');
      this.pendingMutations.set(proposalId, {
        ourocodeModule,
        code,
        language,
        genomeHash,
        ourocodeHash,
        createdAt: Date.now()
      });
      
      console.log('Mutation proposal complete!');
      
      return proposalId;
      
    } catch (error) {
      console.error('Failed to propose mutation:', error);
      throw error;
    }
  }
  
  /**
   * Compute genome hash from current state and Ourocode module
   * @private
   * @param {Object} ourocodeModule - Ourocode module
   * @returns {Promise<string>} Genome hash
   */
  async computeGenomeHash(ourocodeModule) {
    // Combine current state with Ourocode module
    const combined = JSON.stringify({
      state: {
        population: this.currentState.population,
        energy: this.currentState.energy,
        mutationRate: this.currentState.mutationRate,
        generation: this.currentState.generation
      },
      module: {
        name: ourocodeModule.name,
        version: ourocodeModule.version,
        source: ourocodeModule.source,
        functionCount: ourocodeModule.functions.size
      },
      timestamp: Date.now()
    });
    
    // Generate SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Get pending mutation by proposal ID
   * @param {number} proposalId - Proposal ID
   * @returns {Object|null} Pending mutation or null
   */
  getPendingMutation(proposalId) {
    return this.pendingMutations.get(proposalId) || null;
  }
  
  /**
   * List all pending mutations
   * @returns {Array} Array of {proposalId, mutation} objects
   */
  listPendingMutations() {
    const pending = [];
    for (const [proposalId, mutation] of this.pendingMutations.entries()) {
      pending.push({ proposalId, mutation });
    }
    return pending;
  }
  
  // ============================================================================
  // VOTING FLOW
  // ============================================================================
  
  /**
   * Vote on a proposal
   * 
   * @param {number} proposalId - The proposal ID
   * @param {boolean} support - True for yes, false for no
   * @returns {Promise<void>}
   */
  async vote(proposalId, support) {
    this.ensureInitialized();
    
    console.log(`Voting on proposal ${proposalId}: ${support ? 'YES' : 'NO'}`);
    
    try {
      // Check if blockchain is available
      if (!this.blockchainBridge || !this.serviceHealth.blockchain) {
        console.warn('Blockchain unavailable, vote not recorded on-chain');
        console.log('  Vote would be:', support ? 'YES' : 'NO');
        return;
      }
      
      // Submit vote to blockchain
      await this.blockchainBridge.vote(proposalId, support);
      
      console.log('Vote recorded successfully');
      
    } catch (error) {
      console.error('Failed to vote:', error);
      throw error;
    }
  }
  
  /**
   * Get proposal details
   * @param {number} proposalId - The proposal ID
   * @returns {Promise<Object>} Proposal details
   */
  async getProposal(proposalId) {
    this.ensureInitialized();
    
    // Check if blockchain is available
    if (!this.blockchainBridge || !this.serviceHealth.blockchain) {
      // Return mock proposal data
      const pending = this.pendingMutations.get(proposalId);
      if (pending) {
        return {
          id: proposalId,
          genomeHash: pending.genomeHash,
          ourocodeHash: pending.ourocodeHash,
          proposer: 'mock',
          createdAt: pending.createdAt,
          votesFor: 1,
          votesAgainst: 0,
          executed: false,
          mock: true
        };
      }
      return null;
    }
    
    try {
      return await this.blockchainBridge.getProposal(proposalId);
    } catch (error) {
      console.error('Failed to get proposal:', error);
      throw error;
    }
  }
  
  /**
   * Get voting status for a proposal
   * @param {number} proposalId - The proposal ID
   * @returns {Promise<Object>} Voting status
   */
  async getVotingStatus(proposalId) {
    this.ensureInitialized();
    
    try {
      const proposal = await this.getProposal(proposalId);
      
      if (!proposal) {
        return {
          found: false,
          proposalId
        };
      }
      
      const totalVotes = proposal.votesFor + proposal.votesAgainst;
      const percentFor = totalVotes > 0 
        ? (proposal.votesFor / totalVotes * 100).toFixed(1)
        : 0;
      
      return {
        found: true,
        proposalId,
        votesFor: proposal.votesFor,
        votesAgainst: proposal.votesAgainst,
        totalVotes,
        percentFor,
        executed: proposal.executed,
        mock: proposal.mock || false
      };
    } catch (error) {
      console.error('Failed to get voting status:', error);
      throw error;
    }
  }
  
  /**
   * Check if current user has voted on a proposal
   * @param {number} proposalId - The proposal ID
   * @returns {Promise<boolean>} True if voted
   */
  async hasVoted(proposalId) {
    this.ensureInitialized();
    
    if (!this.blockchainBridge || !this.serviceHealth.blockchain) {
      return false; // Can't check in mock mode
    }
    
    try {
      return await this.blockchainBridge.hasVoted(proposalId);
    } catch (error) {
      console.error('Failed to check vote status:', error);
      return false;
    }
  }
  
  /**
   * Track proposal state (for UI display)
   * @param {number} proposalId - The proposal ID
   * @returns {Promise<string>} State: 'voting', 'approved', 'rejected', 'executed'
   */
  async getProposalState(proposalId) {
    this.ensureInitialized();
    
    try {
      const proposal = await this.getProposal(proposalId);
      
      if (!proposal) {
        return 'unknown';
      }
      
      if (proposal.executed) {
        return 'executed';
      }
      
      // Check if voting period ended (60 seconds default)
      const votingPeriod = 60000; // 60 seconds in ms
      const now = Date.now();
      const votingEnded = (now - proposal.createdAt) > votingPeriod;
      
      if (!votingEnded) {
        return 'voting';
      }
      
      // Voting ended, check if approved
      const totalVotes = proposal.votesFor + proposal.votesAgainst;
      const quorum = 50; // 50% threshold
      
      if (totalVotes === 0) {
        return 'rejected'; // No votes = rejected
      }
      
      const percentFor = (proposal.votesFor / totalVotes * 100);
      
      if (percentFor >= quorum) {
        return 'approved';
      } else {
        return 'rejected';
      }
      
    } catch (error) {
      console.error('Failed to get proposal state:', error);
      return 'unknown';
    }
  }
  
  // ============================================================================
  // MUTATION EXECUTION FLOW
  // ============================================================================
  
  /**
   * Execute an approved mutation
   * 
   * Flow:
   * 1. Execute proposal on blockchain
   * 2. Fetch quantum entropy
   * 3. Get bio sensor readings
   * 4. Prepare mutation parameters
   * 5. Execute Ourocode in appropriate runtime
   * 6. Update neural clusters
   * 7. Record genome hash on blockchain
   * 8. Update visualization
   * 
   * @param {number} proposalId - The proposal ID
   * @returns {Promise<Object>} Execution result
   */
  async executeMutation(proposalId) {
    this.ensureInitialized();
    
    console.log(`Executing mutation ${proposalId}...`);
    
    try {
      // Get pending mutation
      const pending = this.pendingMutations.get(proposalId);
      if (!pending) {
        throw new Error(`Pending mutation not found for proposal ${proposalId}`);
      }
      
      const { ourocodeModule, code, language } = pending;
      
      // Step 1: Execute proposal on blockchain
      console.log('Step 1: Executing proposal on blockchain...');
      let generation = null;
      
      if (this.blockchainBridge && this.serviceHealth.blockchain) {
        const result = await this.blockchainBridge.executeProposal(proposalId);
        generation = result.generation;
        console.log('  Blockchain execution complete, generation:', generation);
      } else {
        console.log('  Blockchain unavailable, using mock generation');
        generation = this.currentState.generation + 1;
      }
      
      // Step 2: Fetch quantum entropy (with fallback)
      console.log('Step 2: Fetching quantum entropy...');
      let quantumEntropy = '';
      
      if (this.errorRecovery) {
        quantumEntropy = await this.errorRecovery.getEntropyWithFallback();
        console.log('  Quantum entropy:', quantumEntropy.substring(0, 16) + '...');
      } else {
        // Legacy fallback
        if (this.quantumClient) {
          quantumEntropy = await this.quantumClient.getEntropy(256);
          console.log('  Quantum entropy:', quantumEntropy.substring(0, 16) + '...');
        } else {
          console.log('  Quantum client unavailable');
        }
      }
      
      // Step 3: Get bio sensor readings (with fallback)
      console.log('Step 3: Getting bio sensor readings...');
      let sensorReadings;
      
      if (this.errorRecovery) {
        sensorReadings = await this.errorRecovery.getSensorReadingsWithFallback();
        console.log('  Sensor readings:', sensorReadings);
      } else {
        // Legacy fallback
        sensorReadings = {
          light: 0.5,
          temperature: 0.5,
          acceleration: 0.5
        };
        
        if (this.bioSensorClient) {
          const readings = await this.bioSensorClient.getReadings();
          sensorReadings = {
            light: readings.light ?? 0.5,
            temperature: readings.temperature ?? 0.5,
            acceleration: readings.acceleration ?? 0.5
          };
          console.log('  Sensor readings:', sensorReadings);
        } else {
          console.log('  Bio sensor client unavailable');
        }
      }
      
      // Ensure sensorReadings has all required fields
      sensorReadings = {
        light: sensorReadings.light ?? 0.5,
        temperature: sensorReadings.temperature ?? 0.5,
        acceleration: sensorReadings.acceleration ?? 0.5
      };
      
      // Step 4: Prepare mutation parameters
      console.log('Step 4: Preparing mutation parameters...');
      const mutationParams = {
        entropy: quantumEntropy,
        light: sensorReadings.light,
        temperature: sensorReadings.temperature,
        acceleration: sensorReadings.acceleration,
        generation: generation
      };
      
      // Step 5: Execute Ourocode in appropriate runtime
      console.log('Step 5: Executing Ourocode...');
      const newState = await this.executeOurocode(ourocodeModule, mutationParams);
      console.log('  New state:', newState);
      
      // Step 6: Update neural clusters
      console.log('Step 6: Updating neural clusters...');
      await this.updateNeuralClusters(newState);
      
      // Step 7: Update organism state
      console.log('Step 7: Updating organism state...');
      this.updateState({
        population: newState.population,
        energy: newState.energy,
        mutationRate: newState.mutationRate,
        generation: generation,
        blockchainGeneration: generation,
        quantumEntropyUsed: quantumEntropy,
        sensorReadings: sensorReadings
      });
      
      // Step 8: Update visualization
      console.log('Step 8: Updating visualization...');
      if (this.visualizer) {
        this.visualizer.render(this.currentState);
      }
      
      // Clean up pending mutation
      this.pendingMutations.delete(proposalId);
      
      console.log('Mutation execution complete!');
      
      // Emit mutation complete event
      this.emit('mutationComplete', {
        proposalId,
        generation,
        newState,
        quantumEntropy,
        sensorReadings
      });
      
      return {
        success: true,
        proposalId,
        generation,
        newState,
        quantumEntropy,
        sensorReadings
      };
      
    } catch (error) {
      console.error('Failed to execute mutation:', error);
      throw error;
    }
  }
  
  /**
   * Execute Ourocode module
   * @private
   * @param {Object} ourocodeModule - Ourocode module
   * @param {Object} mutationParams - Mutation parameters
   * @returns {Promise<Object>} New organism state
   */
  async executeOurocode(ourocodeModule, mutationParams) {
    // Load module into executor
    this.ourocodeExecutor.loadModule(ourocodeModule);
    
    // Create current state array for Ourocode execution
    const stateArray = [
      this.currentState.population,
      this.currentState.energy,
      this.currentState.mutationRate
    ];
    
    try {
      // Execute the mutation rule function
      const newStateArray = this.ourocodeExecutor.execute(
        ourocodeModule.name,
        '@mutate_rule',
        [stateArray]
      );
      
      // Convert back to state object
      return {
        population: newStateArray[0],
        energy: newStateArray[1],
        mutationRate: newStateArray[2]
      };
      
    } catch (error) {
      console.error('Ourocode execution failed:', error);
      
      // Return current state unchanged on error
      return {
        population: this.currentState.population,
        energy: this.currentState.energy,
        mutationRate: this.currentState.mutationRate
      };
    }
  }
  
  /**
   * Update neural clusters with new state
   * @private
   * @param {Object} newState - New organism state
   * @returns {Promise<void>}
   */
  async updateNeuralClusters(newState) {
    if (!this.goNeuralClusters || !this.serviceHealth.goWasm) {
      console.log('  Go neural clusters unavailable');
      return;
    }
    
    // Update all active clusters
    for (const clusterId of this.activeClusterIds) {
      try {
        this.goNeuralClusters.updateClusterState(clusterId, {
          population: newState.population,
          energy: newState.energy,
          mutation_rate: newState.mutationRate
        });
        
        // Get decision from cluster
        const decision = this.goNeuralClusters.getClusterDecision(clusterId);
        if (decision) {
          console.log(`  Cluster ${clusterId} decision:`, decision.action, 
                      `(confidence: ${decision.confidence})`);
          
          // Process cluster decision (could influence future mutations)
          this.processClusterDecision(decision);
        }
      } catch (error) {
        console.warn(`  Failed to update cluster ${clusterId}:`, error.message);
      }
    }
  }
  
  /**
   * Process a decision from a neural cluster
   * @private
   * @param {Object} decision - Cluster decision
   */
  processClusterDecision(decision) {
    // Store decision for future reference
    // In a full implementation, this could influence mutation parameters
    // or trigger automatic mutations based on cluster consensus
    
    // For now, just log it
    console.log(`  Processing decision from ${decision.clusterId}:`, decision.action);
  }
  
  // ============================================================================
  // RUNTIME EXECUTION DISPATCHERS
  // ============================================================================
  
  /**
   * Execute Ourocode in appropriate runtime based on source language
   * @param {Object} ourocodeModule - Ourocode module
   * @param {Object} params - Execution parameters
   * @returns {Promise<any>} Execution result
   */
  async executeInRuntime(ourocodeModule, params) {
    const language = ourocodeModule.source;
    
    console.log(`Executing in ${language} runtime...`);
    
    switch (language) {
      case 'lisp':
      case 'algol':
        // Execute in Lisp interpreter (ALGOL compiles to Lisp)
        return await this.executeInLisp(ourocodeModule, params);
      
      case 'fortran':
        // Execute in Fortran numeric engine
        return await this.executeInFortran(ourocodeModule, params);
      
      case 'rust':
        // Execute in Rust WASM engine
        return await this.executeInRust(ourocodeModule, params);
      
      case 'go':
        // Execute in Go neural clusters
        return await this.executeInGo(ourocodeModule, params);
      
      case 'pascal':
        // Pascal would execute in Pascal WASM runtime
        throw new Error('Pascal runtime execution not yet implemented');
      
      default:
        throw new Error(`Unsupported runtime: ${language}`);
    }
  }
  
  /**
   * Execute Ourocode in Lisp interpreter
   * @private
   */
  async executeInLisp(ourocodeModule, params) {
    if (!this.lispInterpreter) {
      console.warn('Lisp interpreter not available, using Ourocode executor');
      return await this.executeOurocode(ourocodeModule, params);
    }
    
    // Convert Ourocode to Lisp
    const lispCode = this.ourocodeToLisp(ourocodeModule);
    
    // Execute in Lisp interpreter
    return this.lispInterpreter.eval(lispCode);
  }
  
  /**
   * Execute Ourocode in Fortran numeric engine
   * @private
   */
  async executeInFortran(ourocodeModule, params) {
    if (!this.fortranEngine) {
      console.warn('Fortran engine not available, using Ourocode executor');
      return await this.executeOurocode(ourocodeModule, params);
    }
    
    // Convert Ourocode to Fortran data arrays
    const fortranData = this.ourocodeToFortranData(ourocodeModule, params);
    
    // Execute in Fortran engine
    return this.fortranEngine.integrate(fortranData, 0.01);
  }
  
  /**
   * Execute Ourocode in Rust WASM engine
   * @private
   */
  async executeInRust(ourocodeModule, params) {
    if (!this.rustEngine) {
      console.warn('Rust engine not available, using Ourocode executor');
      return await this.executeOurocode(ourocodeModule, params);
    }
    
    // Convert Ourocode to Rust data structure
    const rustData = this.ourocodeToRustData(ourocodeModule, params);
    
    // Execute in Rust engine
    return this.rustEngine.call('step', rustData);
  }
  
  /**
   * Execute Ourocode in Go neural clusters
   * @private
   */
  async executeInGo(ourocodeModule, params) {
    if (!this.goNeuralClusters || !this.serviceHealth.goWasm) {
      console.warn('Go neural clusters not available, using Ourocode executor');
      return await this.executeOurocode(ourocodeModule, params);
    }
    
    // Convert Ourocode to cluster state
    const clusterState = this.ourocodeToClusterState(ourocodeModule, params);
    
    // Update main cluster
    this.goNeuralClusters.updateClusterState('main', clusterState);
    
    // Get decision
    const decision = this.goNeuralClusters.getClusterDecision('main');
    
    return decision;
  }
  
  /**
   * Convert Ourocode to Lisp s-expressions
   * @private
   * @param {Object} ourocodeModule - Ourocode module
   * @returns {string} Lisp code
   */
  ourocodeToLisp(ourocodeModule) {
    // Simplified conversion - full implementation would traverse Ourocode IR
    // and generate equivalent Lisp code
    
    // For now, generate a simple Lisp function that modifies state
    return `
      (begin
        (define (mutate-rule state)
          (let ((population (car state))
                (energy (cadr state))
                (mutation-rate (caddr state)))
            (if (> population 100)
              (list population energy 0.05)
              (list population energy 0.1))))
        (mutate-rule (list ${this.currentState.population} 
                           ${this.currentState.energy} 
                           ${this.currentState.mutationRate})))
    `;
  }
  
  /**
   * Convert Ourocode to Fortran data arrays
   * @private
   * @param {Object} ourocodeModule - Ourocode module
   * @param {Object} params - Execution parameters
   * @returns {Float64Array} Fortran data
   */
  ourocodeToFortranData(ourocodeModule, params) {
    // Extract numeric data for Fortran computation
    // Fortran is best for numeric integration and differential equations
    
    const data = new Float64Array([
      this.currentState.population,
      this.currentState.energy,
      this.currentState.mutationRate,
      params.light || 0.5,
      params.temperature || 0.5,
      params.acceleration || 0.5
    ]);
    
    return data;
  }
  
  /**
   * Convert Ourocode to Rust data structure
   * @private
   * @param {Object} ourocodeModule - Ourocode module
   * @param {Object} params - Execution parameters
   * @returns {Object} Rust-compatible data
   */
  ourocodeToRustData(ourocodeModule, params) {
    // Prepare data for Rust engine
    // Rust handles the main organism state and evolution logic
    
    return {
      population: this.currentState.population,
      energy: this.currentState.energy,
      mutation_rate: this.currentState.mutationRate,
      entropy: params.entropy || '',
      light: params.light || 0.5,
      temperature: params.temperature || 0.5,
      acceleration: params.acceleration || 0.5
    };
  }
  
  /**
   * Convert Ourocode to Go neural cluster state
   * @private
   * @param {Object} ourocodeModule - Ourocode module
   * @param {Object} params - Execution parameters
   * @returns {Object} Cluster state
   */
  ourocodeToClusterState(ourocodeModule, params) {
    // Extract state for Go neural clusters
    // Clusters make concurrent decisions based on organism state
    
    return {
      population: this.currentState.population,
      energy: this.currentState.energy,
      mutation_rate: this.currentState.mutationRate,
      light: params.light || 0.5,
      temperature: params.temperature || 0.5,
      acceleration: params.acceleration || 0.5
    };
  }
  
  /**
   * Set Rust engine instance
   * @param {Object} rustEngine - Rust WASM engine
   */
  setRustEngine(rustEngine) {
    this.rustEngine = rustEngine;
  }
  
  /**
   * Set Fortran engine instance
   * @param {Object} fortranEngine - Fortran WASM engine
   */
  setFortranEngine(fortranEngine) {
    this.fortranEngine = fortranEngine;
  }
  
  /**
   * Set Lisp interpreter instance
   * @param {Object} lispInterpreter - Lisp interpreter
   */
  setLispInterpreter(lispInterpreter) {
    this.lispInterpreter = lispInterpreter;
  }
  
  /**
   * Get error recovery manager
   * @returns {ErrorRecovery|null}
   */
  getErrorRecovery() {
    return this.errorRecovery;
  }
  
  /**
   * Get recovery status
   * @returns {Object} Recovery status
   */
  getRecoveryStatus() {
    if (this.errorRecovery) {
      return this.errorRecovery.getRecoveryStatus();
    }
    return {
      enabled: false,
      errorCount: 0,
      queuedMutations: 0,
      reconnectionAttempts: {},
      errors: {}
    };
  }
  
  /**
   * Display error states in terminal
   * @param {Object} terminal - Terminal instance
   */
  displayErrorStates(terminal) {
    if (this.errorRecovery) {
      this.errorRecovery.displayErrorStates(terminal);
    } else if (terminal) {
      terminal.writeLine('Error recovery not initialized', 'warning');
    }
  }
}


export default ChimeraOrchestrator;
