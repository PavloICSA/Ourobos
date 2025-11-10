/**
 * JavaScript Orchestrator - Message Bus and Module Coordinator
 * 
 * Central coordination layer managing all component communication.
 * Handles WASM module loading, message routing, and error handling.
 */

import { CircuitBreaker } from './circuit-breaker.js';

export class Orchestrator {
  constructor(options = {}) {
    // Module registry for WASM modules
    this.modules = new Map();
    
    // Event handlers for message subscriptions
    this.handlers = new Map();
    
    // Execution timeout default (100ms)
    this.defaultTimeout = options.timeout || 100;
    
    // Error tracking for circuit breaker integration
    this.errors = new Map();
    
    // Circuit breaker for fault tolerance
    this.circuitBreaker = new CircuitBreaker({
      threshold: options.circuitBreakerThreshold || 3,
      timeout: options.circuitBreakerTimeout || 30000,
      resetTimeout: options.circuitBreakerResetTimeout || 60000
    });
  }

  /**
   * Load and initialize a WASM module
   * @param {string} name - Module identifier (e.g., 'rust', 'fortran')
   * @param {string} path - Path to WASM module
   * @returns {Promise<WasmModule>} Loaded module instance
   */
  async loadModule(name, path) {
    try {
      let module;
      
      // Handle different WASM loading patterns
      if (path.endsWith('.wasm')) {
        // Direct WASM file
        const response = await fetch(path);
        const buffer = await response.arrayBuffer();
        const wasmModule = await WebAssembly.instantiate(buffer);
        module = wasmModule.instance.exports;
      } else if (path.endsWith('.js')) {
        // Emscripten or wasm-pack generated JS wrapper
        const moduleFactory = await import(path);
        
        // Handle wasm-pack pattern
        if (moduleFactory.default) {
          await moduleFactory.default();
          module = moduleFactory;
        } else if (typeof moduleFactory === 'function') {
          // Handle Emscripten pattern
          module = await moduleFactory();
        } else {
          module = moduleFactory;
        }
      } else {
        throw new Error(`Unsupported module format: ${path}`);
      }
      
      // Store module in registry
      this.modules.set(name, {
        instance: module,
        path,
        loadedAt: Date.now(),
        callCount: 0,
        errorCount: 0
      });
      
      console.log(`Module '${name}' loaded successfully from ${path}`);
      return module;
      
    } catch (error) {
      const errorMsg = `Failed to load module '${name}' from ${path}: ${error.message}`;
      console.error(errorMsg, error);
      this.trackError(name, error);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get a loaded module by name
   * @param {string} name - Module identifier
   * @returns {WasmModule|null} Module instance or null if not found
   */
  getModule(name) {
    const moduleData = this.modules.get(name);
    return moduleData ? moduleData.instance : null;
  }

  /**
   * Send a message to a target component with type-based dispatch
   * @param {string} target - Target module or component name
   * @param {Object} message - Message object with type and payload
   * @returns {Promise<any>} Result from message handler
   */
  async send(target, message) {
    // Use circuit breaker for module calls
    return await this.circuitBreaker.execute(target, async () => {
      try {
        // Validate message structure
        if (!message || typeof message !== 'object') {
          throw new Error('Message must be an object');
        }
        
        if (!message.type) {
          throw new Error('Message must have a type property');
        }
        
        // Add timestamp if not present
        if (!message.timestamp) {
          message.timestamp = Date.now();
        }
        
        // Route message based on type
        const handlerKey = `${target}:${message.type}`;
        const handlers = this.handlers.get(handlerKey) || [];
        
        if (handlers.length === 0) {
          // No specific handler, try to route to module directly
          const module = this.getModule(target);
          if (!module) {
            throw new Error(`No module or handler found for target '${target}'`);
          }
          
          // Update call count
          const moduleData = this.modules.get(target);
          if (moduleData) {
            moduleData.callCount++;
          }
          
          return await this.routeToModule(target, module, message);
        }
        
        // Execute all registered handlers
        const results = await Promise.all(
          handlers.map(handler => handler(message))
        );
        
        return results.length === 1 ? results[0] : results;
        
      } catch (error) {
        this.trackError(target, error);
        throw new Error(`Message routing failed for '${target}': ${error.message}`);
      }
    });
  }

  /**
   * Route message directly to a WASM module
   * @private
   */
  async routeToModule(target, module, message) {
    const { type, payload } = message;
    
    // Try to find a matching function in the module
    const functionName = this.getFunctionName(type);
    
    if (typeof module[functionName] === 'function') {
      return await module[functionName](payload);
    }
    
    throw new Error(`Function '${functionName}' not found in module '${target}'`);
  }

  /**
   * Convert message type to function name
   * @private
   */
  getFunctionName(type) {
    // Convert 'compute' -> 'compute', 'eval' -> 'eval', etc.
    return type.toLowerCase().replace(/-/g, '_');
  }

  /**
   * Subscribe to messages for a specific target and type
   * @param {string} event - Event string in format "target:type" or just "type"
   * @param {Function} handler - Handler function
   */
  subscribe(event, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
    
    return () => {
      // Return unsubscribe function
      const handlers = this.handlers.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Execute a function with timeout enforcement
   * @param {Function} fn - Function to execute
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<any>} Function result
   */
  async executeWithTimeout(fn, timeout = this.defaultTimeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Execution timeout after ${timeout}ms`));
      }, timeout);
      
      Promise.resolve(fn())
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Track errors for circuit breaker pattern
   * @private
   */
  trackError(target, error) {
    const errors = this.errors.get(target) || [];
    errors.push({
      error,
      timestamp: Date.now()
    });
    this.errors.set(target, errors);
  }

  /**
   * Get error count for a target
   * @param {string} target - Target module name
   * @param {number} timeWindow - Time window in ms (default: 60000 = 1 minute)
   * @returns {number} Error count within time window
   */
  getErrorCount(target, timeWindow = 60000) {
    const errors = this.errors.get(target) || [];
    const cutoff = Date.now() - timeWindow;
    return errors.filter(e => e.timestamp > cutoff).length;
  }

  /**
   * Reset the orchestrator state
   */
  reset() {
    // Clear all modules
    this.modules.clear();
    
    // Clear all handlers
    this.handlers.clear();
    
    // Clear error tracking
    this.errors.clear();
    
    console.log('Orchestrator reset complete');
  }

  /**
   * Get orchestrator statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const stats = {
      moduleCount: this.modules.size,
      handlerCount: this.handlers.size,
      modules: {},
      circuitBreaker: this.circuitBreaker.getAllStats()
    };
    
    for (const [name, data] of this.modules.entries()) {
      stats.modules[name] = {
        callCount: data.callCount,
        errorCount: data.errorCount,
        loadedAt: data.loadedAt,
        uptime: Date.now() - data.loadedAt
      };
    }
    
    return stats;
  }

  /**
   * Get circuit breaker instance
   * @returns {CircuitBreaker} Circuit breaker
   */
  getCircuitBreaker() {
    return this.circuitBreaker;
  }
}
