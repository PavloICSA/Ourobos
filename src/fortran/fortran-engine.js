/**
 * FortranEngine - JavaScript wrapper for Fortran WASM numeric engine
 * 
 * Provides high-performance mathematical computations:
 * - integrate: Differential equation integration (Euler method)
 * - logisticGrowth: Population growth with carrying capacity
 * - mutationProb: Energy-based mutation probability
 * 
 * Handles memory management, type conversion, and error cases.
 * Falls back to JavaScript implementations if WASM fails.
 */

export class FortranEngine {
  constructor(module) {
    this.module = module;
    this.isReady = false;
    this.useFallback = false;
    
    if (module) {
      this.isReady = true;
      // Wrap Fortran functions (note: f2c adds trailing underscore)
      this._integrate = module.cwrap('integrate_', null, ['number', 'number', 'number', 'number']);
      this._logistic_growth = module.cwrap('logistic_growth_', 'number', ['number', 'number', 'number']);
      this._mutation_prob = module.cwrap('mutation_prob_', 'number', ['number', 'number', 'number']);
    }
  }

  /**
   * Load the Fortran WASM module
   * @param {string} wasmPath - Path to fortran_engine.js
   * @returns {Promise<FortranEngine>}
   */
  static async load(wasmPath = '/wasm/fortran_engine.js') {
    try {
      // Dynamically import the Emscripten-generated module
      const FortranModule = await import(/* @vite-ignore */ wasmPath);
      const module = await FortranModule.default();
      
      console.log('Fortran WASM module loaded successfully');
      return new FortranEngine(module);
    } catch (error) {
      console.warn('Failed to load Fortran WASM, using JavaScript fallback:', error);
      const engine = new FortranEngine(null);
      engine.useFallback = true;
      return engine;
    }
  }

  /**
   * Integrate differential equations using Euler method
   * Formula: result[i] = state[i] + dt * (0.1 * state[i])
   * 
   * @param {Float64Array|number[]} stateArray - Input state vector
   * @param {number} dt - Time step
   * @returns {Float64Array} Integrated state
   */
  integrate(stateArray, dt) {
    if (this.useFallback || !this.isReady) {
      return this._integrateFallback(stateArray, dt);
    }

    try {
      const state = stateArray instanceof Float64Array ? stateArray : new Float64Array(stateArray);
      const n = state.length;
      
      // Allocate memory in WASM heap
      const statePtr = this._allocateArray(state);
      const resultPtr = this.module._malloc(n * 8); // 8 bytes per double
      
      try {
        // Call Fortran function
        this._integrate(statePtr, dt, n, resultPtr);
        
        // Read result from WASM memory
        const result = this._readArray(resultPtr, n);
        
        return result;
      } finally {
        // Clean up memory
        this.module._free(statePtr);
        this.module._free(resultPtr);
      }
    } catch (error) {
      console.error('Fortran integrate failed, using fallback:', error);
      this.useFallback = true;
      return this._integrateFallback(stateArray, dt);
    }
  }

  /**
   * Calculate logistic growth rate
   * Formula: rate * population * (1 - population / capacity)
   * 
   * @param {number} population - Current population
   * @param {number} rate - Growth rate
   * @param {number} capacity - Carrying capacity
   * @returns {number} Growth value
   */
  logisticGrowth(population, rate, capacity) {
    if (this.useFallback || !this.isReady) {
      return this._logisticGrowthFallback(population, rate, capacity);
    }

    try {
      const result = this._logistic_growth(population, rate, capacity);
      
      // Validate result
      if (!isFinite(result)) {
        return 0.0;
      }
      
      return result;
    } catch (error) {
      console.error('Fortran logisticGrowth failed, using fallback:', error);
      this.useFallback = true;
      return this._logisticGrowthFallback(population, rate, capacity);
    }
  }

