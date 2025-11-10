/**
 * Service Integration Module
 * 
 * Wires all service clients together and manages their connections:
 * - Blockchain bridge to orchestrator
 * - Quantum client with entropy pool
 * - Bio sensor client with polling
 * - Go neural clusters to state updates
 */

import config from '../config/index.js';

/**
 * Service integration manager
 */
export class ServiceIntegration {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.pollingIntervals = new Map();
    this.connected = false;
  }
  
  /**
   * Connect all service clients
   */
  async connect() {
    if (this.connected) {
      console.warn('Services already connected');
      return;
    }
    
    console.log('Connecting all service clients...');
    
    // Wire blockchain bridge to orchestrator
    await this.connectBlockchainBridge();
    
    // Connect quantum client with entropy pool
    await this.connectQuantumClient();
    
    // Integrate bio sensor client with polling
    await this.connectBioSensorClient();
    
    // Link Go neural clusters to state updates
    await this.connectGoNeuralClusters();
    
    this.connected = true;
    console.log('All service clients connected');
  }
  
  /**
   * Disconnect all service clients
   */
  disconnect() {
    if (!this.connected) {
      return;
    }
    
    console.log('Disconnecting all service clients...');
    
    // Stop all polling intervals
    for (const [name, intervalId] of this.pollingIntervals.entries()) {
      clearInterval(intervalId);
      console.log(`  Stopped polling: ${name}`);
    }
    this.pollingIntervals.clear();
    
    this.connected = false;
    console.log('All service clients disconnected');
  }
  
  /**
   * Wire blockchain bridge to orchestrator
   */
  async connectBlockchainBridge() {
    const bridge = this.orchestrator.blockchainBridge;
    
    if (!bridge) {
      console.log('  ⚠ Blockchain bridge not available');
      return;
    }
    
    try {
      // Ensure connection
      if (typeof bridge.isConnected === 'function' && !bridge.isConnected()) {
        await bridge.connect();
      }
      
      // Set up event forwarding from bridge to orchestrator
      bridge.on('proposalCreated', (event) => {
        this.orchestrator.emit('proposalCreated', event);
      });
      
      bridge.on('voteCast', (event) => {
        this.orchestrator.emit('voteCast', event);
      });
      
      bridge.on('proposalExecuted', (event) => {
        this.orchestrator.emit('proposalExecuted', event);
      });
      
      bridge.on('genomeRecorded', (event) => {
        this.orchestrator.emit('genomeRecorded', event);
        
        // Update orchestrator state
        this.orchestrator.updateState({
          blockchainGeneration: event.generation,
          lastGenomeHash: event.hash
        });
      });
      
      // Set up automatic reconnection on disconnect
      bridge.on('disconnected', async () => {
        console.warn('Blockchain disconnected, attempting reconnection...');
        
        // Try to reconnect after delay
        setTimeout(async () => {
          try {
            await bridge.connect();
            console.log('Blockchain reconnected successfully');
          } catch (error) {
            console.error('Blockchain reconnection failed:', error.message);
          }
        }, config.monitoring.retryDelay);
      });
      
      console.log('  ✓ Blockchain bridge connected');
      
    } catch (error) {
      console.error('  ✗ Failed to connect blockchain bridge:', error.message);
      throw error;
    }
  }
  
  /**
   * Connect quantum client with entropy pool
   */
  async connectQuantumClient() {
    const client = this.orchestrator.quantumClient;
    
    if (!client) {
      console.log('  ⚠ Quantum client not available');
      return;
    }
    
    try {
      // Check health
      const healthy = await client.healthCheck();
      
      if (healthy) {
        console.log('  ✓ Quantum client connected (real quantum backend)');
      } else {
        console.log('  ✓ Quantum client connected (mock mode)');
      }
      
      // Pre-fill entropy pool in background
      this.prefillEntropyPool(client);
      
      // Set up periodic entropy pool refill
      const refillInterval = setInterval(() => {
        this.refillEntropyPool(client);
      }, 30000); // Refill every 30 seconds
      
      this.pollingIntervals.set('quantum-refill', refillInterval);
      
    } catch (error) {
      console.error('  ✗ Failed to connect quantum client:', error.message);
      // Don't throw - quantum is optional
    }
  }
  
  /**
   * Pre-fill entropy pool
   */
  async prefillEntropyPool(client) {
    try {
      console.log('  Pre-filling quantum entropy pool...');
      
      // Request multiple entropy values to fill pool
      const poolSize = config.quantum.poolSize || 10;
      const promises = [];
      
      for (let i = 0; i < poolSize; i++) {
        promises.push(client.getEntropy(config.quantum.defaultBits));
      }
      
      await Promise.all(promises);
      console.log(`  ✓ Entropy pool filled with ${poolSize} values`);
      
    } catch (error) {
      console.warn('  ⚠ Failed to pre-fill entropy pool:', error.message);
    }
  }
  
  /**
   * Refill entropy pool periodically
   */
  async refillEntropyPool(client) {
    try {
      // Check if pool needs refilling
      const poolLevel = client.getPoolLevel ? client.getPoolLevel() : 0;
      const poolSize = config.quantum.poolSize || 10;
      
      if (poolLevel < poolSize / 2) {
        console.log('  Refilling quantum entropy pool...');
        await client.getEntropy(config.quantum.defaultBits);
      }
      
    } catch (error) {
      console.warn('  ⚠ Failed to refill entropy pool:', error.message);
    }
  }
  
  /**
   * Integrate bio sensor client with polling
   */
  async connectBioSensorClient() {
    const client = this.orchestrator.bioSensorClient;
    
    if (!client) {
      console.log('  ⚠ Bio sensor client not available');
      return;
    }
    
    try {
      // Check health
      const healthy = await client.healthCheck();
      
      if (healthy) {
        console.log('  ✓ Bio sensor client connected (real sensors)');
      } else {
        console.log('  ✓ Bio sensor client connected (mock mode)');
      }
      
      // Set up periodic sensor polling
      const pollInterval = config.bioSensor.pollInterval || 1000;
      
      const pollingIntervalId = setInterval(async () => {
        try {
          const readings = await client.getReadings();
          
          // Update orchestrator state with latest readings
          this.orchestrator.updateState({
            sensorReadings: {
              light: readings.light ?? 0.5,
              temperature: readings.temperature ?? 0.5,
              acceleration: readings.acceleration ?? 0.5
            }
          });
          
          // Emit sensor update event
          this.orchestrator.emit('sensorUpdate', readings);
          
        } catch (error) {
          console.warn('  ⚠ Sensor polling failed:', error.message);
        }
      }, pollInterval);
      
      this.pollingIntervals.set('bio-sensor-poll', pollingIntervalId);
      
      console.log(`  ✓ Bio sensor polling started (${pollInterval}ms interval)`);
      
    } catch (error) {
      console.error('  ✗ Failed to connect bio sensor client:', error.message);
      // Don't throw - bio sensors are optional
    }
  }
  
  /**
   * Link Go neural clusters to state updates
   */
  async connectGoNeuralClusters() {
    const clusters = this.orchestrator.goNeuralClusters;
    
    if (!clusters || !this.orchestrator.serviceHealth.goWasm) {
      console.log('  ⚠ Go neural clusters not available');
      return;
    }
    
    try {
      // Listen for state updates and propagate to clusters
      this.orchestrator.on('stateUpdate', (state) => {
        this.updateAllClusters(clusters, state);
      });
      
      // Set up periodic cluster decision polling
      const decisionInterval = setInterval(() => {
        this.pollClusterDecisions(clusters);
      }, 100); // Poll every 100ms
      
      this.pollingIntervals.set('cluster-decisions', decisionInterval);
      
      console.log('  ✓ Go neural clusters connected');
      console.log('  ✓ Cluster decision polling started');
      
    } catch (error) {
      console.error('  ✗ Failed to connect Go neural clusters:', error.message);
      // Don't throw - clusters are optional
    }
  }
  
  /**
   * Update all neural clusters with new state
   */
  updateAllClusters(clusters, state) {
    const clusterIds = this.orchestrator.activeClusterIds || [];
    
    for (const clusterId of clusterIds) {
      try {
        clusters.updateClusterState(clusterId, {
          population: state.population,
          energy: state.energy,
          mutation_rate: state.mutationRate
        });
      } catch (error) {
        console.warn(`  ⚠ Failed to update cluster ${clusterId}:`, error.message);
      }
    }
  }
  
  /**
   * Poll cluster decisions periodically
   */
  pollClusterDecisions(clusters) {
    const clusterIds = this.orchestrator.activeClusterIds || [];
    
    for (const clusterId of clusterIds) {
      try {
        const decision = clusters.getClusterDecision(clusterId);
        
        if (decision) {
          // Emit cluster decision event
          this.orchestrator.emit('clusterDecision', decision);
          
          // Log decision if verbose
          if (config.dev.verbose) {
            console.log(`Cluster ${clusterId} decision: ${decision.action} (${decision.confidence})`);
          }
        }
      } catch (error) {
        // Silently ignore - decisions are optional
      }
    }
  }
  
  /**
   * Check if services are connected
   */
  isConnected() {
    return this.connected;
  }
  
  /**
   * Get connection status for all services
   */
  getConnectionStatus() {
    return {
      connected: this.connected,
      blockchain: this.orchestrator.blockchainBridge?.isConnected() ?? false,
      quantum: this.orchestrator.quantumClient !== null,
      bioSensor: this.orchestrator.bioSensorClient !== null,
      goWasm: this.orchestrator.serviceHealth.goWasm,
      pollingActive: this.pollingIntervals.size > 0
    };
  }
}

export default ServiceIntegration;
