/**
 * ALGOL Compiler Integration Test
 * Tests the compiler integration with the orchestrator
 */

import { ALGOLCompiler } from './compiler.js';
import { Orchestrator } from '../orchestrator/index.js';
import { setupMessageHandlers } from '../orchestrator/message-handlers.js';

console.log('=== ALGOL Compiler Integration Test ===\n');

// Initialize components
const compiler = new ALGOLCompiler();
const orchestrator = new Orchestrator();

// Set up message handlers
const queue = setupMessageHandlers(orchestrator, { compiler });

// Also subscribe to the compiler:compile pattern
orchestrator.subscribe('compiler:compile', async (msg) => {
  const handler = queue.handlers.get('compile');
  return await handler(msg);
});

console.log('Components initialized\n');

// Test 1: Simple compilation through orchestrator
console.log('Test 1: Simple Compilation');
const algolCode1 = 'mutation_rate := 0.05';
console.log(`ALGOL: ${algolCode1}`);

orchestrator.send('compiler', {
  type: 'compile',
  payload: {
    source: algolCode1,
    language: 'algol'
  }
}).then(result => {
  console.log('Result:', result);
  if (result.success) {
    console.log(`✓ Compiled successfully: ${result.payload.lisp}`);
  } else {
    console.log('✗ Compilation failed:', result.payload.errors);
  }
  console.log('');
  
  // Test 2: Complex compilation
  console.log('Test 2: Complex Compilation');
  const algolCode2 = `IF population > 100 THEN
    mutation_rate := 0.05
  ELSE
    mutation_rate := 0.1`;
  console.log('ALGOL:');
  console.log(algolCode2);
  
  return orchestrator.send('compiler', {
    type: 'compile',
    payload: {
      source: algolCode2,
      language: 'algol'
    }
  });
}).then(result => {
  console.log('Result:', result);
  if (result.success) {
    console.log('✓ Compiled successfully:');
    console.log(result.payload.lisp);
  } else {
    console.log('✗ Compilation failed:', result.payload.errors);
  }
  console.log('');
  
  // Test 3: Error handling
  console.log('Test 3: Error Handling');
  const invalidCode = 'IF population > 100 mutation_rate := 0.05'; // Missing THEN
  console.log(`ALGOL: ${invalidCode}`);
  
  return orchestrator.send('compiler', {
    type: 'compile',
    payload: {
      source: invalidCode,
      language: 'algol'
    }
  });
}).then(result => {
  console.log('Result:', result);
  if (!result.success) {
    console.log('✓ Error handling works correctly');
    console.log('Errors:', result.payload.errors);
  } else {
    console.log('✗ Should have failed but succeeded');
  }
  console.log('');
  
  // Test 4: Message validation
  console.log('Test 4: Message Validation');
  console.log('Sending invalid message (missing source)');
  
  return orchestrator.send('compiler', {
    type: 'compile',
    payload: {
      language: 'algol'
      // Missing source field
    }
  });
}).then(result => {
  console.log('Result:', result);
  if (!result.success) {
    console.log('✓ Message validation works correctly');
    console.log('Errors:', result.payload.errors);
  } else {
    console.log('✗ Should have failed validation');
  }
  console.log('');
  
  console.log('=== All Tests Complete ===');
}).catch(error => {
  console.error('Test failed with error:', error);
});
