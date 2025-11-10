/**
 * Quantum Entropy Client
 * 
 * JavaScript client for the quantum entropy service with:
 * - Entropy pool for low-latency access
 * - Automatic fallback to classical entropy
 * - Health monitoring
 * - Caching and prefetching
 */

export class QuantumEntropyClient {
  /**
   * Create a quantum entropy client.
   * 
   * @param {string} apiUrl - Base URL of quantum service (default: http://localhost:5000)
   * @param {boolean} useMock - Force mock mode (default: false)
   */
  constructor(apiUrl = 'http://localhost:5000', useMock = false) {
    this.apiUrl = apiUrl;
    this.useMock = useMock;
    this.entropyPool = [];
    this.poolSize = 10;
    this.isRefilling = false;
    this.lastHealthCheck = 0;
    this.healthCheckInterval = 30000; // 30 seconds
    this.isHealthy = !useMock;
    
    // Start prefilling pool if not in mock mode
    if (!this.useMock) {
      this.prefillPool();
    }
  }
  
  /**
   * Get quantum entropy.
   * 
   * @param {number} bits - Number of random bits to generate (default: 256)
   * @returns {Promise<string>} Hex-encoded entropy hash
   */
  async getEntropy(bits = 256) {
    if (this.useMock) {
      return this.getMockEntropy(bits);
    }
    
    // Try to get from pool first for low latency
    if (this.entropyPool.length > 0) {
      const entropy = this.entropyPool.shift();
      
      // Trigger async refill if pool is getting low
      if (this.entropyPool.length < this.poolSize / 2) {
        this.refillPool();
      }
      
      return entropy;
    }
    
    // Pool empty, fetch directly
    return await this.fetchQuantumEntropy(bits);
  }
  
  /**
   * Fetch quantum entropy from the API.
   * 
   * @param {number} bits - Number of random bits
   * @returns {Promise<string>} Entropy hash
   * @private
   */
  async fetchQuantumEntropy(bits) {
    try {
      const response = await fetch(`${this.apiUrl}/api/quantum/entropy?bits=${bits}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.isHealthy = true;
      
      return data.entropy;
    } catch (error) {
      console.warn('Quantum API unavailable, falling back to mock entropy:', error.message);
      this.isHealthy = false;
      this.useMock = true;
      return this.getMockEntropy(bits);
    }
  }
  
  /**
   * Generate mock entropy using WebCrypto.
   * 
   * @param {number} bits - Number of random bits
   * @returns {string} Hex-encoded random hash
   * @private
   */
  getMockEntropy(bits) {
    const bytes = Math.ceil(bits / 8);
    const randomBytes = new Uint8Array(bytes);
    crypto.getRandomValues(randomBytes);
    
    // Convert to hex string
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Prefill the entropy pool on initialization.
   * 
   * @private
   */
  async prefillPool() {
    console.log('Prefilling quantum entropy pool...');
    
    const promises = [];
    for (let i = 0; i < this.poolSize; i++) {
      promises.push(
        this.fetchQuantumEntropy(256)
          .then(entropy => {
            this.entropyPool.push(entropy);
          })
          .catch(error => {
            console.warn(`Failed to prefill entropy ${i + 1}:`, error.message);
          })
      );
    }
    
    await Promise.allSettled(promises);
    console.log(`Entropy pool filled: ${this.entropyPool.length}/${this.poolSize} entries`);
  }
  
  /**
   * Refill the entropy pool asynchronously.
   * 
   * @private
   */
  async refillPool() {
    if (this.isRefilling || this.useMock) {
      return;
    }
    
    this.isRefilling = true;
    
    try {
      // Add entries until pool is full
      while (this.entropyPool.length < this.poolSize) {
        const entropy = await this.fetchQuantumEntropy(256);
        this.entropyPool.push(entropy);
      }
    } catch (error) {
      console.warn('Failed to refill entropy pool:', error.message);
    } finally {
      this.isRefilling = false;
    }
  }
  
  /**
   * Check if the quantum service is healthy.
   * 
   * @returns {Promise<boolean>} True if service is available
   */
  async healthCheck() {
    // Use cached result if recent
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isHealthy;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/api/quantum/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        this.isHealthy = false;
        return false;
      }
      
      const data = await response.json();
      this.isHealthy = data.status === 'ok';
      this.lastHealthCheck = now;
      
      return this.isHealthy;
    } catch (error) {
      console.warn('Health check failed:', error.message);
      this.isHealthy = false;
      this.lastHealthCheck = now;
      return false;
    }
  }
  
  /**
   * Get service information.
   * 
   * @returns {Promise<object>} Service info
   */
  async getInfo() {
    try {
      const response = await fetch(`${this.apiUrl}/api/quantum/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Failed to get service info:', error.message);
      return null;
    }
  }
  
  /**
   * Get the current pool level.
   * 
   * @returns {number} Number of entropy entries in pool
   */
  getPoolLevel() {
    return this.entropyPool.length;
  }
  
  /**
   * Get the pool capacity.
   * 
   * @returns {number} Maximum pool size
   */
  getPoolCapacity() {
    return this.poolSize;
  }
  
  /**
   * Check if client is in mock mode.
   * 
   * @returns {boolean} True if using mock entropy
   */
  isMockMode() {
    return this.useMock;
  }
  
  /**
   * Get client status.
   * 
   * @returns {object} Status information
   */
  getStatus() {
    return {
      healthy: this.isHealthy,
      mockMode: this.useMock,
      poolLevel: this.entropyPool.length,
      poolCapacity: this.poolSize,
      isRefilling: this.isRefilling,
      lastHealthCheck: this.lastHealthCheck
    };
  }
  
  /**
   * Force enable mock mode.
   */
  enableMockMode() {
    this.useMock = true;
    this.isHealthy = false;
    this.entropyPool = [];
    console.log('Mock mode enabled');
  }
  
  /**
   * Try to reconnect to quantum service.
   * 
   * @returns {Promise<boolean>} True if reconnection successful
   */
  async reconnect() {
    console.log('Attempting to reconnect to quantum service...');
    
    const healthy = await this.healthCheck();
    
    if (healthy) {
      this.useMock = false;
      this.entropyPool = [];
      await this.prefillPool();
      console.log('Reconnected to quantum service');
      return true;
    }
    
    console.log('Reconnection failed');
    return false;
  }
}

export default QuantumEntropyClient;
