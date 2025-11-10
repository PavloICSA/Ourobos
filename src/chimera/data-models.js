/**
 * Chimera Data Models
 * 
 * Extended data structures for OuroborOS-Chimera that include:
 * - Blockchain governance fields
 * - Quantum entropy state
 * - Bio sensor readings
 * - Neural cluster tracking
 * - Ourocode module references
 */

/**
 * ChimeraOrganismState
 * 
 * Extended organism state that includes all chimera-specific fields
 * for blockchain provenance, quantum entropy, bio sensors, and neural clusters.
 * 
 * Requirements: 8.1, 8.2, 8.4, 8.5
 */
export class ChimeraOrganismState {
  constructor() {
    // Core metrics
    this.population = 100;
    this.energy = 50;
    this.generation = 0;
    this.age = 0;
    this.mutationRate = 0.01;
    
    // Blockchain provenance
    this.blockchainGeneration = 0;      // On-chain generation number
    this.lastGenomeHash = null;         // SHA-256 hash of last recorded genome
    this.lastBlockNumber = null;        // Block number of last transaction
    this.lastTransactionId = null;      // Transaction hash of last mutation
    this.pendingProposalId = null;      // Currently active proposal ID
    
    // Quantum entropy state
    this.quantumEntropyUsed = null;     // Last quantum entropy hash used
    this.quantumBackend = 'unknown';    // 'hardware' | 'simulator' | 'mock'
    this.quantumEntropyTimestamp = null; // When entropy was generated
    
    // Bio sensor state
    this.environmentalLight = 0.5;      // Normalized light level (0-1)
    this.environmentalTemp = 0.5;       // Normalized temperature (0-1)
    this.environmentalAccel = 0.5;      // Normalized acceleration (0-1)
    this.sensorTimestamp = null;        // When sensor readings were taken
    this.sensorMode = 'mock';           // 'real' | 'mock'
    
    // Neural cluster state
    this.activeClusterIds = [];         // Array of active Go cluster IDs
    this.clusterDecisions = new Map();  // Map<clusterId, Decision>
    this.lastClusterUpdate = null;      // Timestamp of last cluster state update
    
    // Ourocode state
    this.activeOurocodeModules = [];    // Array of active module names
    this.compiledRules = new Map();     // Map<moduleName, OurocodeModule>
    this.lastCompilationTime = null;    // Timestamp of last compilation
  }
  
  /**
   * Create a snapshot of current state for serialization
   */
  toJSON() {
    return {
      // Core metrics
      population: this.population,
      energy: this.energy,
      generation: this.generation,
      age: this.age,
      mutationRate: this.mutationRate,
      
      // Blockchain
      blockchainGeneration: this.blockchainGeneration,
      lastGenomeHash: this.lastGenomeHash,
      lastBlockNumber: this.lastBlockNumber,
      lastTransactionId: this.lastTransactionId,
      pendingProposalId: this.pendingProposalId,
      
      // Quantum
      quantumEntropyUsed: this.quantumEntropyUsed,
      quantumBackend: this.quantumBackend,
      quantumEntropyTimestamp: this.quantumEntropyTimestamp,
      
      // Bio sensors
      environmentalLight: this.environmentalLight,
      environmentalTemp: this.environmentalTemp,
      environmentalAccel: this.environmentalAccel,
      sensorTimestamp: this.sensorTimestamp,
      sensorMode: this.sensorMode,
      
      // Neural clusters
      activeClusterIds: this.activeClusterIds,
      clusterDecisions: Array.from(this.clusterDecisions.entries()),
      lastClusterUpdate: this.lastClusterUpdate,
      
      // Ourocode
      activeOurocodeModules: this.activeOurocodeModules,
      compiledRules: Array.from(this.compiledRules.entries()),
      lastCompilationTime: this.lastCompilationTime
    };
  }
  
