/**
 * Orchestrator Example
 * 
 * Demonstrates how to use the orchestrator, WASM bridge,
 * circuit breaker, and message handlers.
 */

import { Orchestrator } from './index.js';
import { WasmBridge } from './wasm-bridge.js';
import { CircuitBreaker } from './circuit-breaker.js';
import { setupMessageHandlers, MessageQueue, MessageValidator } from './message-handlers.js';

// ============================================================================
// Example 1: Basic Orchestrator Setup
// ============================================================================

async function example1_basicSetup() {
  console.log('\n=== Example 1: Basic Orchestrator Setup ===\n');
  
  // Create orchestrator with custom options
  const orchestrator = new Orchestrator({
    timeout: 100,
    circuitBreakerThreshold: 3,
    circuitBreakerTimeout: 30000
  });
  
  console.log('Orchestrator created');
  console.log('Stats:', orchestrator.getStats());
}

// ============================================================================
// Example 2: Loading WASM Modules
// ============================================================================

async function example2_loadModules() {
  console.log('\n=== Example 2: Loading WASM Modules ===\n');
  
  const orchestrator = new Orchestrator();
  
  try {
    // Load Rust module (wasm-pack pattern)
    console.log('Loading Rust module...');
    await orchestrator.loadModule('rust', '/wasm/rust/rust_wasm.js');
    console.log('✓ Rust module loaded');
    
    // Load Fortran module (Emscripten pattern)
    console.log('Loading Fortran module...');
    await orchestrator.loadModule('fortran', '/wasm/fortran/fortran_engine.js');
    console.log('✓ Fortran module loaded');
    
    // Get module instance
    const rustModule = orchestrator.getModule('rust');
    console.log('Rust module available:', !!rustModule);
    
    // View stats
    console.log('\nModule stats:', orchestrator.getStats().modules);
    
  } catch (error) {
    console.error('Failed to load modules:', error.message);
  }
}

// ============================================================================
// Example 3: Message Routing
// ============================================================================

async function example3_messageRouting() {
  console.log('\n=== Example 3: Message Routing ===\n');
  
  const orchestrator = new Orchestrator();
  
  // Subscribe to messages
  orchestrator.subscribe('test:ping', (message) => {
    console.log('Received ping:', message);
    return { pong: true, timestamp: Date.now() };
  });
  
  // Send message
  try {
    const result = await orchestrator.send('test', {
      type: 'ping',
      payload: { data: 'hello' }
    });
    console.log('Response:', result);
  } catch (error) {
    console.error('Message failed:', error.message);
  }
}

// ============================================================================
// Example 4: WASM Bridge Usage
// ============================================================================

async function example4_wasmBridge() {
  console.log('\n=== Example 4: WASM Bridge Usage ===\n');
  
  // Mock WASM module for demonstration
  const mockModule = {
    memory: new WebAssembly.Memory({ initial: 1 }),
    malloc: (size) => {
      console.log(`malloc(${size})`);
      return 1024; // Mock pointer
    },
    free: (ptr) => {
      console.log(`free(${ptr})`);
    },
    add_arrays: (ptr1, len1, ptr2, len2, outPtr) => {
      console.log(`add_arrays called with ${len1} and ${len2} elements`);
      return 0; // Success
    }
  };
  
  // Create bridge
  const bridge = new WasmBridge(mockModule);
  
  // Allocate typed array
  const data = new Float64Array([1.0, 2.0, 3.0]);
  const ptr = bridge.allocate(data);
  console.log('Allocated at pointer:', ptr);
  
  // Call WASM function
  try {
    bridge.call('add_arrays', ptr, 3, ptr, 3, ptr);
    console.log('✓ Function called successfully');
  } catch (error) {
    console.error('Function call failed:', error.message);
  }
  
  // Free memory
  bridge.free(ptr);
  console.log('Memory freed');
  
  // Get stats
  console.log('Bridge stats:', bridge.getMemoryStats());
}

// ============================================================================
// Example 5: Circuit Breaker
// ============================================================================

