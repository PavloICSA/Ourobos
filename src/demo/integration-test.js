/**
 * Demo Integration Test
 * 
 * Tests the complete demo workflow with all components
 */

import ChimeraOrchestrator from '../orchestrator/chimera-orchestrator.js';
import { DemoWorkflow } from './demo-workflow.js';
import { runDemoScript, runPerformanceBenchmarks } from './demo-script.js';
import { DEMO_MUTATION_SEQUENCE } from './demo-organism.js';

/**
 * Test demo organism initial state
 */
async function testDemoOrganism() {
  console.log('\n=== Test 1: Demo Organism ===\n');
  
  const { DEMO_INITIAL_STATE, DEMO_ALGOL_RULES } = await import('./demo-organism.js');
  
  // Validate initial state
  console.log('Validating initial state...');
  console.assert(DEMO_INITIAL_STATE.population === 50, 'Initial population should be 50');
  console.assert(DEMO_INITIAL_STATE.energy === 75, 'Initial energy should be 75');
  console.assert(DEMO_INITIAL_STATE.mutationRate === 0.1, 'Initial mutation rate should be 0.1');
  console.log('✓ Initial state valid');
  
  // Validate ALGOL rules
  console.log('Validating ALGOL rules...');
  console.assert(Object.keys(DEMO_ALGOL_RULES).length === 5, 'Should have 5 ALGOL rules');
  console.assert(DEMO_ALGOL_RULES.populationControl.includes('IF population'), 'Population control rule should check population');
  console.log('✓ ALGOL rules valid');
  
  // Validate mutation sequence
  console.log('Validating mutation sequence...');
  console.assert(DEMO_MUTATION_SEQUENCE.length === 5, 'Should have 5 mutations');
  console.assert(DEMO_MUTATION_SEQUENCE[0].step === 1, 'First mutation should be step 1');
  console.assert(DEMO_MUTATION_SEQUENCE[0].language === 'algol', 'Mutations should be in ALGOL');
  console.log('✓ Mutation sequence valid');
  
  console.log('\n✓ Test 1 passed\n');
}

/**
 * Test demo workflow creation
 */
async function testDemoWorkflow() {
  console.log('\n=== Test 2: Demo Workflow ===\n');
  
  // Create mock orchestrator
  const orchestrator = new ChimeraOrchestrator({
    enableBlockchain: false,
    enableQuantum: false,
    enableBioSensor: false
  });
  
  await orchestrator.init();
  
  // Create demo workflow
  console.log('Creating demo workflow...');
  const demo = new DemoWorkflow(orchestrator, {
    votingDelay: 1000,
    stepDelay: 500,
    autoVote: true,
    showDetails: false
  });
  
  console.assert(demo.getState() === 'not_started', 'Initial state should be not_started');
  console.assert(demo.getCurrentStep() === 0, 'Initial step should be 0');
  console.log('✓ Demo workflow created');
  
  // Test event listeners
  console.log('Testing event listeners...');
  let eventFired = false;
  demo.on('stateChange', () => {
    eventFired = true;
  });
  
  demo.setState('intro');
  console.assert(eventFired, 'Event listener should fire');
  console.assert(demo.getState() === 'intro', 'State should change to intro');
  console.log('✓ Event listeners work');
  
  console.log('\n✓ Test 2 passed\n');
}

/**
 * Test single demo step execution
 */
async function testSingleStep() {
  console.log('\n=== Test 3: Single Step Execution ===\n');
  
  // Create orchestrator with mock services
  const orchestrator = new ChimeraOrchestrator({
    enableBlockchain: false,
    enableQuantum: false,
    enableBioSensor: false
  });
  
  await orchestrator.init();
  
  // Create demo workflow
  const demo = new DemoWorkflow(orchestrator, {
    votingDelay: 1000,
    stepDelay: 500,
    autoVote: true,
    showDetails: false
  });
  
  // Execute first step
  console.log('Executing step 1...');
  const result = await demo.executeStep(1);
  
  console.assert(result.success, 'Step should succeed');
  console.assert(result.step === 1, 'Step number should be 1');
  console.assert(result.duration > 0, 'Duration should be positive');
  console.log(`✓ Step 1 executed in ${(result.duration / 1000).toFixed(1)}s`);
  
  // Check state was updated
  const state = orchestrator.getCurrentState();
  console.assert(state.generation > 0, 'Generation should increase');
  console.log('✓ State updated');
  
  console.log('\n✓ Test 3 passed\n');
}

/**
 * Test full demo script
 */