  /**
   * Restore state from JSON snapshot
   */
  static fromJSON(json) {
    const state = new ChimeraOrganismState();
    
    // Core metrics
    state.population = json.population || 100;
    state.energy = json.energy || 50;
    state.generation = json.generation || 0;
    state.age = json.age || 0;
    state.mutationRate = json.mutationRate || 0.01;
    
    // Blockchain
    state.blockchainGeneration = json.blockchainGeneration || 0;
    state.lastGenomeHash = json.lastGenomeHash || null;
    state.lastBlockNumber = json.lastBlockNumber || null;
    state.lastTransactionId = json.lastTransactionId || null;
    state.pendingProposalId = json.pendingProposalId || null;
    
    // Quantum
    state.quantumEntropyUsed = json.quantumEntropyUsed || null;
    state.quantumBackend = json.quantumBackend || 'unknown';
    state.quantumEntropyTimestamp = json.quantumEntropyTimestamp || null;
    
    // Bio sensors
    state.environmentalLight = json.environmentalLight || 0.5;
    state.environmentalTemp = json.environmentalTemp || 0.5;
    state.environmentalAccel = json.environmentalAccel || 0.5;
    state.sensorTimestamp = json.sensorTimestamp || null;
    state.sensorMode = json.sensorMode || 'mock';
    
    // Neural clusters
    state.activeClusterIds = json.activeClusterIds || [];
    state.clusterDecisions = new Map(json.clusterDecisions || []);
    state.lastClusterUpdate = json.lastClusterUpdate || null;
    
    // Ourocode
    state.activeOurocodeModules = json.activeOurocodeModules || [];
    state.compiledRules = new Map(json.compiledRules || []);
    state.lastCompilationTime = json.lastCompilationTime || null;
    
    return state;
  }
  
  /**
   * Update blockchain fields after mutation approval
   */
  updateBlockchainState(genomeHash, blockNumber, transactionId) {
    this.blockchainGeneration++;
    this.lastGenomeHash = genomeHash;
    this.lastBlockNumber = blockNumber;
    this.lastTransactionId = transactionId;
    this.pendingProposalId = null;
  }
  
  /**
   * Update quantum entropy fields after generation
   */
  updateQuantumState(entropyHash, backend) {
    this.quantumEntropyUsed = entropyHash;
    this.quantumBackend = backend;
    this.quantumEntropyTimestamp = Date.now();
  }
  
  /**
   * Update bio sensor fields with new readings
   */
  updateSensorState(readings, mode = 'real') {
    this.environmentalLight = readings.light ?? this.environmentalLight;
    this.environmentalTemp = readings.temperature ?? this.environmentalTemp;
    this.environmentalAccel = readings.acceleration ?? this.environmentalAccel;
    this.sensorTimestamp = readings.timestamp || Date.now();
    this.sensorMode = mode;
  }
  
  /**
   * Update neural cluster state
   */
  updateClusterState(clusterId, decision) {
    if (!this.activeClusterIds.includes(clusterId)) {
      this.activeClusterIds.push(clusterId);
    }
    this.clusterDecisions.set(clusterId, decision);
    this.lastClusterUpdate = Date.now();
  }
  
  /**
   * Add compiled Ourocode module
   */
  addOurocodeModule(moduleName, module) {
    if (!this.activeOurocodeModules.includes(moduleName)) {
      this.activeOurocodeModules.push(moduleName);
    }
    this.compiledRules.set(moduleName, module);
    this.lastCompilationTime = Date.now();
  }
}

/**
 * MutationProposal
 * 
 * Represents a mutation proposal with both on-chain and off-chain data.
 * On-chain: proposal ID, hashes, votes, execution status
 * Off-chain: source code, Ourocode module, metadata
 * 
 * Requirements: 1.1, 1.2, 1.3, 5.2
 */
export class MutationProposal {
  constructor(id, genomeHash, ourocodeHash, proposer) {
    // On-chain proposal fields
    this.id = id;                       // Proposal ID from smart contract
    this.genomeHash = genomeHash;       // SHA-256 hash of genome state
    this.ourocodeHash = ourocodeHash;   // SHA-256 hash of Ourocode module
    this.proposer = proposer;           // Ethereum address of proposer
    this.createdAt = Date.now();        // Timestamp when created
    this.votingEndsAt = null;           // Timestamp when voting ends
    this.votesFor = 0;                  // Number of yes votes
    this.votesAgainst = 0;              // Number of no votes
    this.executed = false;              // Whether proposal has been executed
    this.approved = false;              // Whether proposal was approved
    
    // Off-chain Ourocode module storage
    this.ourocodeModule = null;         // Full OurocodeModule object
    
    // Source code and language metadata
    this.sourceCode = null;             // Original source code
    this.sourceLanguage = null;         // 'algol' | 'lisp' | 'pascal' | 'rust' | 'go' | 'fortran'
    this.compilationTime = null;        // Time taken to compile (ms)
    
    // Metadata
    this.description = null;            // Human-readable description
    this.tags = [];                     // Array of tags for categorization
  }
  
  /**
   * Update voting status from blockchain
   */
  updateVotes(votesFor, votesAgainst) {
    this.votesFor = votesFor;
    this.votesAgainst = votesAgainst;
  }
  
