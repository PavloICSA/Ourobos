/**
 * Go Neural Clusters WASM Bridge
 * JavaScript interface for Go-based neural clusters
 */

import config from '../config/index.js';

/**
 * Decision type returned by neural clusters
 * @typedef {Object} Decision
 * @property {string} clusterId - ID of the cluster that made the decision
 * @property {string} action - Action to take (grow, conserve, reduce, mutate_more, mutate_less, maintain)
 * @property {number} confidence - Confidence level (0-1)
 * @property {number} timestamp - Unix timestamp when decision was made
 */

/**
 * GoNeuralClusters class manages Go WASM neural cluster instances
 */
export class GoNeuralClusters {
  constructor() {
    this.initialized = false;
    this.go = null;
    this.wasmInstance = null;
    this.activeClusters = new Set();
  }

  /**
   * Initialize Go WASM runtime and load neural cluster module
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      console.warn('GoNeuralClusters already initialized');
      return;
    }

    try {
      // Load wasm_exec.js (Go WASM runtime support)
      await this.loadWasmExec();

      // Create Go instance
      this.go = new window.Go();

      // Load WASM module
      const wasmPath = config.wasm.goPath;
      const response = await fetch(wasmPath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Go WASM module: ${response.statusText}`);
      }

      const wasmBytes = await response.arrayBuffer();
      const result = await WebAssembly.instantiate(wasmBytes, this.go.importObject);
      
      this.wasmInstance = result.instance;

      // Run the Go program (this starts the main() function)
      // Note: This is async but we don't await it as it runs indefinitely
      this.go.run(this.wasmInstance);

      // Wait a bit for Go runtime to initialize and register functions
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify that Go functions are available
      this.verifyGoFunctions();

      this.initialized = true;
      console.log('Go neural clusters initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Go neural clusters:', error);
      throw error;
    }
  }

  /**
   * Load wasm_exec.js from Go installation
   * @private
   */
  async loadWasmExec() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.Go) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = '/wasm/go/wasm_exec.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load wasm_exec.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Verify that all required Go functions are available
   * @private
   */
  verifyGoFunctions() {
    const requiredFunctions = [
      'goCreateCluster',
      'goUpdateClusterState',
      'goGetClusterDecision',
      'goStopCluster',
      'goGetClusterState',
      'goListClusters'
    ];

    for (const funcName of requiredFunctions) {
      if (typeof window[funcName] !== 'function') {
        throw new Error(`Required Go function ${funcName} not found`);
      }
    }
  }

  /**
   * Ensure the module is initialized
   * @private
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('GoNeuralClusters not initialized. Call init() first.');
    }
  }

  /**
   * Create a new neural cluster
   * @param {string} id - Unique identifier for the cluster
   * @returns {string} The cluster ID
   */
  createCluster(id) {
    this.ensureInitialized();

    const result = window.goCreateCluster(id);
    
    if (typeof result === 'string' && result.startsWith('error:')) {
      throw new Error(result);
    }

    this.activeClusters.add(id);
    return result;
  }

  /**
   * Update the state of a neural cluster
   * @param {string} id - Cluster ID
   * @param {Object} state - State object with numeric values
   * @param {number} [state.population] - Population value
   * @param {number} [state.energy] - Energy value
   * @param {number} [state.mutation_rate] - Mutation rate value
   * @returns {void}
   */
  updateClusterState(id, state) {
    this.ensureInitialized();

    if (!this.activeClusters.has(id)) {
      throw new Error(`Cluster ${id} not found`);
    }

    const stateJSON = JSON.stringify(state);
    const result = window.goUpdateClusterState(id, stateJSON);

    if (typeof result === 'string' && result.startsWith('error:')) {
      throw new Error(result);
    }
  }

  /**
   * Get the next decision from a cluster's decision queue
   * @param {string} id - Cluster ID
   * @returns {Decision|null} Decision object or null if no decision available
   */
  getClusterDecision(id) {
    this.ensureInitialized();

    if (!this.activeClusters.has(id)) {
      throw new Error(`Cluster ${id} not found`);
    }

    const result = window.goGetClusterDecision(id);

    if (result === null || result === undefined) {
      return null;
    }

    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to parse decision JSON:', error);
      return null;
    }
  }

  /**
   * Get the current state of a cluster
   * @param {string} id - Cluster ID
   * @returns {Object|null} State object or null if cluster not found
   */
  getClusterState(id) {
    this.ensureInitialized();

    if (!this.activeClusters.has(id)) {
      throw new Error(`Cluster ${id} not found`);
    }

    const result = window.goGetClusterState(id);

    if (result === null || result === undefined) {
      return null;
    }

    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to parse state JSON:', error);
      return null;
    }
  }

  /**
   * Stop a neural cluster and clean up resources
   * @param {string} id - Cluster ID
   * @returns {void}
   */
  stopCluster(id) {
    this.ensureInitialized();

    if (!this.activeClusters.has(id)) {
      throw new Error(`Cluster ${id} not found`);
    }

    const result = window.goStopCluster(id);

    if (typeof result === 'string' && result.startsWith('error:')) {
      throw new Error(result);
    }

    this.activeClusters.delete(id);
  }

  /**
   * List all active cluster IDs
   * @returns {string[]} Array of cluster IDs
   */
  listClusters() {
    this.ensureInitialized();

    const result = window.goListClusters();
    return Array.isArray(result) ? result : [];
  }

  /**
   * Stop all active clusters
   * @returns {void}
   */
  stopAllClusters() {
    this.ensureInitialized();

    const clusterIds = Array.from(this.activeClusters);
    for (const id of clusterIds) {
      try {
        this.stopCluster(id);
      } catch (error) {
        console.error(`Failed to stop cluster ${id}:`, error);
      }
    }
  }

  /**
   * Check if the module is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get the number of active clusters
   * @returns {number}
   */
  getActiveClusterCount() {
    return this.activeClusters.size;
  }
}

export default GoNeuralClusters;
