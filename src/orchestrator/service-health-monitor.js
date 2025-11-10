/**
 * Service Health Monitor
 * 
 * Monitors health of all external services and manages automatic fallback activation.
 * Provides unified health status for UI display.
 */

export class ServiceHealthMonitor {
  constructor(services = {}) {
    // Service instances
    this.blockchainBridge = services.blockchainBridge || null;
    this.quantumClient = services.quantumClient || null;
    this.bioSensorClient = services.bioSensorClient || null;
    this.goNeuralClusters = services.goNeuralClusters || null;
    
    // Health status for each service
    this.services = {
      blockchain: {
        healthy: false,
        lastCheck: 0,
        lastError: null,
        checkCount: 0,
        failureCount: 0
      },
      quantum: {
        healthy: false,
        lastCheck: 0,
        lastError: null,
        checkCount: 0,
        failureCount: 0
      },
      bioSensor: {
        healthy: false,
        lastCheck: 0,
        lastError: null,
        checkCount: 0,
        failureCount: 0
      },
      goWasm: {
        healthy: false,
        lastCheck: 0,
        lastError: null,
        checkCount: 0,
        failureCount: 0
      }
    };
    
    // Configuration
    this.checkInterval = 30000; // 30 seconds
    this.timeout = 5000; // 5 seconds per check
    this.autoFallback = true;
    
    // Monitoring state
    this.isMonitoring = false;
    this.monitoringInterval = null;
    
    // Event listeners
    this.listeners = {
      healthChanged: [],
      serviceDown: [],
      serviceUp: []
    };
  }
  
  /**
   * Set service instances
   * @param {Object} services - Service instances
   */
  setServices(services) {
    if (services.blockchainBridge) {
      this.blockchainBridge = services.blockchainBridge;
    }
    if (services.quantumClient) {
      this.quantumClient = services.quantumClient;
    }
    if (services.bioSensorClient) {
      this.bioSensorClient = services.bioSensorClient;
    }
    if (services.goNeuralClusters) {
      this.goNeuralClusters = services.goNeuralClusters;
    }
  }
  
  /**
   * Start monitoring all services
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn('Health monitoring already started');
      return;
    }
    
    console.log('Starting service health monitoring...');
    this.isMonitoring = true;
    
    // Initial health check
    this.checkHealth();
    
    // Set up periodic checks
    this.monitoringInterval = setInterval(() => {
      this.checkHealth();
    }, this.checkInterval);
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }
    
    console.log('Stopping service health monitoring...');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  /**
   * Check health of all services
   * @returns {Promise<Object>} Health status for all services
   */
  async checkHealth() {
    console.log('Checking service health...');
    
    const checks = [
      this.checkBlockchain(),
      this.checkQuantum(),
      this.checkBioSensor(),
      this.checkGoWasm()
    ];
    
    await Promise.allSettled(checks);
    
    // Emit health changed event
    this.emit('healthChanged', this.getServiceStatus());
    
    return this.getServiceStatus();
  }
  
  /**
   * Check blockchain service health
   * @private
   */
  async checkBlockchain() {
    const serviceName = 'blockchain';
    const service = this.services[serviceName];
    
    service.checkCount++;
    service.lastCheck = Date.now();
    
    if (!this.blockchainBridge) {
      this.updateServiceHealth(serviceName, false, 'Service not initialized');
      return;
    }
    
    try {
      const healthy = await this.withTimeout(
        this.blockchainBridge.healthCheck(),
        this.timeout
      );
      
      this.updateServiceHealth(serviceName, healthy, null);
      
    } catch (error) {
      this.updateServiceHealth(serviceName, false, error.message);
    }
  }
  
  /**
   * Check quantum service health
   * @private
   */
  async checkQuantum() {
    const serviceName = 'quantum';
    const service = this.services[serviceName];
    
    service.checkCount++;
    service.lastCheck = Date.now();
    
    if (!this.quantumClient) {
      this.updateServiceHealth(serviceName, false, 'Service not initialized');
      return;
    }
    
    try {
      const healthy = await this.withTimeout(
        this.quantumClient.healthCheck(),
        this.timeout
      );
      
      this.updateServiceHealth(serviceName, healthy, null);
      
      // Activate fallback if needed
      if (!healthy && this.autoFallback) {
        console.log('Activating quantum fallback (mock mode)');
        this.quantumClient.enableMockMode();
      }
      
    } catch (error) {
      this.updateServiceHealth(serviceName, false, error.message);
      
      if (this.autoFallback) {
        this.quantumClient.enableMockMode();
      }
    }
  }
  
  /**
   * Check bio sensor service health
   * @private
   */
  async checkBioSensor() {
    const serviceName = 'bioSensor';
    const service = this.services[serviceName];
    
    service.checkCount++;
    service.lastCheck = Date.now();
    
    if (!this.bioSensorClient) {
      this.updateServiceHealth(serviceName, false, 'Service not initialized');
      return;
    }
    
    try {
      const healthy = await this.withTimeout(
        this.bioSensorClient.healthCheck(),
        this.timeout
      );
      
      this.updateServiceHealth(serviceName, healthy, null);
      
      // Activate fallback if needed
      if (!healthy && this.autoFallback) {
        console.log('Activating bio sensor fallback (mock mode)');
        this.bioSensorClient.enableMockMode();
      }
      
    } catch (error) {
      this.updateServiceHealth(serviceName, false, error.message);
      
      if (this.autoFallback) {
        this.bioSensorClient.enableMockMode();
      }
    }
  }
  