  /**
   * Mark proposal as executed
   */
  markExecuted(approved) {
    this.executed = true;
    this.approved = approved;
  }
  
  /**
   * Set voting period
   */
  setVotingPeriod(durationSeconds) {
    this.votingEndsAt = this.createdAt + (durationSeconds * 1000);
  }
  
  /**
   * Check if voting is still active
   */
  isVotingActive() {
    if (this.executed) return false;
    if (!this.votingEndsAt) return true;
    return Date.now() < this.votingEndsAt;
  }
  
  /**
   * Calculate vote percentage
   */
  getApprovalPercentage() {
    const total = this.votesFor + this.votesAgainst;
    if (total === 0) return 0;
    return (this.votesFor / total) * 100;
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      genomeHash: this.genomeHash,
      ourocodeHash: this.ourocodeHash,
      proposer: this.proposer,
      createdAt: this.createdAt,
      votingEndsAt: this.votingEndsAt,
      votesFor: this.votesFor,
      votesAgainst: this.votesAgainst,
      executed: this.executed,
      approved: this.approved,
      ourocodeModule: this.ourocodeModule,
      sourceCode: this.sourceCode,
      sourceLanguage: this.sourceLanguage,
      compilationTime: this.compilationTime,
      description: this.description,
      tags: this.tags
    };
  }
  
  /**
   * Restore from JSON
   */
  static fromJSON(json) {
    const proposal = new MutationProposal(
      json.id,
      json.genomeHash,
      json.ourocodeHash,
      json.proposer
    );
    
    proposal.createdAt = json.createdAt;
    proposal.votingEndsAt = json.votingEndsAt;
    proposal.votesFor = json.votesFor || 0;
    proposal.votesAgainst = json.votesAgainst || 0;
    proposal.executed = json.executed || false;
    proposal.approved = json.approved || false;
    proposal.ourocodeModule = json.ourocodeModule;
    proposal.sourceCode = json.sourceCode;
    proposal.sourceLanguage = json.sourceLanguage;
    proposal.compilationTime = json.compilationTime;
    proposal.description = json.description;
    proposal.tags = json.tags || [];
    
    return proposal;
  }
}

/**
 * ChimeraGenomeSnapshot
 * 
 * Extended genome snapshot with blockchain proof, quantum provenance,
 * sensor data, and Ourocode modules for complete evolutionary history.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 14.1, 14.2, 14.3, 14.4
 */
export class ChimeraGenomeSnapshot {
  constructor(name = 'Untitled Snapshot') {
    // Base snapshot data
    this.version = '2.0';               // Snapshot format version (v2 for chimera)
    this.timestamp = Date.now();        // When snapshot was created
    this.name = name;                   // Human-readable name
    
    // Organism state
    this.organism = null;               // ChimeraOrganismState instance
    
    // Blockchain proof
    this.blockchainProof = {
      genomeHash: null,                 // SHA-256 hash recorded on-chain
      blockNumber: null,                // Block number of transaction
      transactionId: null,              // Transaction hash
      contractAddress: null,            // Smart contract address
      chainId: null,                    // Chain ID (1337 for local, etc.)
      verified: false                   // Whether proof has been verified
    };
    
    // Quantum provenance
    this.quantumProvenance = {
      entropyHash: null,                // Hash of quantum entropy used
      backend: 'unknown',               // 'hardware' | 'simulator' | 'mock'
      timestamp: null,                  // When entropy was generated
      bitsGenerated: 0                  // Number of quantum bits generated
    };
    
    // Bio sensor snapshot
    this.sensorSnapshot = {
      light: 0.5,                       // Light level at time of snapshot
      temperature: 0.5,                 // Temperature at time of snapshot
      acceleration: 0.5,                // Acceleration at time of snapshot
      timestamp: null,                  // When readings were taken
      mode: 'mock'                      // 'real' | 'mock'
    };
    
    // Ourocode modules
    this.ourocodeModules = [];          // Array of OurocodeModule objects
    
    // Metadata
    this.metadata = {
      generation: 0,                    // Generation number
      totalMutations: 0,                // Total mutations applied
      approvedProposals: 0,             // Number of approved proposals
      rejectedProposals: 0,             // Number of rejected proposals
      createdBy: 'unknown',             // Creator identifier
      notes: ''                         // User notes
    };
  }
  
