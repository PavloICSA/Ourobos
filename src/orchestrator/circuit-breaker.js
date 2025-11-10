/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by tracking errors and temporarily
 * disabling failing modules. Implements three states:
 * - CLOSED: Normal operation
 * - OPEN: Module disabled after threshold failures
 * - HALF_OPEN: Testing if module has recovered
 */

const CircuitState = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half-open'
};

export class CircuitBreaker {
  /**
   * Create a circuit breaker
   * @param {Object} options - Configuration options
   * @param {number} options.threshold - Failure threshold before opening (default: 3)
   * @param {number} options.timeout - Time in ms before attempting recovery (default: 30000)
   * @param {number} options.resetTimeout - Time in ms to reset failure count (default: 60000)
   */
  constructor(options = {}) {
    this.threshold = options.threshold || 3;
    this.timeout = options.timeout || 30000;
    this.resetTimeout = options.resetTimeout || 60000;
    
    // Track state per module
    this.states = new Map();
    
    // Track failures per module
    this.failures = new Map();
    
    // Track last failure time per module
    this.lastFailure = new Map();
    
    // Track last state change time per module
    this.lastStateChange = new Map();
    
    // Track success count in half-open state
    this.successCount = new Map();
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {string} module - Module identifier
   * @param {Function} fn - Function to execute
   * @returns {Promise<any>} Function result
   */
  async execute(module, fn) {
    const state = this.getState(module);
    
    // Check if circuit is open
    if (state === CircuitState.OPEN) {
      // Check if timeout has elapsed
      const lastChange = this.lastStateChange.get(module) || 0;
      const elapsed = Date.now() - lastChange;
      
      if (elapsed >= this.timeout) {
        // Transition to half-open
        this.setState(module, CircuitState.HALF_OPEN);
        console.log(`Circuit breaker for '${module}' entering HALF_OPEN state`);
      } else {
        throw new Error(`Circuit breaker OPEN for '${module}' (${Math.ceil((this.timeout - elapsed) / 1000)}s remaining)`);
      }
    }
    
    try {
      // Execute function
      const result = await fn();
      
      // Record success
      this.onSuccess(module);
      
      return result;
      
    } catch (error) {
      // Record failure
      this.onFailure(module, error);
      
      throw error;
    }
  }

  /**
   * Handle successful execution
   * @private
   */
  onSuccess(module) {
    const state = this.getState(module);
    
    if (state === CircuitState.HALF_OPEN) {
      // Increment success count
      const count = (this.successCount.get(module) || 0) + 1;
      this.successCount.set(module, count);
      
      // After 2 successful calls, close the circuit
      if (count >= 2) {
        this.setState(module, CircuitState.CLOSED);
        this.failures.set(module, 0);
        this.successCount.set(module, 0);
        console.log(`Circuit breaker for '${module}' CLOSED after recovery`);
      }
    } else if (state === CircuitState.CLOSED) {
      // Reset failure count if enough time has passed
      const lastFail = this.lastFailure.get(module) || 0;
      const elapsed = Date.now() - lastFail;
      
      if (elapsed >= this.resetTimeout) {
        this.failures.set(module, 0);
      }
    }
  }

  /**
   * Handle failed execution
   * @private
   */
  onFailure(module, error) {
    const state = this.getState(module);
    
    // Increment failure count
    const count = (this.failures.get(module) || 0) + 1;
    this.failures.set(module, count);
    this.lastFailure.set(module, Date.now());
    
    console.warn(`Circuit breaker failure for '${module}': ${error.message} (${count}/${this.threshold})`);
    
    // Check if threshold exceeded
    if (count >= this.threshold) {
      if (state !== CircuitState.OPEN) {
        this.setState(module, CircuitState.OPEN);
        console.error(`Circuit breaker OPEN for '${module}' after ${count} failures`);
      }
    }
    
    // If in half-open state, immediately open on failure
    if (state === CircuitState.HALF_OPEN) {
      this.setState(module, CircuitState.OPEN);
      this.successCount.set(module, 0);
      console.error(`Circuit breaker for '${module}' reopened during recovery attempt`);
    }
  }

  /**
   * Get current state for a module
   * @param {string} module - Module identifier
   * @returns {string} Current state
   */
  getState(module) {
    return this.states.get(module) || CircuitState.CLOSED;
  }

  /**
   * Set state for a module
   * @private
   */
  setState(module, state) {
    this.states.set(module, state);
    this.lastStateChange.set(module, Date.now());
  }

  /**
   * Get failure count for a module
   * @param {string} module - Module identifier
   * @returns {number} Failure count
   */
  getFailureCount(module) {
    return this.failures.get(module) || 0;
  }

  /**
   * Manually reset circuit breaker for a module
   * @param {string} module - Module identifier
   */
  reset(module) {
    this.setState(module, CircuitState.CLOSED);
    this.failures.set(module, 0);
    this.successCount.set(module, 0);
    this.lastFailure.delete(module);
    console.log(`Circuit breaker for '${module}' manually reset`);
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const module of this.states.keys()) {
      this.reset(module);
    }
  }

  /**
   * Check if a module is available (not in OPEN state)
   * @param {string} module - Module identifier
   * @returns {boolean} True if available
   */
  isAvailable(module) {
    return this.getState(module) !== CircuitState.OPEN;
  }

  /**
   * Get statistics for a module
   * @param {string} module - Module identifier
   * @returns {Object} Statistics
   */
  getStats(module) {
    const state = this.getState(module);
    const failures = this.failures.get(module) || 0;
    const lastFail = this.lastFailure.get(module);
    const lastChange = this.lastStateChange.get(module);
    
    return {
      state,
      failures,
      threshold: this.threshold,
      lastFailure: lastFail ? new Date(lastFail).toISOString() : null,
      lastStateChange: lastChange ? new Date(lastChange).toISOString() : null,
      isAvailable: this.isAvailable(module)
    };
  }

  /**
   * Get statistics for all modules
   * @returns {Object} Statistics for all modules
   */
  getAllStats() {
    const stats = {};
    
    for (const module of this.states.keys()) {
      stats[module] = this.getStats(module);
    }
    
    return stats;
  }
}

/**
 * Create a circuit breaker with default options
 * @param {Object} options - Configuration options
 * @returns {CircuitBreaker} Circuit breaker instance
 */
export function createCircuitBreaker(options) {
  return new CircuitBreaker(options);
}

export { CircuitState };