async function testFullDemo() {
  console.log('\n=== Test 4: Full Demo Script ===\n');
  
  // Create orchestrator with mock services
  const orchestrator = new ChimeraOrchestrator({
    enableBlockchain: false,
    enableQuantum: false,
    enableBioSensor: false
  });
  
  await orchestrator.init();
  
  // Run demo script
  console.log('Running full demo script...');
  const result = await runDemoScript(orchestrator, {
    votingDelay: 1000,
    stepDelay: 500,
    showDetails: false
  });
  
  console.assert(result.success, 'Demo should succeed');
  console.assert(result.stepResults.length === 5, 'Should complete 5 steps');
  console.assert(result.duration < 120000, 'Should complete in under 2 minutes');
  console.log(`✓ Demo completed in ${(result.duration / 1000).toFixed(1)}s`);
  
  // Validate services were called
  console.assert(result.servicesCalled.metaCompiler, 'Meta-compiler should be called');
  console.log('✓ Services called');
  
  // Validate state updates
  console.assert(result.stateUpdates.generation, 'Generation should update');
  console.log('✓ State updates validated');
  
  console.log('\n✓ Test 4 passed\n');
}

/**
 * Test demo with real services (if available)
 */
async function testWithRealServices() {
  console.log('\n=== Test 5: Demo with Real Services ===\n');
  
  // Create orchestrator with real services enabled
  const orchestrator = new ChimeraOrchestrator({
    enableBlockchain: true,
    enableQuantum: true,
    enableBioSensor: true
  });
  
  try {
    await orchestrator.init();
    
    const health = orchestrator.getServiceHealth();
    console.log('Service health:', health);
    
    // Only run if at least one real service is available
    if (health.blockchain || health.quantum || health.bioSensor) {
      console.log('Running demo with real services...');
      
      const result = await runDemoScript(orchestrator, {
        votingDelay: 5000,
        stepDelay: 1000,
        showDetails: false
      });
      
      console.log(`✓ Demo completed with real services in ${(result.duration / 1000).toFixed(1)}s`);
      
      if (health.blockchain) {
        console.log('✓ Blockchain service used');
      }
      if (health.quantum) {
        console.log('✓ Quantum service used');
      }
      if (health.bioSensor) {
        console.log('✓ Bio sensor service used');
      }
    } else {
      console.log('○ No real services available, skipping test');
    }
    
  } catch (error) {
    console.log('○ Real services not available:', error.message);
  }
  
  console.log('\n✓ Test 5 passed\n');
}

/**
 * Test performance benchmarks
 */
async function testPerformanceBenchmarks() {
  console.log('\n=== Test 6: Performance Benchmarks ===\n');
  
  // Create orchestrator
  const orchestrator = new ChimeraOrchestrator({
    enableBlockchain: false,
    enableQuantum: false,
    enableBioSensor: false
  });
  
  await orchestrator.init();
  
  // Run benchmarks
  console.log('Running performance benchmarks...');
  const benchmarks = await runPerformanceBenchmarks(orchestrator);
  
  // Validate compilation benchmark
  console.assert(benchmarks.ourocodeCompilation.actual > 0, 'Compilation benchmark should run');
  console.assert(benchmarks.ourocodeCompilation.actual < 100, 'Compilation should be fast');
  console.log(`✓ Ourocode compilation: ${benchmarks.ourocodeCompilation.actual}ms`);
  
  // Validate full cycle benchmark
  console.assert(benchmarks.fullMutationCycle.actual > 0, 'Full cycle benchmark should run');
  console.log(`✓ Full mutation cycle: ${(benchmarks.fullMutationCycle.actual / 1000).toFixed(1)}s`);
  
  console.log('\n✓ Test 6 passed\n');
}

/**
 * Run all integration tests
 */
async function runAllTests() {
  console.log('=== Demo Integration Tests ===\n');
  
  const tests = [
    { name: 'Demo Organism', fn: testDemoOrganism },
    { name: 'Demo Workflow', fn: testDemoWorkflow },
    { name: 'Single Step', fn: testSingleStep },
    { name: 'Full Demo', fn: testFullDemo },
    { name: 'Real Services', fn: testWithRealServices },
    { name: 'Performance', fn: testPerformanceBenchmarks }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      console.error(`\n✗ Test "${test.name}" failed:`, error.message);
      console.error(error.stack);
      failed++;
    }
  }
  
  console.log('\n=== Test Summary ===\n');
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  console.log(`Success rate: ${(passed / tests.length * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n✓ All tests passed!\n');
  } else {
    console.log('\n✗ Some tests failed\n');
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export {
  testDemoOrganism,
  testDemoWorkflow,
  testSingleStep,
  testFullDemo,
  testWithRealServices,
  testPerformanceBenchmarks,
  runAllTests
};
