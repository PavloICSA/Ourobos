/**
 * Message Protocol Handlers
 * 
 * Implements handlers for different message types:
 * - compile: ALGOL to Lisp compilation
 * - eval: Lisp code evaluation
 * - compute: WASM computation
 * - mutate: Organism state mutation
 */

/**
 * Message queue with priority scheduling
 */
export class MessageQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.handlers = new Map();
  }

  /**
   * Add a message to the queue
   * @param {Object} message - Message to queue
   * @param {number} priority - Priority (higher = more urgent, default: 0)
   * @returns {Promise<any>} Promise that resolves with handler result
   */
  enqueue(message, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        message,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      // Sort by priority (descending) and timestamp (ascending)
      this.queue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });
      
      // Start processing if not already running
      if (!this.processing) {
        this.process();
      }
    });
  }

  /**
   * Process messages in the queue
   * @private
   */
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      const { message, resolve, reject } = item;
      
      try {
        const handler = this.handlers.get(message.type);
        
        if (!handler) {
          throw new Error(`No handler registered for message type: ${message.type}`);
        }
        
        const result = await handler(message);
        resolve(result);
        
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }

  /**
   * Register a handler for a message type
   * @param {string} type - Message type
   * @param {Function} handler - Handler function
   */
  registerHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * Get queue statistics
   * @returns {Object} Queue stats
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      handlerCount: this.handlers.size
    };
  }
}

/**
 * Message validator
 */