  /**
   * Set organism state
   */
  setOrganismState(state) {
    this.organism = state;
    
    // Update metadata from state
    this.metadata.generation = state.generation;
    
    // Update blockchain proof from state
    if (state.lastGenomeHash) {
      this.blockchainProof.genomeHash = state.lastGenomeHash;
      this.blockchainProof.blockNumber = state.lastBlockNumber;
      this.blockchainProof.transactionId = state.lastTransactionId;
    }
    
    // Update quantum provenance from state
    if (state.quantumEntropyUsed) {
      this.quantumProvenance.entropyHash = state.quantumEntropyUsed;
      this.quantumProvenance.backend = state.quantumBackend;
      this.quantumProvenance.timestamp = state.quantumEntropyTimestamp;
    }
    
    // Update sensor snapshot from state
    this.sensorSnapshot.light = state.environmentalLight;
    this.sensorSnapshot.temperature = state.environmentalTemp;
    this.sensorSnapshot.acceleration = state.environmentalAccel;
    this.sensorSnapshot.timestamp = state.sensorTimestamp;
    this.sensorSnapshot.mode = state.sensorMode;
    
    // Copy Ourocode modules
    this.ourocodeModules = Array.from(state.compiledRules.values());
  }
  
  /**
   * Set blockchain proof details
   */
  setBlockchainProof(genomeHash, blockNumber, transactionId, contractAddress, chainId) {
    this.blockchainProof.genomeHash = genomeHash;
    this.blockchainProof.blockNumber = blockNumber;
    this.blockchainProof.transactionId = transactionId;
    this.blockchainProof.contractAddress = contractAddress;
    this.blockchainProof.chainId = chainId;
    this.blockchainProof.verified = false; // Will be verified on import
  }
  
  /**
   * Mark blockchain proof as verified
   */
  markProofVerified(verified) {
    this.blockchainProof.verified = verified;
  }
  
  /**
   * Set quantum provenance
   */
  setQuantumProvenance(entropyHash, backend, bitsGenerated = 256) {
    this.quantumProvenance.entropyHash = entropyHash;
    this.quantumProvenance.backend = backend;
    this.quantumProvenance.timestamp = Date.now();
    this.quantumProvenance.bitsGenerated = bitsGenerated;
  }
  
  /**
   * Set sensor snapshot
   */
  setSensorSnapshot(readings, mode = 'real') {
    this.sensorSnapshot.light = readings.light ?? 0.5;
    this.sensorSnapshot.temperature = readings.temperature ?? 0.5;
    this.sensorSnapshot.acceleration = readings.acceleration ?? 0.5;
    this.sensorSnapshot.timestamp = readings.timestamp || Date.now();
    this.sensorSnapshot.mode = mode;
  }
  
  /**
   * Add Ourocode module
   */
  addOurocodeModule(module) {
    this.ourocodeModules.push(module);
  }
  
  /**
   * Update metadata
   */
  updateMetadata(updates) {
    Object.assign(this.metadata, updates);
  }
  
  /**
   * Serialize to JSON for export
   */
  toJSON() {
    return {
      version: this.version,
      timestamp: this.timestamp,
      name: this.name,
      organism: this.organism ? this.organism.toJSON() : null,
      blockchainProof: this.blockchainProof,
      quantumProvenance: this.quantumProvenance,
      sensorSnapshot: this.sensorSnapshot,
      ourocodeModules: this.ourocodeModules,
      metadata: this.metadata
    };
  }
  
