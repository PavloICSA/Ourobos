/**
 * Lazy Loading Configuration for Optional Services
 * 
 * This module provides dynamic imports for optional chimera services
 * to reduce initial bundle size and improve load times.
 */

/**
 * Lazy load blockchain components
 * @returns {Promise<Object>} Blockchain bridge module
 */
export async function loadBlockchainBridge() {
  const module = await import('../blockchain/blockchain-bridge.js');
  return module.BlockchainBridge;
}

/**
 * Lazy load quantum entropy client
 * @returns {Promise<Object>} Quantum client module
 */
export async function loadQuantumClient() {
  const module = await import('../quantum/quantum-client.js');
  return module.QuantumEntropyClient;
}

/**
 * Lazy load bio sensor client
 * @returns {Promise<Object>} Bio sensor client module
 */
export async function loadBioSensorClient() {
  const module = await import('../biosensor/biosensor-client.js');
  return module.BioSensorClient;
}

/**
 * Lazy load meta-compiler
 * @returns {Promise<Object>} Meta-compiler module
 */
export async function loadMetaCompiler() {
  const module = await import('../metacompiler/meta-compiler.js');
  return module.MetaCompiler;
}

/**
 * Lazy load Go neural clusters
 * @returns {Promise<Object>} Go neural clusters module
 */
export async function loadGoNeuralClusters() {
  const module = await import('../go-bridge/go-neural-clusters.js');
  return module.GoNeuralClusters;
}

/**
 * Lazy load visualization engine
 * @returns {Promise<Object>} Visualization module
 */
export async function loadVisualization() {
  const module = await import('../visualization/visualizer.js');
  return module.Visualizer;
}

/**
 * Lazy load D3 library (large dependency)
 * @returns {Promise<Object>} D3 library
 */
export async function loadD3() {
  return await import('d3');
}

/**
 * Lazy load ethers library (large dependency)
 * @returns {Promise<Object>} Ethers library
 */
export async function loadEthers() {
  return await import('ethers');
}

/**
 * Service loader with caching
 */
class ServiceLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }

  /**
   * Load a service with caching to prevent duplicate loads
   * @param {string} serviceName - Name of the service
   * @param {Function} loader - Async loader function
   * @returns {Promise<any>} Loaded service
   */
  async load(serviceName, loader) {
    // Return cached instance if available
    if (this.cache.has(serviceName)) {
      return this.cache.get(serviceName);
    }

    // Wait for in-progress load
    if (this.loading.has(serviceName)) {
      return await this.loading.get(serviceName);
    }

    // Start new load
    const loadPromise = loader().then(service => {
      this.cache.set(serviceName, service);
      this.loading.delete(serviceName);
      return service;
    }).catch(error => {
      this.loading.delete(serviceName);
      throw error;
    });

    this.loading.set(serviceName, loadPromise);
    return await loadPromise;
  }

  /**
   * Preload services in the background
   * @param {Array<string>} services - List of service names to preload
   */
  async preload(services) {
    const loaders = {
      'blockchain': loadBlockchainBridge,
      'quantum': loadQuantumClient,
      'biosensor': loadBioSensorClient,
      'metacompiler': loadMetaCompiler,
      'neural': loadGoNeuralClusters,
      'visualization': loadVisualization,
      'd3': loadD3,
      'ethers': loadEthers
    };

    const promises = services
      .filter(name => loaders[name])
      .map(name => this.load(name, loaders[name]).catch(err => {
        console.warn(`Failed to preload ${name}:`, err);
      }));

    await Promise.allSettled(promises);
  }

  /**
   * Clear cache for a service
   * @param {string} serviceName - Name of the service
   */
  clearCache(serviceName) {
    this.cache.delete(serviceName);
  }

  /**
   * Clear all cached services
   */
  clearAllCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const serviceLoader = new ServiceLoader();

/**
 * Preload critical services based on configuration
 * @param {Object} config - Configuration object
 */
export async function preloadCriticalServices(config) {
  const criticalServices = [];

  // Always preload visualization
  criticalServices.push('visualization', 'd3');

  // Preload enabled services
  if (config.services?.enableBlockchain) {
    criticalServices.push('blockchain', 'ethers');
  }

  if (config.services?.enableQuantum) {
    criticalServices.push('quantum');
  }

  if (config.services?.enableBioSensor) {
    criticalServices.push('biosensor');
  }

  // Preload in background
  serviceLoader.preload(criticalServices).catch(err => {
    console.warn('Service preload failed:', err);
  });
}