  /**
   * Check Go WASM service health
   * @private
   */
  async checkGoWasm() {
    const serviceName = 'goWasm';
    const service = this.services[serviceName];
    
    service.checkCount++;
    service.lastCheck = Date.now();
    
    if (!this.goNeuralClusters) {
      this.updateServiceHealth(serviceName, false, 'Service not initialized');
      return;
    }
    
    try {
      const healthy = this.goNeuralClusters.isInitialized();
      this.updateServiceHealth(serviceName, healthy, null);
      
    } catch (error) {
      this.updateServiceHealth(serviceName, false, error.message);
    }
  }
  
  /**
   * Update service health status
   * @private
   */
  updateServiceHealth(serviceName, healthy, error) {
    const service = this.services[serviceName];
    const wasHealthy = service.healthy;
    
    service.healthy = healthy;
    service.lastError = error;
    
    if (!healthy) {
      service.failureCount++;
    }
    
    // Emit events for status changes
    if (wasHealthy && !healthy) {
      console.warn(`Service ${serviceName} is now DOWN`);
      this.emit('serviceDown', { service: serviceName, error });
    } else if (!wasHealthy && healthy) {
      console.log(`Service ${serviceName} is now UP`);
      this.emit('serviceUp', { service: serviceName });
    }
  }
  
  /**
   * Get service status for UI display
   * @returns {Object} Service status
   */
  getServiceStatus() {
    return {
      blockchain: {
        healthy: this.services.blockchain.healthy,
        status: this.services.blockchain.healthy ? 'online' : 'offline',
        lastCheck: this.services.blockchain.lastCheck,
        lastError: this.services.blockchain.lastError,
        checkCount: this.services.blockchain.checkCount,
        failureCount: this.services.blockchain.failureCount
      },
      quantum: {
        healthy: this.services.quantum.healthy,
        status: this.services.quantum.healthy ? 'online' : 'mock',
        lastCheck: this.services.quantum.lastCheck,
        lastError: this.services.quantum.lastError,
        checkCount: this.services.quantum.checkCount,
        failureCount: this.services.quantum.failureCount,
        mockMode: this.quantumClient ? this.quantumClient.isMockMode() : true
      },
      bioSensor: {
        healthy: this.services.bioSensor.healthy,
        status: this.services.bioSensor.healthy ? 'online' : 'mock',
        lastCheck: this.services.bioSensor.lastCheck,
        lastError: this.services.bioSensor.lastError,
        checkCount: this.services.bioSensor.checkCount,
        failureCount: this.services.bioSensor.failureCount,
        mockMode: this.bioSensorClient ? this.bioSensorClient.isMockMode() : true
      },
      goWasm: {
        healthy: this.services.goWasm.healthy,
        status: this.services.goWasm.healthy ? 'online' : 'offline',
        lastCheck: this.services.goWasm.lastCheck,
        lastError: this.services.goWasm.lastError,
        checkCount: this.services.goWasm.checkCount,
        failureCount: this.services.goWasm.failureCount
      },
      overall: this.getOverallHealth()
    };
  }
  
  /**
   * Get overall system health
   * @returns {string} 'healthy', 'degraded', or 'critical'
   */
  getOverallHealth() {
    const healthyCount = Object.values(this.services)
      .filter(s => s.healthy).length;
    const totalCount = Object.keys(this.services).length;
    
    if (healthyCount === totalCount) {
      return 'healthy';
    } else if (healthyCount >= totalCount / 2) {
      return 'degraded';
    } else {
      return 'critical';
    }
  }
  
  /**
   * Check if a specific service is healthy
   * @param {string} serviceName - Service name
   * @returns {boolean}
   */
  isServiceHealthy(serviceName) {
    return this.services[serviceName]?.healthy || false;
  }
  
  /**
   * Get detailed service info
   * @param {string} serviceName - Service name
   * @returns {Object|null}
   */
  getServiceInfo(serviceName) {
    return this.services[serviceName] || null;
  }
  
  /**
   * Enable/disable automatic fallback
   * @param {boolean} enabled - Enable automatic fallback
   */
  setAutoFallback(enabled) {
    this.autoFallback = enabled;
    console.log(`Automatic fallback ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Set check interval
   * @param {number} interval - Interval in milliseconds
   */
  setCheckInterval(interval) {
    this.checkInterval = interval;
    
    // Restart monitoring if active
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
  
  /**
   * Execute a function with timeout
   * @private
   */
  async withTimeout(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), timeout)
      )
    ]);
  }
  
  /**
   * Register event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   */
  on(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].push(callback);
    }
  }
  
  /**
   * Remove event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   */
  off(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType]
        .filter(cb => cb !== callback);
    }
  }
  
  /**
   * Emit event
   * @private
   */
  emit(eventType, data) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in health monitor listener for ${eventType}:`, error);
        }
      });
    }
  }
  
  /**
   * Get monitoring statistics
   * @returns {Object}
   */
  getStats() {
    return {
      isMonitoring: this.isMonitoring,
      checkInterval: this.checkInterval,
      autoFallback: this.autoFallback,
      services: Object.keys(this.services).map(name => ({
        name,
        healthy: this.services[name].healthy,
        checkCount: this.services[name].checkCount,
        failureCount: this.services[name].failureCount,
        lastCheck: this.services[name].lastCheck
      }))
    };
  }
  
  /**
   * Reset all statistics
   */
  resetStats() {
    for (const service of Object.values(this.services)) {
      service.checkCount = 0;
      service.failureCount = 0;
      service.lastError = null;
    }
  }
}

export default ServiceHealthMonitor;
