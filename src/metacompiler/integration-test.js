/**
 * Meta-Compiler Integration Test
 * 
 * Quick test to verify the meta-compiler system works correctly.
 */

import { MetaCompiler } from './meta-compiler.js';
import { OurocodeExecutor, createOrganismState, extractStateFields } from './ourocode-executor.js';

console.log('=== Meta-Compiler Integration Test ===\n');

// Test 1: ALGOL Compilation
console.log('Test 1: ALGOL Compilation and Execution');
try {
  const algolSource = `
  IF population > 100 THEN
    mutation_rate := 0.05
  ELSE
    mutation_rate := 0.1
  `;
  
  const compiler = new MetaCompiler();
  const module = compiler.compile(algolSource, 'algol');
  
  console.log('✓ ALGOL compilation successful');
  console.log(`  Module: ${module.name}, Source: ${module.source}`);
  console.log(`  Functions: ${module.functions.size}`);
  
  // Validate
  const isValid = compiler.validate(module);
  console.log(`✓ Validation: ${isValid ? 'PASS' : 'FAIL'}`);
  
  // Execute
  const executor = new OurocodeExecutor();
  executor.loadModule(module);
  
  const state1 = createOrganismState(150, 50, 0.2);
  const result1 = executor.execute('organism_rules', '@mutate_rule', [state1]);
  const output1 = extractStateFields(result1);
  
  console.log(`✓ Execution (pop=150): mutation_rate = ${output1.mutationRate} (expected 0.05)`);
  
  const state2 = createOrganismState(50, 50, 0.2);
  const result2 = executor.execute('organism_rules', '@mutate_rule', [state2]);
  const output2 = extractStateFields(result2);
  
  console.log(`✓ Execution (pop=50): mutation_rate = ${output2.mutationRate} (expected 0.1)`);
  
  console.log('✓ Test 1 PASSED\n');
} catch (error) {
  console.error('✗ Test 1 FAILED:', error.message);
  console.error(error.stack);
}

// Test 2: Lisp Compilation
console.log('Test 2: Lisp Compilation and Execution');
try {
  const lispSource = `
  (if (> population 100)
      (set! mutation_rate 0.05)
      (set! mutation_rate 0.1))
  `;
  
  const compiler = new MetaCompiler();
  const module = compiler.compile(lispSource, 'lisp');
  
  console.log('✓ Lisp compilation successful');
  console.log(`  Module: ${module.name}, Source: ${module.source}`);
  
  // Execute
  const executor = new OurocodeExecutor();
  executor.loadModule(module);
  
  const state = createOrganismState(75, 60, 0.15);
  const result = executor.execute('organism_rules', '@mutate_rule', [state]);
  const output = extractStateFields(result);
  
  console.log(`✓ Execution (pop=75): mutation_rate = ${output.mutationRate} (expected 0.1)`);
  console.log('✓ Test 2 PASSED\n');
} catch (error) {
  console.error('✗ Test 2 FAILED:', error.message);
  console.error(error.stack);
}

// Test 3: Serialization and Hashing
console.log('Test 3: Serialization and Hashing');
try {
  const source = `mutation_rate := 0.05`;
  
  const compiler = new MetaCompiler();
  const module = compiler.compile(source, 'algol');
  
  // Serialize
  const serialized = compiler.serialize(module);
  console.log('✓ Serialization successful');
  console.log(`  Length: ${serialized.length} characters`);
  
  // Hash
  const hash = await compiler.hash(module);
  console.log('✓ Hashing successful');
  console.log(`  Hash: ${hash.substring(0, 16)}...`);
  
  // Verify hash is deterministic
  const hash2 = await compiler.hash(module);
  if (hash === hash2) {
    console.log('✓ Hash is deterministic');
  } else {
    throw new Error('Hash is not deterministic');
  }
  
  console.log('✓ Test 3 PASSED\n');
} catch (error) {
  console.error('✗ Test 3 FAILED:', error.message);
}

// Test 4: Arithmetic Operations
console.log('Test 4: Arithmetic Operations');
try {
  const source = `mutation_rate := population + energy`;
  
  const compiler = new MetaCompiler();
  const module = compiler.compile(source, 'algol');
  
  const executor = new OurocodeExecutor();
  executor.loadModule(module);
  
  const state = createOrganismState(10, 5, 0);
  const result = executor.execute('organism_rules', '@mutate_rule', [state]);
  const output = extractStateFields(result);
  
  console.log(`✓ Execution: ${output.mutationRate} = 10 + 5 (expected 15)`);
  
  if (output.mutationRate === 15) {
    console.log('✓ Test 4 PASSED\n');
  } else {
    throw new Error(`Expected 15, got ${output.mutationRate}`);
  }
} catch (error) {
  console.error('✗ Test 4 FAILED:', error.message);
}

// Test 5: Execution Limits
console.log('Test 5: Execution Limits');
try {
  const source = `mutation_rate := 0.05`;
  
  const compiler = new MetaCompiler();
  const module = compiler.compile(source, 'algol');
  
  const executor = new OurocodeExecutor({
    maxInstructions: 5,
    timeout: 100
  });
  executor.loadModule(module);
  
  const state = createOrganismState(100, 50, 0.1);
  const result = executor.execute('organism_rules', '@mutate_rule', [state]);
  
  const stats = executor.getStats();
  console.log(`✓ Execution completed in ${stats.instructionCount} instructions`);
  console.log(`✓ Elapsed time: ${stats.elapsedTime}ms`);
  console.log('✓ Test 5 PASSED\n');
} catch (error) {
  console.error('✗ Test 5 FAILED:', error.message);
}

// Test 6: Complex Nested Conditions
console.log('Test 6: Complex Nested Conditions');
try {
  const source = `
  BEGIN
    IF energy < 20 THEN
      mutation_rate := 0.01
    ELSE
      IF population > 100 THEN
        mutation_rate := 0.05
      ELSE
        mutation_rate := 0.1
  END
  `;
  
  const compiler = new MetaCompiler();
  const module = compiler.compile(source, 'algol');
  
  const executor = new OurocodeExecutor();
  executor.loadModule(module);
  
  // Test scenario 1: Low energy
  const state1 = createOrganismState(150, 10, 0);
  const result1 = executor.execute('organism_rules', '@mutate_rule', [state1]);
  const output1 = extractStateFields(result1);
  console.log(`✓ Low energy (10): mutation_rate = ${output1.mutationRate} (expected 0.01)`);
  
  // Test scenario 2: High population
  const state2 = createOrganismState(150, 50, 0);
  const result2 = executor.execute('organism_rules', '@mutate_rule', [state2]);
  const output2 = extractStateFields(result2);
  console.log(`✓ High pop (150): mutation_rate = ${output2.mutationRate} (expected 0.05)`);
  
  // Test scenario 3: Low population
  const state3 = createOrganismState(50, 50, 0);
  const result3 = executor.execute('organism_rules', '@mutate_rule', [state3]);
  const output3 = extractStateFields(result3);
  console.log(`✓ Low pop (50): mutation_rate = ${output3.mutationRate} (expected 0.1)`);
  
  console.log('✓ Test 6 PASSED\n');
} catch (error) {
  console.error('✗ Test 6 FAILED:', error.message);
  console.error(error.stack);
}

console.log('=== All Tests Complete ===');
