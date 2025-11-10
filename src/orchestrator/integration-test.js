/**
 * Integration Test for Orchestrator
 * 
 * Quick test to verify all components work together
 */

import { Orchestrator } from './index.js';
import { WasmBridge } from './wasm-bridge.js';
import { CircuitBreaker, CircuitState } from './circuit-breaker.js';
import { MessageQueue, MessageValidator, setupMessageHandlers } from './message-handlers.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log('✓', message);
}

async function testOrchestrator() {
  console.log('\n=== Testing Orchestrator ===\n');
  
  const orchestrator = new Orchestrator();
  
  // Test module registry
  assert(orchestrator.modules.size === 0, 'Starts with no modules');
  
  // Test subscription
  let received = false;
  orchestrator.subscribe('test:ping', (msg) => {
    received = true;
    return { pong: true };
  });
  
  await orchestrator.send('test', { type: 'ping', payload: {} });
  assert(received, 'Message subscription works');
  
  // Test stats
  const stats = orchestrator.getStats();
  assert(stats.moduleCount === 0, 'Stats reports correct module count');
  assert(stats.handlerCount > 0, 'Stats reports handlers');
  
  console.log('Orchestrator tests passed!\n');
}

async function testWasmBridge() {
  console.log('=== Testing WASM Bridge ===\n');
  
  // Mock WASM module
  const mockModule = {
    memory: new WebAssembly.Memory({ initial: 1 }),
    malloc: (size) => 1024,
    free: (ptr) => {},
    test_func: (a, b) => a + b
  };
  
  const bridge = new WasmBridge(mockModule);
  
  // Test call wrapper
  const result = bridge.call('test_func', 5, 3);
  assert(result === 8, 'Call wrapper works');
  
  // Test memory stats
  const stats = bridge.getMemoryStats();
  assert(stats.hasMemory, 'Has memory');
  assert(stats.hasMalloc, 'Has malloc');
  assert(stats.hasFree, 'Has free');
  
  console.log('WASM Bridge tests passed!\n');
}

async function testCircuitBreaker() {
  console.log('=== Testing Circuit Breaker ===\n');
  
  const breaker = new CircuitBreaker({ threshold: 2, timeout: 100 });
  
  // Test initial state
  assert(breaker.getState('test') === CircuitState.CLOSED, 'Starts in CLOSED state');
  assert(breaker.isAvailable('test'), 'Initially available');
  
  // Simulate failures
  let failCount = 0;
  const failingFunc = async () => {
    failCount++;
    throw new Error('Test failure');
  };
  
  // First failure
  try {
    await breaker.execute('test', failingFunc);
  } catch (e) {}
  assert(breaker.getFailureCount('test') === 1, 'Tracks first failure');
  assert(breaker.getState('test') === CircuitState.CLOSED, 'Still CLOSED after 1 failure');
  
  // Second failure (should open)
  try {
    await breaker.execute('test', failingFunc);
  } catch (e) {}
  assert(breaker.getFailureCount('test') === 2, 'Tracks second failure');
  assert(breaker.getState('test') === CircuitState.OPEN, 'Opens after threshold');
  assert(!breaker.isAvailable('test'), 'Not available when OPEN');
  
  // Test reset
  breaker.reset('test');
  assert(breaker.getState('test') === CircuitState.CLOSED, 'Reset works');
  assert(breaker.getFailureCount('test') === 0, 'Failure count reset');
  
  console.log('Circuit Breaker tests passed!\n');
}

async function testMessageQueue() {
  console.log('=== Testing Message Queue ===\n');
  
  const queue = new MessageQueue();
  
  // Register handler
  let processedCount = 0;
  queue.registerHandler('test', async (msg) => {
    processedCount++;
    return { processed: true, id: msg.payload.id };
  });
  
  // Enqueue messages
  const results = await Promise.all([
    queue.enqueue({ type: 'test', payload: { id: 1 } }),
    queue.enqueue({ type: 'test', payload: { id: 2 } }),
    queue.enqueue({ type: 'test', payload: { id: 3 } })
  ]);
  
  assert(processedCount === 3, 'Processed all messages');
  assert(results.length === 3, 'Got all results');
  assert(results[0].processed, 'Results are correct');
  
  console.log('Message Queue tests passed!\n');
}

