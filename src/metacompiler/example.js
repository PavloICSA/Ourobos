/**
 * Meta-Compiler Example
 * 
 * Demonstrates compiling ALGOL and Lisp to Ourocode and executing it.
 */

import { MetaCompiler } from './meta-compiler.js';
import { OurocodeExecutor, createOrganismState, extractStateFields } from './ourocode-executor.js';

// Example 1: Compile ALGOL to Ourocode
console.log('=== Example 1: ALGOL to Ourocode ===\n');

const algolSource = `
IF population > 100 THEN
  mutation_rate := 0.05
ELSE
  mutation_rate := 0.1
`;

const compiler = new MetaCompiler();

try {
  // Compile ALGOL to Ourocode
  const module = compiler.compile(algolSource, 'algol');
  
  console.log('Compiled Ourocode:');
  console.log(compiler.serialize(module));
  
  // Generate hash for blockchain validation
  const hash = await compiler.hash(module);
  console.log(`\nOurocode Hash: ${hash}\n`);
  
  // Validate Ourocode
  const isValid = compiler.validate(module);
  console.log(`Validation: ${isValid ? 'PASS' : 'FAIL'}\n`);
  
  // Execute Ourocode
  const executor = new OurocodeExecutor();
  executor.loadModule(module);
  
  // Test with high population
  console.log('--- Test 1: High Population (150) ---');
  let state = createOrganismState(150, 50, 0.2);
  console.log('Input state:', extractStateFields(state));
  
  let result = executor.execute('organism_rules', '@mutate_rule', [state]);
  console.log('Output state:', extractStateFields(result));
  console.log('Expected mutation_rate: 0.05\n');
  
  // Test with low population
  console.log('--- Test 2: Low Population (50) ---');
  state = createOrganismState(50, 50, 0.2);
  console.log('Input state:', extractStateFields(state));
  
  result = executor.execute('organism_rules', '@mutate_rule', [state]);
  console.log('Output state:', extractStateFields(result));
  console.log('Expected mutation_rate: 0.1\n');
  
  // Show execution stats
  console.log('Execution stats:', executor.getStats());
  
} catch (error) {
  console.error('Error:', error.message);
}

// Example 2: Compile Lisp to Ourocode
console.log('\n\n=== Example 2: Lisp to Ourocode ===\n');

const lispSource = `
(if (> population 100)
    (set! mutation_rate 0.05)
    (set! mutation_rate 0.1))
`;

try {
  // Compile Lisp to Ourocode
  const module = compiler.compile(lispSource, 'lisp');
  
  console.log('Compiled Ourocode:');
  console.log(compiler.serialize(module));
  
  // Execute Ourocode
  const executor = new OurocodeExecutor();
  executor.loadModule(module);
  
  // Test execution
  console.log('--- Test: Population 75 ---');
  const state = createOrganismState(75, 60, 0.15);
  console.log('Input state:', extractStateFields(state));
  
  const result = executor.execute('organism_rules', '@mutate_rule', [state]);
  console.log('Output state:', extractStateFields(result));
  console.log('Expected mutation_rate: 0.1\n');
  
} catch (error) {
  console.error('Error:', error.message);
}

// Example 3: Complex ALGOL with multiple conditions
console.log('\n\n=== Example 3: Complex ALGOL Rules ===\n');

const complexAlgol = `
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

try {
  const module = compiler.compile(complexAlgol, 'algol');
  
  console.log('Compiled Ourocode:');
  console.log(compiler.serialize(module));
  
  const executor = new OurocodeExecutor();
  executor.loadModule(module);
  
  // Test various scenarios
  const scenarios = [
    { pop: 150, energy: 50, expected: 0.05, desc: 'High pop, normal energy' },
    { pop: 50, energy: 50, expected: 0.1, desc: 'Low pop, normal energy' },
    { pop: 150, energy: 10, expected: 0.01, desc: 'High pop, low energy' },
    { pop: 50, energy: 10, expected: 0.01, desc: 'Low pop, low energy' }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.desc} ---`);
    const state = createOrganismState(scenario.pop, scenario.energy, 0.2);
    console.log('Input:', extractStateFields(state));
    
    const result = executor.execute('organism_rules', '@mutate_rule', [state]);
    const output = extractStateFields(result);
    console.log('Output:', output);
    console.log(`Expected: ${scenario.expected}, Got: ${output.mutationRate}`);
    console.log(`Result: ${output.mutationRate === scenario.expected ? 'PASS' : 'FAIL'}`);
  }
  
} catch (error) {
  console.error('Error:', error.message);
}

// Example 4: Arithmetic operations
console.log('\n\n=== Example 4: Arithmetic Operations ===\n');

const arithmeticAlgol = `
mutation_rate := (population + energy) / 200
`;

try {
  const module = compiler.compile(arithmeticAlgol, 'algol');
  
  console.log('Compiled Ourocode:');
  console.log(compiler.serialize(module));
  
  const executor = new OurocodeExecutor();
  executor.loadModule(module);
  
  const state = createOrganismState(100, 50, 0.1);
  console.log('Input state:', extractStateFields(state));
  
  const result = executor.execute('organism_rules', '@mutate_rule', [state]);
  const output = extractStateFields(result);
  console.log('Output state:', output);
  console.log(`Calculation: (100 + 50) / 200 = ${output.mutationRate}`);
  
} catch (error) {
  console.error('Error:', error.message);
}

// Example 5: Execution limits
console.log('\n\n=== Example 5: Execution Limits ===\n');

try {
  // Create executor with strict limits
  const strictExecutor = new OurocodeExecutor({
    maxInstructions: 10,
    timeout: 100
  });
  
  const module = compiler.compile(complexAlgol, 'algol');
  strictExecutor.loadModule(module);
  
  const state = createOrganismState(100, 50, 0.1);
  const result = strictExecutor.execute('organism_rules', '@mutate_rule', [state]);
  
  console.log('Execution succeeded within limits');
  console.log('Stats:', strictExecutor.getStats());
  
} catch (error) {
  console.error('Execution limit exceeded:', error.message);
}

// Example 6: Blockchain integration preview
console.log('\n\n=== Example 6: Blockchain Integration ===\n');

const blockchainExample = async () => {
  const source = `
  IF population > 100 THEN
    mutation_rate := 0.05
  ELSE
    mutation_rate := 0.1
  `;
  
  // Compile to Ourocode
  const module = compiler.compile(source, 'algol');
  
  // Generate hashes for blockchain
  const ourocodeHash = await compiler.hash(module);
  const genomeHash = await generateGenomeHash(module, [100, 50, 0.1]);
  
  console.log('Blockchain Proposal:');
  console.log(`  Ourocode Hash: ${ourocodeHash}`);
  console.log(`  Genome Hash: ${genomeHash}`);
  console.log(`  Source Language: ${module.source}`);
  console.log(`  Module Version: ${module.version}`);
  
  // Simulate blockchain validation
  const isValid = compiler.validate(module);
  console.log(`\nOn-chain Validation: ${isValid ? 'APPROVED' : 'REJECTED'}`);
  
  if (isValid) {
    console.log('\nProposal can be submitted to DAO for voting');
  }
};

// Helper function to generate genome hash
async function generateGenomeHash(module, state) {
  const combined = JSON.stringify({
    state,
    ourocodeHash: await compiler.hash(module)
  });
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

await blockchainExample();

console.log('\n\n=== All Examples Complete ===\n');