async function example5_circuitBreaker() {
  console.log('\n=== Example 5: Circuit Breaker ===\n');
  
  const breaker = new CircuitBreaker({
    threshold: 3,
    timeout: 5000
  });
  
  // Simulate failing function
  let callCount = 0;
  const unreliableFunction = async () => {
    callCount++;
    if (callCount <= 3) {
      throw new Error('Service unavailable');
    }
    return 'Success!';
  };
  
  // Try calling multiple times
  for (let i = 1; i <= 5; i++) {
    try {
      console.log(`\nAttempt ${i}:`);
      const result = await breaker.execute('service', unreliableFunction);
      console.log('✓ Result:', result);
    } catch (error) {
      console.log('✗ Error:', error.message);
    }
    
    // Show circuit state
    const stats = breaker.getStats('service');
    console.log(`  State: ${stats.state}, Failures: ${stats.failures}/${stats.threshold}`);
  }
  
  // Wait for recovery
  console.log('\nWaiting 5 seconds for circuit to enter HALF_OPEN...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Try again
  try {
    console.log('\nAttempt after timeout:');
    const result = await breaker.execute('service', unreliableFunction);
    console.log('✓ Result:', result);
    console.log('Circuit recovered!');
  } catch (error) {
    console.log('✗ Still failing:', error.message);
  }
}

// ============================================================================
// Example 6: Message Queue with Priority
// ============================================================================

async function example6_messageQueue() {
  console.log('\n=== Example 6: Message Queue with Priority ===\n');
  
  const queue = new MessageQueue();
  
  // Register handler
  queue.registerHandler('process', async (message) => {
    console.log(`Processing: ${message.payload.name} (priority: ${message.payload.priority})`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return { processed: true, name: message.payload.name };
  });
  
  // Enqueue messages with different priorities
  const promises = [
    queue.enqueue({ type: 'process', payload: { name: 'Low priority', priority: 0 } }, 0),
    queue.enqueue({ type: 'process', payload: { name: 'High priority', priority: 10 } }, 10),
    queue.enqueue({ type: 'process', payload: { name: 'Medium priority', priority: 5 } }, 5),
    queue.enqueue({ type: 'process', payload: { name: 'Another high', priority: 10 } }, 10)
  ];
  
  // Wait for all to complete
  const results = await Promise.all(promises);
  console.log('\nAll messages processed');
  console.log('Queue stats:', queue.getStats());
}

// ============================================================================
// Example 7: Message Validation
// ============================================================================

function example7_messageValidation() {
  console.log('\n=== Example 7: Message Validation ===\n');
  
  // Valid message
  const validMsg = {
    type: 'compile',
    payload: {
      source: 'IF x > 10 THEN y := 5',
      language: 'algol'
    }
  };
  
  const result1 = MessageValidator.validate(validMsg);
  console.log('Valid message:', result1);
  
  // Invalid message (missing payload.source)
  const invalidMsg = {
    type: 'compile',
    payload: {
      language: 'algol'
    }
  };
  
  const result2 = MessageValidator.validate(invalidMsg);
  console.log('\nInvalid message:', result2);
  
  // Create error response
  if (!result2.valid) {
    const errorResponse = MessageValidator.createErrorResponse('compile', result2.errors);
    console.log('\nError response:', errorResponse);
  }
}

// ============================================================================
// Example 8: Complete Integration
// ============================================================================

async function example8_completeIntegration() {
  console.log('\n=== Example 8: Complete Integration ===\n');
  
  // Create orchestrator
  const orchestrator = new Orchestrator();
  
  // Mock components
  const mockCompiler = {
    compile: (source) => {
      console.log('Compiling:', source);
      return {
        success: true,
        lisp: '(if (> x 10) (set! y 5))'
      };
    }
  };
  
  const mockInterpreter = {
    eval: (code) => {
      console.log('Evaluating:', code);
      return 42;
    },
    define: (name, value) => {
      console.log(`Defining ${name} = ${value}`);
    }
  };
  
  // Setup message handlers
  const messageQueue = setupMessageHandlers(orchestrator, {
    compiler: mockCompiler,
    interpreter: mockInterpreter
  });
  
  console.log('Message handlers configured');
  
  // Send compile message
  console.log('\n1. Compiling ALGOL code...');
  orchestrator.subscribe('compile', async (msg) => {
    const result = await messageQueue.enqueue(msg);
    console.log('Compile result:', result);
  });
  
  await orchestrator.send('compiler', {
    type: 'compile',
    payload: {
      source: 'IF x > 10 THEN y := 5',
      language: 'algol'
    }
  });
  
  // Send eval message
  console.log('\n2. Evaluating Lisp code...');
  orchestrator.subscribe('eval', async (msg) => {
    const result = await messageQueue.enqueue(msg);
    console.log('Eval result:', result);
  });
  
  await orchestrator.send('interpreter', {
    type: 'eval',
    payload: {
      code: '(+ 1 2 3)',
      context: { x: 10 }
    }
  });
  
  console.log('\nIntegration complete!');
}

// ============================================================================
// Example 9: Error Handling
// ============================================================================

async function example9_errorHandling() {
  console.log('\n=== Example 9: Error Handling ===\n');
  
  const orchestrator = new Orchestrator();
  
  // Try to send to non-existent module
  try {
    await orchestrator.send('nonexistent', {
      type: 'test',
      payload: {}
    });
  } catch (error) {
    console.log('✓ Caught error:', error.message);
  }
  
  // Invalid message
  try {
    await orchestrator.send('test', {
      // Missing type
      payload: {}
    });
  } catch (error) {
    console.log('✓ Caught validation error:', error.message);
  }
  
  // Check error tracking
  const errorCount = orchestrator.getErrorCount('test');
  console.log(`\nErrors tracked for 'test': ${errorCount}`);
}

// ============================================================================
// Example 10: Timeout Enforcement
// ============================================================================

async function example10_timeoutEnforcement() {
  console.log('\n=== Example 10: Timeout Enforcement ===\n');
  
  const orchestrator = new Orchestrator({ timeout: 1000 });
  
  // Fast function (should succeed)
  try {
    const result = await orchestrator.executeWithTimeout(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'Fast result';
    }, 1000);
    console.log('✓ Fast function:', result);
  } catch (error) {
    console.log('✗ Error:', error.message);
  }
  
  // Slow function (should timeout)
  try {
    const result = await orchestrator.executeWithTimeout(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return 'Slow result';
    }, 1000);
    console.log('✓ Slow function:', result);
  } catch (error) {
    console.log('✓ Caught timeout:', error.message);
  }
}

// ============================================================================
// Run All Examples
// ============================================================================

async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      OuroborOS-Chimera Orchestrator Examples             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  await example1_basicSetup();
  // await example2_loadModules(); // Requires actual WASM files
  await example3_messageRouting();
  await example4_wasmBridge();
  // await example5_circuitBreaker(); // Takes 5+ seconds
  await example6_messageQueue();
  example7_messageValidation();
  await example8_completeIntegration();
  await example9_errorHandling();
  await example10_timeoutEnforcement();
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         All Examples Complete!                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}

// Export for use in other modules
export {
  example1_basicSetup,
  example2_loadModules,
  example3_messageRouting,
  example4_wasmBridge,
  example5_circuitBreaker,
  example6_messageQueue,
  example7_messageValidation,
  example8_completeIntegration,
  example9_errorHandling,
  example10_timeoutEnforcement,
  runAllExamples
};
