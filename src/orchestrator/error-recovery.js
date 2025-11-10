/**
 * Error Recovery Module
 * 
 * Implements error recovery mechanisms:
 * - Automatic service reconnection
 * - Mutation queue for offline blockchain
 * - Fallback chains for all services
 * - Error state display in terminal
 */

import config from '../config/index.js';

/**
 * Error recovery manager
 */
export class ErrorRecovery {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    
    // Mutation queue for offline blockchain
    this.mutationQueue = [];
    
    // Reconnection state
    this.reconnectionAttempts = new Map();
    this.reconnectionTimers = new Map();
    
    // Error states
    this.errorStates = new Map();
    
    // Recovery enabled flag
    this.enabled = true;
  }
  
  /**
   * Enable error recovery
   */
  enable() {
    this.enabled = true;
    console.log('Error recovery enabled');
  }
  
  /**
   * Disable error recovery
   */
  disable() {
    this.enabled = false;
    
    // Clear all reconnection timers
    for (const [service, timer] of this.reconnectionTimers.entries()) {
      clearTimeout(timer);
    }
    this.reconnectionTimers.clear();
    
    console.log('Error recovery disabled');
  }
  
  /**
   * Check if error recovery is enabled
   */
  isEnabled() {
    return this.enabled;
  }
  
  // ============================================================================
  // AUTOMATIC SERVICE RECONNECTION
  // ============================================================================
  
  /**
   * Attempt to reconnect a service
   * @param {string} service - Service name (blockchain, quantum, bioSensor)
   * @returns {Promise<boolean>} Success status
   */
  async reconnectService(service) {
    if (!this.enabled) {
      return false;
    }
    
    const attempts = this.reconnectionAttempts.get(service) || 0;
    const maxAttempts = config.monitoring.retryAttempts;
    
    if (attempts >= maxAttempts) {
      console.error(`Max reconnection attempts reached for ${service}`);
      this.setErrorState(service, 'max_attempts_reached');
      return false;
    }
    
    console.log(`Attempting to reconnect ${service} (attempt ${attempts + 1}/${maxAttempts})...`);
    
    try {
      let success = false;
      
      switch (service) {
        case 'blockchain':
          success = await this.reconnectBlockchain();
          break;
        case 'quantum':
          success = await this.reconnectQuantum();
          break;
        case 'bioSensor':
          success = await this.reconnectBioSensor();
          break;
        default:
          console.warn(`Unknown service: ${service}`);
          return false;
      }
      
      if (success) {
        console.log(`✓ ${service} reconnected successfully`);
        this.reconnectionAttempts.delete(service);
        this.clearErrorState(service);
        
        // Process queued mutations if blockchain reconnected
        if (service === 'blockchain') {
          await this.processQueuedMutations();
        }
        
        return true;
      } else {
        // Schedule next reconnection attempt
        this.reconnectionAttempts.set(service, attempts + 1);
        this.scheduleReconnection(service);
        return false;
      }
      
    } catch (error) {
      console.error(`Failed to reconnect ${service}:`, error.message);
      this.reconnectionAttempts.set(service, attempts + 1);
      this.setErrorState(service, error.message);
      this.scheduleReconnection(service);
      return false;
    }
  }
  
  /**
   * Schedule next reconnection attempt
   * @private
   */
  scheduleReconnection(service) {
    const attempts = this.reconnectionAttempts.get(service) || 0;
    const delay = config.monitoring.retryDelay * Math.pow(2, attempts); // Exponential backoff
    
    console.log(`Scheduling ${service} reconnection in ${delay}ms...`);
    
    const timer = setTimeout(() => {
      this.reconnectService(service);
    }, delay);
    
    this.reconnectionTimers.set(service, timer);
  }
  
  /**
   * Reconnect blockchain service
   * @private
   */
  async reconnectBlockchain() {
    const bridge = this.orchestrator.blockchainBridge;
    
    if (!bridge) {
      return false;
    }
    
    try {
      await bridge.connect();
      this.orchestrator.serviceHealth.blockchain = true;
      return true;
    } catch (error) {
      this.orchestrator.serviceHealth.blockchain = false;
      return false;
    }
  }
  
  /**
   * Reconnect quantum service
   * @private
   */
  async reconnectQuantum() {
    const client = this.orchestrator.quantumClient;
    
    if (!client) {
      return false;
    }
    
    try {
      const healthy = await client.healthCheck();
      this.orchestrator.serviceHealth.quantum = healthy;
      
      if (healthy) {
        // Switch from mock to real mode
        client.useMock = false;
      }
      
      return healthy;
    } catch (error) {
      this.orchestrator.serviceHealth.quantum = false;
      return false;
    }
  }
  
  /**
   * Reconnect bio sensor service
   * @private
   */
  async reconnectBioSensor() {
    const client = this.orchestrator.bioSensorClient;
    
    if (!client) {
      return false;
    }
    
    try {
      const healthy = await client.healthCheck();
      this.orchestrator.serviceHealth.bioSensor = healthy;
      
      if (healthy) {
        // Switch from mock to real mode
        client.useMock = false;
      }
      
      return healthy;
    } catch (error) {
      this.orchestrator.serviceHealth.bioSensor = false;
      return false;
    }
  }
  
  // ============================================================================
  // MUTATION QUEUE FOR OFFLINE BLOCKCHAIN
  // ============================================================================
  
  /**
   * Queue a mutation for later submission
   * @param {Object} mutation - Mutation data
   */
  queueMutation(mutation) {
    this.mutationQueue.push({
      ...mutation,
      queuedAt: Date.now()
    });
    
    console.log(`Mutation queued (${this.mutationQueue.length} in queue)`);
  }
  
  /**
   * Process queued mutations
   * @returns {Promise<number>} Number of mutations processed
   */
  async processQueuedMutations() {
    if (this.mutationQueue.length === 0) {
      return 0;
    }
    
    console.log(`Processing ${this.mutationQueue.length} queued mutations...`);
    
    let processed = 0;
    const failed = [];
    
    while (this.mutationQueue.length > 0) {
      const mutation = this.mutationQueue.shift();
      
      try {
        // Re-submit mutation
        await this.orchestrator.proposeMutation(mutation.code, mutation.language);
        processed++;
        console.log(`  ✓ Processed queued mutation ${processed}`);
      } catch (error) {
        console.error(`  ✗ Failed to process queued mutation:`, error.message);
        failed.push(mutation);
      }
    }
    
    // Re-queue failed mutations
    this.mutationQueue.push(...failed);
    
    console.log(`Processed ${processed} mutations, ${failed.length} failed`);
    
    return processed;
  }
  
  /**
   * Get queued mutation count
   */
  getQueuedMutationCount() {
    return this.mutationQueue.length;
  }
  
  /**
   * Clear mutation queue
   */
  clearMutationQueue() {
    const count = this.mutationQueue.length;
    this.mutationQueue = [];
    console.log(`Cleared ${count} queued mutations`);
  }
  
  // ============================================================================
  // FALLBACK CHAINS
  // ============================================================================
  
  /**
   * Execute with fallback chain
   * @param {Array<Function>} fallbackChain - Array of functions to try
   * @param {string} operationName - Operation name for logging
   * @returns {Promise<any>} Result from first successful function
   */
  async executeWithFallback(fallbackChain, operationName = 'operation') {
    const errors = [];
    
    for (let i = 0; i < fallbackChain.length; i++) {
      const fn = fallbackChain[i];
      const isLast = i === fallbackChain.length - 1;
      
      try {
        const result = await fn();
        
        if (i > 0) {
          console.log(`✓ ${operationName} succeeded with fallback ${i}`);
        }
        
        return result;
      } catch (error) {
        errors.push(error);
        
        if (!isLast) {
          console.warn(`${operationName} failed, trying fallback ${i + 1}:`, error.message);
        }
      }
    }
    
    // All fallbacks failed
    const errorMsg = `All fallbacks failed for ${operationName}`;
    console.error(errorMsg, errors);
    throw new Error(errorMsg);
  }
  
  /**
   * Get entropy with fallback chain
   * @returns {Promise<string>} Entropy value
   */
  async getEntropyWithFallback() {
    const fallbackChain = [
      // Primary: Real quantum service
      async () => {
        if (this.orchestrator.quantumClient && this.orchestrator.serviceHealth.quantum) {
          return await this.orchestrator.quantumClient.getEntropy(256);
        }
        throw new Error('Quantum service not available');
      },
      
      // Fallback 1: Mock quantum (classical)
      async () => {
        console.log('Using classical entropy fallback');
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    ];
    
    return await this.executeWithFallback(fallbackChain, 'entropy generation');
  }
  
  /**
   * Get sensor readings with fallback chain
   * @returns {Promise<Object>} Sensor readings
   */
  async getSensorReadingsWithFallback() {
    const fallbackChain = [
      // Primary: Real bio sensors
      async () => {
        if (this.orchestrator.bioSensorClient && this.orchestrator.serviceHealth.bioSensor) {
          return await this.orchestrator.bioSensorClient.getReadings();
        }
        throw new Error('Bio sensor service not available');
      },
      
      // Fallback 1: Mock sensors with smooth curves
      async () => {
        console.log('Using simulated sensor readings');
        const time = Date.now() / 1000;
        return {
          light: 0.5 + 0.3 * Math.sin(time / 10),
          temperature: 0.6 + 0.2 * Math.cos(time / 15),
          acceleration: 0.3 + 0.1 * Math.sin(time / 5),
          timestamp: time
        };
      },
      
      // Fallback 2: Static defaults
      async () => {
        console.log('Using default sensor readings');
        return {
          light: 0.5,
          temperature: 0.5,
          acceleration: 0.5,
          timestamp: Date.now() / 1000
        };
      }
    ];
    
    return await this.executeWithFallback(fallbackChain, 'sensor reading');
  }
  
  /**
   * Submit proposal with fallback chain
   * @param {string} genomeHash - Genome hash
   * @param {string} ourocodeHash - Ourocode hash
   * @returns {Promise<number>} Proposal ID
   */
  async submitProposalWithFallback(genomeHash, ourocodeHash) {
    const fallbackChain = [
      // Primary: Real blockchain
      async () => {
        if (this.orchestrator.blockchainBridge && this.orchestrator.serviceHealth.blockchain) {
          return await this.orchestrator.blockchainBridge.proposeMutation(genomeHash, ourocodeHash);
        }
        throw new Error('Blockchain not available');
      },
      
      // Fallback: Mock proposal ID and queue for later
      async () => {
        console.log('Blockchain offline, using mock proposal ID and queuing');
        const mockProposalId = Date.now() % 10000;
        
        // Queue for later submission
        this.queueMutation({
          genomeHash,
          ourocodeHash,
          mockProposalId
        });
        
        return mockProposalId;
      }
    ];
    
    return await this.executeWithFallback(fallbackChain, 'proposal submission');
  }
  
  // ============================================================================
  // ERROR STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Set error state for a service
   * @param {string} service - Service name
   * @param {string} error - Error message
   */
  setErrorState(service, error) {
    this.errorStates.set(service, {
      error,
      timestamp: Date.now()
    });
  }
  
  /**
   * Clear error state for a service
   * @param {string} service - Service name
   */
  clearErrorState(service) {
    this.errorStates.delete(service);
  }
  
  /**
   * Get error state for a service
   * @param {string} service - Service name
   * @returns {Object|null} Error state or null
   */
  getErrorState(service) {
    return this.errorStates.get(service) || null;
  }
  
  /**
   * Get all error states
   * @returns {Object} All error states
   */
  getAllErrorStates() {
    const states = {};
    for (const [service, state] of this.errorStates.entries()) {
      states[service] = state;
    }
    return states;
  }
  
  /**
   * Display error states in terminal
   * @param {Object} terminal - Terminal instance
   */
  displayErrorStates(terminal) {
    if (!terminal) {
      return;
    }
    
    const errorCount = this.errorStates.size;
    
    if (errorCount === 0) {
      terminal.writeLine('No service errors', 'success');
      return;
    }
    
    terminal.writeLine(`Service Errors (${errorCount}):`, 'error');
    
    for (const [service, state] of this.errorStates.entries()) {
      const elapsed = Math.floor((Date.now() - state.timestamp) / 1000);
      terminal.writeLine(`  ${service}: ${state.error} (${elapsed}s ago)`, 'error');
    }
    
    // Display queued mutations
    if (this.mutationQueue.length > 0) {
      terminal.writeLine('', 'warning');
      terminal.writeLine(`${this.mutationQueue.length} mutations queued for blockchain`, 'warning');
    }
  }
  
  /**
   * Get recovery status summary
   * @returns {Object} Recovery status
   */
  getRecoveryStatus() {
    return {
      enabled: this.enabled,
      errorCount: this.errorStates.size,
      queuedMutations: this.mutationQueue.length,
      reconnectionAttempts: Object.fromEntries(this.reconnectionAttempts),
      errors: this.getAllErrorStates()
    };
  }
}

export default ErrorRecovery;
