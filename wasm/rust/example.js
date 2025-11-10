/**
 * Example usage of the Rust Orchestrator WASM module
 * 
 * This file demonstrates how to use the OrganismState and RuleRegistry
 * from JavaScript after the WASM module has been built.
 */

// Import the WASM module (path will be different after build)
// import init, { OrganismState, RuleRegistry, applyRule } from '../../public/wasm/rust/ouroboros_rust.js';

async function example() {
  // Initialize the WASM module
  // await init();
  
  console.log('=== Organism State Example ===');
  
  // Create a new organism
  // const organism = new OrganismState();
  // console.log('Initial population:', organism.population);
  // console.log('Initial energy:', organism.energy);
  // console.log('Initial mutation rate:', organism.mutationRate);
  
  // Perform evolution steps
  // for (let i = 0; i < 10; i++) {
  //   const score = organism.step(0.1);
  //   console.log(`Step ${i + 1}: Population=${organism.population.toFixed(2)}, Energy=${organism.energy.toFixed(2)}, Score=${score.toFixed(3)}`);
  // }
  
  // Get state snapshot
  // const snapshot = organism.getSnapshot();
  // console.log('State snapshot:', snapshot);
  
  // Create new organism and load snapshot
  // const organism2 = new OrganismState();
  // organism2.loadSnapshot(snapshot);
  // console.log('Loaded population:', organism2.population);
  
  console.log('\n=== Rule Registry Example ===');
  
  // Create rule registry
  // const registry = new RuleRegistry();
  
  // Register some rules
  // registry.registerRule('growth', '(lambda (state) (set! population (+ population 10)))');
  // registry.registerRule('decay', '(lambda (state) (set! energy (- energy 5)))');
  // registry.registerRule('mutate', '(lambda (state) (set! mutation-rate (+ mutation-rate 0.01)))');
  
  // console.log('Rule count:', registry.getRuleCount());
  // console.log('Rule IDs:', registry.getRuleIds());
  
  // Apply rules
  // const organism3 = new OrganismState();
  // console.log('Before rules - Population:', organism3.population);
  
  // const result1 = applyRule(registry, organism3, 'growth', [1.0]);
  // console.log('After growth rule - Population:', organism3.population);
  
  // const result2 = applyRule(registry, organism3, 'mutate', [0.5]);
  // console.log('After mutate rule - Mutation rate:', organism3.mutationRate);
  
  // Get rule statistics
  // const stats = registry.getRuleStats('growth');
  // console.log('Growth rule stats:', JSON.parse(stats));
  
  // Get all statistics
  // const allStats = registry.getAllStats();
  // console.log('All rule stats:', JSON.parse(allStats));
  
  console.log('\n=== Configuration Example ===');
  
  // Initialize from JSON config
  // const config = JSON.stringify({
  //   population: 200.0,
  //   energy: 2000.0,
  //   generation: 5,
  //   age: 100,
  //   mutation_rate: 0.05,
  //   selection_pressure: 0.7,
  //   adaptation_score: 0.5
  // });
  
  // const organism4 = OrganismState.initFromConfig(config);
  // console.log('Configured population:', organism4.population);
  // console.log('Configured generation:', organism4.generation);
  
  console.log('\n=== Export/Import Example ===');
  
  // Export registry
  // const registryExport = registry.exportRegistry();
  // console.log('Exported registry:', registryExport);
  
  // Import into new registry
  // const registry2 = new RuleRegistry();
  // registry2.importRegistry(registryExport);
  // console.log('Imported rule count:', registry2.getRuleCount());
  
  console.log('\n=== State Vector Example ===');
  
  // Work with state vectors for Fortran integration
  // const organism5 = new OrganismState();
  // const vector = organism5.getStateVector();
  // console.log('State vector:', vector);
  
  // Modify vector
  // vector[0] = 150.0; // population
  // vector[1] = 1500.0; // energy
  // vector[2] = 0.02; // mutation_rate
  
  // Update organism with modified vector
  // organism5.setStateVector(vector);
  // console.log('Updated population:', organism5.population);
  // console.log('Updated energy:', organism5.energy);
}

// Run the example
// Uncomment when WASM module is built
// example().catch(console.error);

console.log('Example code ready. Build the WASM module first with: npm run build:rust');
console.log('Then uncomment the code in this file to run the examples.');