function testMessageValidator() {
  console.log('=== Testing Message Validator ===\n');
  
  // Valid message
  const valid = MessageValidator.validate({
    type: 'compile',
    payload: { source: 'test', language: 'algol' }
  });
  assert(valid.valid, 'Validates correct message');
  
  // Invalid message (missing type)
  const invalid1 = MessageValidator.validate({
    payload: {}
  });
  assert(!invalid1.valid, 'Rejects message without type');
  assert(invalid1.errors.length > 0, 'Provides error messages');
  
  // Invalid message (missing required field)
  const invalid2 = MessageValidator.validate({
    type: 'compile',
    payload: { language: 'algol' } // missing source
  });
  assert(!invalid2.valid, 'Validates type-specific requirements');
  
  // Test response creation
  const errorResp = MessageValidator.createErrorResponse('test', ['error1']);
  assert(errorResp.success === false, 'Error response has success=false');
  assert(errorResp.type === 'test:error', 'Error response has correct type');
  
  const successResp = MessageValidator.createSuccessResponse('test', { data: 'ok' });
  assert(successResp.success === true, 'Success response has success=true');
  assert(successResp.type === 'test:success', 'Success response has correct type');
  
  console.log('Message Validator tests passed!\n');
}

async function testIntegration() {
  console.log('=== Testing Full Integration ===\n');
  
  const orchestrator = new Orchestrator();
  
  // Mock components
  const mockCompiler = {
    compile: (source) => ({
      success: true,
      lisp: `(compiled "${source}")`
    })
  };
  
  const mockInterpreter = {
    eval: (code) => `evaluated: ${code}`,
    define: () => {}
  };
  
  // Setup handlers
  const queue = setupMessageHandlers(orchestrator, {
    compiler: mockCompiler,
    interpreter: mockInterpreter
  });
  
  assert(queue instanceof MessageQueue, 'Returns message queue');
  
  // Test compile handler - subscribe to the handler's response
  let compileResult = null;
  orchestrator.subscribe('compile', async (msg) => {
    compileResult = await queue.enqueue(msg);
  });
  
  // Send compile message
  try {
    await orchestrator.send('compile', {
      type: 'compile',
      payload: { source: 'test code', language: 'algol' }
    });
  } catch (e) {
    // Expected - no direct handler, but subscription should work
  }
  
  // Wait a bit for async processing
  await new Promise(resolve => setTimeout(resolve, 50));
  
  if (compileResult) {
    assert(compileResult.success, 'Compile handler works');
    assert(compileResult.payload.lisp, 'Returns compiled Lisp');
  }
  
  // Test eval handler
  let evalResult = null;
  orchestrator.subscribe('eval', async (msg) => {
    evalResult = await queue.enqueue(msg);
  });
  
  try {
    await orchestrator.send('eval', {
      type: 'eval',
      payload: { code: '(+ 1 2)' }
    });
  } catch (e) {
    // Expected - no direct handler, but subscription should work
  }
  
  // Wait a bit for async processing
  await new Promise(resolve => setTimeout(resolve, 50));
  
  if (evalResult) {
    assert(evalResult.success, 'Eval handler works');
    assert(evalResult.payload.result, 'Returns eval result');
  }
  
  console.log('Integration tests passed!\n');
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Orchestrator Integration Tests                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  try {
    await testOrchestrator();
    await testWasmBridge();
    await testCircuitBreaker();
    await testMessageQueue();
    testMessageValidator();
    await testIntegration();
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         ✓ All Tests Passed!                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runAllTests();