export class MessageValidator {
  /**
   * Validate a message structure
   * @param {Object} message - Message to validate
   * @returns {Object} Validation result {valid, errors}
   */
  static validate(message) {
    const errors = [];
    
    // Check basic structure
    if (!message || typeof message !== 'object') {
      errors.push('Message must be an object');
      return { valid: false, errors };
    }
    
    // Check required fields
    if (!message.type) {
      errors.push('Message must have a type property');
    }
    
    if (!message.payload) {
      errors.push('Message must have a payload property');
    }
    
    // Validate specific message types
    if (message.type) {
      const typeErrors = this.validateType(message);
      errors.push(...typeErrors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate message type-specific requirements
   * @private
   */
  static validateType(message) {
    const errors = [];
    const { type, payload } = message;
    
    switch (type) {
      case 'compile':
        if (!payload.source) {
          errors.push('compile message requires payload.source');
        }
        if (!payload.language) {
          errors.push('compile message requires payload.language');
        }
        break;
        
      case 'eval':
        if (!payload.code) {
          errors.push('eval message requires payload.code');
        }
        break;
        
      case 'compute':
        if (!payload.module) {
          errors.push('compute message requires payload.module');
        }
        if (!payload.function) {
          errors.push('compute message requires payload.function');
        }
        break;
        
      case 'mutate':
        if (!payload.ruleId) {
          errors.push('mutate message requires payload.ruleId');
        }
        if (!payload.mutationType) {
          errors.push('mutate message requires payload.mutationType');
        }
        break;
    }
    
    return errors;
  }

  /**
   * Create an error response message
   * @param {string} type - Original message type
   * @param {Array<string>} errors - Error messages
   * @returns {Object} Error response
   */
  static createErrorResponse(type, errors) {
    return {
      type: `${type}:error`,
      payload: {
        errors,
        timestamp: Date.now()
      },
      success: false
    };
  }

  /**
   * Create a success response message
   * @param {string} type - Original message type
   * @param {any} result - Result data
   * @returns {Object} Success response
   */
  static createSuccessResponse(type, result) {
    return {
      type: `${type}:success`,
      payload: result,
      success: true,
      timestamp: Date.now()
    };
  }
}

/**
 * Message handler factory
 * Creates handlers for different message types
 */
export class MessageHandlerFactory {
  /**
   * Create a compile message handler
   * @param {Object} compiler - ALGOL compiler instance
   * @returns {Function} Handler function
   */
  static createCompileHandler(compiler) {
    return async (message) => {
      // Validate message
      const validation = MessageValidator.validate(message);
      if (!validation.valid) {
        return MessageValidator.createErrorResponse('compile', validation.errors);
      }
      
      const { source, language } = message.payload;
      
      try {
        // Compile source code
        const result = compiler.compile(source);
        
        if (!result.success) {
          return MessageValidator.createErrorResponse('compile', result.errors || ['Compilation failed']);
        }
        
        return MessageValidator.createSuccessResponse('compile', {
          lisp: result.lisp,
          language
        });
        
      } catch (error) {
        return MessageValidator.createErrorResponse('compile', [error.message]);
      }
    };
  }

  /**
   * Create an eval message handler
   * @param {Object} interpreter - Lisp interpreter instance
   * @returns {Function} Handler function
   */
  static createEvalHandler(interpreter) {
    return async (message) => {
      // Validate message
      const validation = MessageValidator.validate(message);
      if (!validation.valid) {
        return MessageValidator.createErrorResponse('eval', validation.errors);
      }
      
      const { code, context } = message.payload;
      
      try {
        // Set context if provided
        if (context) {
          for (const [key, value] of Object.entries(context)) {
            interpreter.define(key, value);
          }
        }
        
        // Evaluate code
        const result = interpreter.eval(code);
        
        return MessageValidator.createSuccessResponse('eval', {
          result,
          code
        });
        
      } catch (error) {
        return MessageValidator.createErrorResponse('eval', [error.message]);
      }
    };
  }

  /**
   * Create a compute message handler
   * @param {Object} orchestrator - Orchestrator instance
   * @returns {Function} Handler function
   */
  static createComputeHandler(orchestrator) {
    return async (message) => {
      // Validate message
      const validation = MessageValidator.validate(message);
      if (!validation.valid) {
        return MessageValidator.createErrorResponse('compute', validation.errors);
      }
      
      const { module, function: funcName, args } = message.payload;
      
      try {
        // Get module
        const wasmModule = orchestrator.getModule(module);
        if (!wasmModule) {
          return MessageValidator.createErrorResponse('compute', [`Module '${module}' not found`]);
        }
        
        // Call function
        const func = wasmModule[funcName];
        if (!func || typeof func !== 'function') {
          return MessageValidator.createErrorResponse('compute', [`Function '${funcName}' not found in module '${module}'`]);
        }
        
        const result = await func(...(args || []));
        
        return MessageValidator.createSuccessResponse('compute', {
          result,
          module,
          function: funcName
        });
        
      } catch (error) {
        return MessageValidator.createErrorResponse('compute', [error.message]);
      }
    };
  }

  /**
   * Create a mutate message handler
   * @param {Object} organism - Organism state manager
   * @returns {Function} Handler function
   */
  static createMutateHandler(organism) {
    return async (message) => {
      // Validate message
      const validation = MessageValidator.validate(message);
      if (!validation.valid) {
        return MessageValidator.createErrorResponse('mutate', validation.errors);
      }
      
      const { ruleId, mutationType } = message.payload;
      
      try {
        // Apply mutation
        const result = await organism.mutate(ruleId, mutationType);
        
        return MessageValidator.createSuccessResponse('mutate', {
          ruleId,
          mutationType,
          result
        });
        
      } catch (error) {
        return MessageValidator.createErrorResponse('mutate', [error.message]);
      }
    };
  }
}

/**
 * Setup message handlers for an orchestrator
 * @param {Object} orchestrator - Orchestrator instance
 * @param {Object} components - Component instances {compiler, interpreter, organism}
 * @returns {MessageQueue} Configured message queue
 */
export function setupMessageHandlers(orchestrator, components = {}) {
  const queue = new MessageQueue();
  
  // Register compile handler if compiler available
  if (components.compiler) {
    const handler = MessageHandlerFactory.createCompileHandler(components.compiler);
    queue.registerHandler('compile', handler);
    orchestrator.subscribe('compile', (msg) => queue.enqueue(msg));
  }
  
  // Register eval handler if interpreter available
  if (components.interpreter) {
    const handler = MessageHandlerFactory.createEvalHandler(components.interpreter);
    queue.registerHandler('eval', handler);
    orchestrator.subscribe('eval', (msg) => queue.enqueue(msg));
  }
  
  // Register compute handler
  const computeHandler = MessageHandlerFactory.createComputeHandler(orchestrator);
  queue.registerHandler('compute', computeHandler);
  orchestrator.subscribe('compute', (msg) => queue.enqueue(msg));
  
  // Register mutate handler if organism available
  if (components.organism) {
    const handler = MessageHandlerFactory.createMutateHandler(components.organism);
    queue.registerHandler('mutate', handler);
    orchestrator.subscribe('mutate', (msg) => queue.enqueue(msg));
  }
  
  return queue;
}