  /**
   * Restore from JSON with backward compatibility for v1.0 format
   * 
   * Requirements: 14.1, 14.2, 14.4
   */
  static fromJSON(json) {
    const snapshot = new ChimeraGenomeSnapshot(json.name);
    
    // Detect version
    const version = json.version || '1.0';
    snapshot.version = version;
    snapshot.timestamp = json.timestamp;
    
    // Handle v1.0 format (legacy format)
    if (version === '1.0') {
      console.log('Loading v1.0 snapshot - migrating to v2.0 format');
      
      // Migrate v1.0 organism state to ChimeraOrganismState
      if (json.organism) {
        const v1State = json.organism;
        const chimeraState = new ChimeraOrganismState();
        
        // Copy base fields
        chimeraState.population = v1State.population || 100;
        chimeraState.energy = v1State.energy || 50;
        chimeraState.generation = v1State.generation || 0;
        chimeraState.age = v1State.age || 0;
        chimeraState.mutationRate = v1State.mutationRate || 0.01;
        
        // Initialize chimera fields with defaults
        chimeraState.blockchainGeneration = 0;
        chimeraState.quantumBackend = 'mock';
        chimeraState.sensorMode = 'mock';
        
        snapshot.organism = chimeraState;
      }
      
      // v1.0 doesn't have blockchain proof, quantum provenance, etc.
      // Keep default values initialized in constructor
      
      // Migrate metadata if present
      if (json.metadata) {
        snapshot.metadata = {
          ...snapshot.metadata,
          ...json.metadata
        };
      }
      
      // Mark as migrated
      snapshot.version = '2.0';
      console.log('Migration to v2.0 complete');
      
      return snapshot;
    }
    
    // Handle v2.0 format (Chimera format)
    if (version === '2.0') {
      // Restore organism state
      if (json.organism) {
        snapshot.organism = ChimeraOrganismState.fromJSON(json.organism);
      }
      
      // Restore blockchain proof
      snapshot.blockchainProof = json.blockchainProof || snapshot.blockchainProof;
      
      // Restore quantum provenance
      snapshot.quantumProvenance = json.quantumProvenance || snapshot.quantumProvenance;
      
      // Restore sensor snapshot
      snapshot.sensorSnapshot = json.sensorSnapshot || snapshot.sensorSnapshot;
      
      // Restore Ourocode modules
      snapshot.ourocodeModules = json.ourocodeModules || [];
      
      // Restore metadata
      snapshot.metadata = json.metadata || snapshot.metadata;
      
      return snapshot;
    }
    
    // Unknown version - try to load as v2.0
    console.warn(`Unknown snapshot version: ${version}, attempting to load as v2.0`);
    snapshot.version = '2.0';
    
    if (json.organism) {
      snapshot.organism = ChimeraOrganismState.fromJSON(json.organism);
    }
    
    snapshot.blockchainProof = json.blockchainProof || snapshot.blockchainProof;
    snapshot.quantumProvenance = json.quantumProvenance || snapshot.quantumProvenance;
    snapshot.sensorSnapshot = json.sensorSnapshot || snapshot.sensorSnapshot;
    snapshot.ourocodeModules = json.ourocodeModules || [];
    snapshot.metadata = json.metadata || snapshot.metadata;
    
    return snapshot;
  }
  
  /**
   * Export to .obg file format (JSON string)
   */
  exportToOBG() {
    return JSON.stringify(this.toJSON(), null, 2);
  }
  
  /**
   * Import from .obg file format
   */
  static importFromOBG(obgString) {
    const json = JSON.parse(obgString);
    return ChimeraGenomeSnapshot.fromJSON(json);
  }
  
  /**
   * Check if snapshot has blockchain proof
   */
  hasBlockchainProof() {
    return this.blockchainProof.genomeHash !== null;
  }
  
  /**
   * Check if snapshot has quantum provenance
   */
  hasQuantumProvenance() {
    return this.quantumProvenance.entropyHash !== null;
  }
  
  /**
   * Get summary string for display
   */
  getSummary() {
    const lines = [];
    lines.push(`Snapshot: ${this.name}`);
    lines.push(`Version: ${this.version}`);
    lines.push(`Generation: ${this.metadata.generation}`);
    lines.push(`Mutations: ${this.metadata.totalMutations}`);
    
    if (this.hasBlockchainProof()) {
      lines.push(`Blockchain: Block #${this.blockchainProof.blockNumber}`);
      lines.push(`  Hash: ${this.blockchainProof.genomeHash?.substring(0, 16)}...`);
      lines.push(`  Verified: ${this.blockchainProof.verified ? 'Yes' : 'No'}`);
    }
    
    if (this.hasQuantumProvenance()) {
      lines.push(`Quantum: ${this.quantumProvenance.backend}`);
      lines.push(`  Entropy: ${this.quantumProvenance.entropyHash?.substring(0, 16)}...`);
    }
    
    lines.push(`Sensors: ${this.sensorSnapshot.mode}`);
    lines.push(`Ourocode Modules: ${this.ourocodeModules.length}`);
    
    return lines.join('\n');
  }
}

/**
 * Decision (from Go Neural Clusters)
 * 
 * Represents a decision made by a neural cluster
 */
export class Decision {
  constructor(clusterID, action, confidence, timestamp) {
    this.clusterID = clusterID;         // Cluster identifier
    this.action = action;               // Action string ('grow', 'conserve', 'maintain', etc.)
    this.confidence = confidence;       // Confidence level (0-1)
    this.timestamp = timestamp;         // When decision was made
  }
  
  toJSON() {
    return {
      clusterID: this.clusterID,
      action: this.action,
      confidence: this.confidence,
      timestamp: this.timestamp
    };
  }
  
  static fromJSON(json) {
    return new Decision(
      json.clusterID,
      json.action,
      json.confidence,
      json.timestamp
    );
  }
}

