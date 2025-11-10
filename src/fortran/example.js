/**
 * Example usage of FortranEngine
 * 
 * Demonstrates how to load and use the Fortran WASM numeric engine
 */

import { FortranEngine } from './fortran-engine.js';

async function runExamples() {
  console.log('=== FortranEngine Examples ===\n');

  // Load the Fortran WASM module
  console.log('Loading Fortran WASM module...');
  const engine = await FortranEngine.load('/wasm/fortran_engine.js');
  
  const status = engine.getStatus();
  console.log('Engine status:', status);
  console.log('Using fallback:', engine.isFallback() ? 'Yes (JavaScript)' : 'No (WASM)');
  console.log();

  // Example 1: Integrate differential equations
  console.log('--- Example 1: Integration ---');
  const state = new Float64Array([1.0, 2.0, 3.0, 4.0, 5.0]);
  const dt = 0.1;
  
  console.log('Initial state:', Array.from(state));
  console.log('Time step:', dt);
  
  const integrated = engine.integrate(state, dt);
  console.log('Integrated state:', Array.from(integrated));
  console.log('Expected (approx):', Array.from(state.map(x => x + dt * 0.1 * x)));
  console.log();

  // Example 2: Logistic growth
  console.log('--- Example 2: Logistic Growth ---');
  const population = 50;
  const growthRate = 0.1;
  const capacity = 100;
  
  console.log('Population:', population);
  console.log('Growth rate:', growthRate);
  console.log('Capacity:', capacity);
  
  const growth = engine.logisticGrowth(population, growthRate, capacity);
  console.log('Growth value:', growth);
  console.log('Expected:', growthRate * population * (1 - population / capacity));
  console.log();

  // Example 3: Mutation probability
  console.log('--- Example 3: Mutation Probability ---');
  const energy = 10.0;
  const baseRate = 0.1;
  const temperature = 5.0;
  
  console.log('Energy:', energy);
  console.log('Base rate:', baseRate);
  console.log('Temperature:', temperature);
  
  const mutProb = engine.mutationProb(energy, baseRate, temperature);
  console.log('Mutation probability:', mutProb);
  console.log('Expected:', baseRate * Math.exp(-energy / temperature));
  console.log();

  // Example 4: Edge cases
  console.log('--- Example 4: Edge Cases ---');
  
  // NaN handling
  const nanState = new Float64Array([1.0, NaN, 3.0]);
  const nanResult = engine.integrate(nanState, 0.1);
  console.log('NaN in state:', Array.from(nanState));
  console.log('Result (NaN → 0):', Array.from(nanResult));
  
  // Infinity handling
  const infGrowth = engine.logisticGrowth(Infinity, 0.1, 100);
  console.log('Logistic growth with Infinity:', infGrowth, '(should be 0)');
  
  // Zero capacity
  const zeroCapGrowth = engine.logisticGrowth(50, 0.1, 0);
  console.log('Logistic growth with zero capacity:', zeroCapGrowth, '(should be 0)');
  
  // Zero temperature
  const zeroTempProb = engine.mutationProb(10, 0.1, 0);
  console.log('Mutation prob with zero temperature:', zeroTempProb, '(should be base rate)');
  console.log();

  // Example 5: Performance test
  console.log('--- Example 5: Performance Test ---');
  const largeState = new Float64Array(1000).fill(1.0);
  
  const startTime = performance.now();
  const largeResult = engine.integrate(largeState, 0.01);
  const duration = performance.now() - startTime;
  
  console.log('Integrated 1000 elements in', duration.toFixed(3), 'ms');
  console.log('Target: <16ms');
  console.log('Status:', duration < 16 ? '✓ PASS' : '✗ FAIL');
  console.log();

  // Example 6: Multiple iterations
  console.log('--- Example 6: Evolution Simulation ---');
  let evolveState = new Float64Array([10.0, 20.0, 30.0]);
  console.log('Initial state:', Array.from(evolveState));
  
  for (let step = 0; step < 5; step++) {
    evolveState = engine.integrate(evolveState, 0.1);
    const pop = evolveState[0];
    const growth = engine.logisticGrowth(pop, 0.05, 100);
    const mutProb = engine.mutationProb(evolveState[1], 0.1, 10);
    
    console.log(`Step ${step + 1}:`, {
      state: Array.from(evolveState).map(x => x.toFixed(2)),
      growth: growth.toFixed(4),
      mutationProb: mutProb.toFixed(4)
    });
  }
  
  console.log('\n=== Examples Complete ===');
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export { runExamples };