  /**
   * Calculate mutation probability with energy-based modulation
   * Formula: base_rate * exp(-energy / temperature)
   * Higher energy = lower mutation rate (stable state)
   * 
   * @param {number} energy - Current energy level
   * @param {number} baseRate - Base mutation rate
   * @param {number} temperature - Temperature parameter
   * @returns {number} Mutation probability [0, 1]
   */
  mutationProb(energy, baseRate, temperature) {
    if (this.useFallback || !this.isReady) {
      return this._mutationProbFallback(energy, baseRate, temperature);
    }

    try {
      const result = this._mutation_prob(energy, baseRate, temperature);
      
      // Validate and clamp result
      if (!isFinite(result)) {
        return 0.0;
      }
      
      return Math.max(0.0, Math.min(1.0, result));
    } catch (error) {
      console.error('Fortran mutationProb failed, using fallback:', error);
      this.useFallback = true;
      return this._mutationProbFallback(energy, baseRate, temperature);
    }
  }

  /**
   * Allocate array in WASM heap and copy data
   * @private
   */
  _allocateArray(array) {
    const n = array.length;
    const ptr = this.module._malloc(n * 8); // 8 bytes per double
    
    // Copy data to WASM heap
    this.module.HEAPF64.set(array, ptr / 8);
    
    return ptr;
  }

  /**
   * Read array from WASM heap
   * @private
   */
  _readArray(ptr, length) {
    // Create a view into WASM memory
    const view = new Float64Array(
      this.module.HEAPF64.buffer,
      ptr,
      length
    );
    
    // Copy to new array (don't return view as it may be invalidated)
    return new Float64Array(view);
  }

  // ============================================================
  // JavaScript Fallback Implementations
  // ============================================================

  /**
   * JavaScript fallback for integrate
   * @private
   */
  _integrateFallback(stateArray, dt) {
    const state = stateArray instanceof Float64Array ? stateArray : new Float64Array(stateArray);
    const result = new Float64Array(state.length);
    
    // Check for invalid time step
    if (!isFinite(dt)) {
      return result; // Return zeros
    }
    
    // Euler integration: result = state + dt * f(state)
    // Using derivative: f(x) = 0.1 * x
    for (let i = 0; i < state.length; i++) {
      const value = state[i];
      
      if (!isFinite(value)) {
        result[i] = 0.0;
      } else {
        const derivative = 0.1 * value;
        result[i] = value + dt * derivative;
        
        // Clamp to prevent overflow
        if (!isFinite(result[i])) {
          result[i] = value > 0 ? Number.MAX_VALUE : -Number.MAX_VALUE;
        }
      }
    }
    
    return result;
  }

  /**
   * JavaScript fallback for logisticGrowth
   * @private
   */
  _logisticGrowthFallback(population, rate, capacity) {
    // Check for invalid inputs
    if (!isFinite(population) || !isFinite(rate) || !isFinite(capacity)) {
      return 0.0;
    }
    
    // Check for zero or negative capacity
    if (capacity <= 0) {
      return 0.0;
    }
    
    // Calculate logistic growth
    const ratio = population / capacity;
    const factor = Math.max(0.0, Math.min(1.0, 1.0 - ratio));
    const growth = rate * population * factor;
    
    // Validate result
    if (!isFinite(growth)) {
      return 0.0;
    }
    
    return growth;
  }

  /**
   * JavaScript fallback for mutationProb
   * @private
   */
  _mutationProbFallback(energy, baseRate, temperature) {
    // Check for invalid inputs
    if (!isFinite(energy) || !isFinite(baseRate) || !isFinite(temperature)) {
      return 0.0;
    }
    
    // Check for zero or negative temperature
    if (temperature <= 0) {
      return Math.max(0.0, Math.min(1.0, baseRate));
    }
    
    // Calculate exponent, clamping to prevent overflow
    const exponent = Math.max(-100, Math.min(100, -energy / temperature));
    
    // Calculate probability
    const prob = baseRate * Math.exp(exponent);
    
    // Clamp to [0, 1]
    if (!isFinite(prob)) {
      return 0.0;
    }
    
    return Math.max(0.0, Math.min(1.0, prob));
  }

  /**
   * Check if engine is using fallback implementations
   * @returns {boolean}
   */
  isFallback() {
    return this.useFallback;
  }

  /**
   * Get engine status information
   * @returns {object}
   */
  getStatus() {
    return {
      ready: this.isReady,
      usingFallback: this.useFallback,
      wasmAvailable: this.module !== null
    };
  }
}

export default FortranEngine;
