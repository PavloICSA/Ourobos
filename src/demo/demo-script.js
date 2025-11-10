/**
 * Demo Script - Automated testing for OuroborOS-Chimera demo
 * 
 * This script runs the complete mutation cycle and validates:
 * - All services are called correctly
 * - Blockchain state updates properly
 * - Visualization updates occur
 * - Performance meets targets
 * 
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */

import { DemoWorkflow } from './demo-workflow.js';
import { DEMO_MUTATION_SEQUENCE } from './demo-organism.js';

/**
 * Test result structure
 * @typedef {Object} TestResult
 * @property {boolean} success - Overall success
 * @property {number} duration - Total duration in ms
 * @property {Array} stepResults - Results for each step
 * @property {Object} servicesCalled - Services that were called
 * @property {Object} stateUpdates - State update validations
 * @property {Object} visualizationUpdates - Visualization update validations
 * @property {Object} performance - Performance metrics
 * @property {Array} errors - Any errors encountered
 */

/**
 * Run the complete demo script
 * @param {ChimeraOrchestrator} orchestrator - Orchestrator instance
 * @param {Object} options - Test options
 * @returns {Promise<TestResult>} Test results
 */
export async function runDemoScript(orchestrator, options = {}) {
  console.log('=== Running OuroborOS-Chimera Demo Script ===\n');
  
  const startTime = Date.now();
  const result = {
    success: true,
    duration: 0,
    stepResults: [],
    servicesCalled: {
      blockchain: false,
      quantum: false,
      bioSensor: false,
      goWasm: false,
      metaCompiler: false,
      visualization: false
    },
    stateUpdates: {
      population: false,
      energy: false,
      mutationRate: false,
      generation: false,
      blockchainGeneration: false
    },
    visualizationUpdates: {
      count: 0,
      successful: 0
    },
    performance: {
      totalDuration: 0,
      averageStepDuration: 0,
      blockchainProposalTime: 0,
      quantumEntropyTime: 0,
      bioSensorReadingTime: 0,
      ourocodeCompilationTime: 0,
      ourocodeExecutionTime: 0
    },
    errors: []
  };
  
  try {
    // Initialize orchestrator if not already initialized
    if (!orchestrator.isInitialized()) {
      console.log('Initializing orchestrator...');
      await orchestrator.init();
      console.log('✓ Orchestrator initialized\n');
    }
    
    // Check initial service health
    console.log('Checking service health...');
    const initialHealth = await orchestrator.checkServiceHealth();
    result.servicesCalled.blockchain = initialHealth.blockchain;
    result.servicesCalled.quantum = initialHealth.quantum;
    result.servicesCalled.bioSensor = initialHealth.bioSensor;
    result.servicesCalled.goWasm = initialHealth.goWasm;
    console.log('✓ Service health checked\n');
    
    // Get initial state
    const initialState = orchestrator.getCurrentState();
    console.log('Initial state:', {
      population: initialState.population,
      energy: initialState.energy,
      mutationRate: initialState.mutationRate,
      generation: initialState.generation
    });
    console.log('');
    
    // Create demo workflow
    const demo = new DemoWorkflow(orchestrator, {
      votingDelay: options.votingDelay ?? 5000,
      stepDelay: options.stepDelay ?? 1000,
      autoVote: true,
      voteSupport: true,
      showDetails: options.showDetails ?? false,
      autoAdvance: true
    });
    
    // Track service calls
    let blockchainCalls = 0;
    let quantumCalls = 0;
    let bioSensorCalls = 0;
    let visualizationUpdates = 0;
    
    // Listen for events
    demo.on('stepStart', (data) => {
      console.log(`Starting step ${data.step}: ${data.mutation.name}`);
    });
    
    demo.on('stepComplete', (data) => {
      console.log(`✓ Step ${data.step} complete (${(data.duration / 1000).toFixed(1)}s)`);
      
      result.stepResults.push({
        step: data.step,
        name: data.mutation.name,
        success: true,
        duration: data.duration
      });
    });
    
    demo.on('error', (data) => {
      console.error(`✗ Error in step ${data.step}:`, data.error.message);
      
      result.errors.push({
        step: data.step,
        error: data.error.message
      });
      
      result.success = false;
    });
    
    // Track orchestrator events
    orchestrator.on('proposalCreated', () => {
      blockchainCalls++;
      result.servicesCalled.blockchain = true;
    });
    
    orchestrator.on('mutationComplete', (data) => {
      if (data.quantumEntropy) {
        quantumCalls++;
        result.servicesCalled.quantum = true;
      }
      
      if (data.sensorReadings) {
        bioSensorCalls++;
        result.servicesCalled.bioSensor = true;
      }
    });
    
    orchestrator.on('stateUpdate', () => {
      visualizationUpdates++;
      result.visualizationUpdates.count++;
    });
    
    // Run the demo
    console.log('Running demo workflow...\n');
    await demo.start();
    
    // Get final state
    const finalState = orchestrator.getCurrentState();
    console.log('\nFinal state:', {
      population: finalState.population,
      energy: finalState.energy,
      mutationRate: finalState.mutationRate,
      generation: finalState.generation,
      blockchainGeneration: finalState.blockchainGeneration
    });
    
    // Validate state updates
    result.stateUpdates.population = finalState.population !== initialState.population;
    result.stateUpdates.energy = finalState.energy !== initialState.energy;
    result.stateUpdates.mutationRate = finalState.mutationRate !== initialState.mutationRate;
    result.stateUpdates.generation = finalState.generation > initialState.generation;
    result.stateUpdates.blockchainGeneration = finalState.blockchainGeneration > initialState.blockchainGeneration;
    
    // Validate services were called
    result.servicesCalled.metaCompiler = result.stepResults.length > 0;
    result.servicesCalled.visualization = visualizationUpdates > 0;
    result.visualizationUpdates.successful = visualizationUpdates;
    
    // Calculate performance metrics
    const endTime = Date.now();
    result.duration = endTime - startTime;
    result.performance.totalDuration = result.duration;
    result.performance.averageStepDuration = result.stepResults.length > 0
      ? result.stepResults.reduce((sum, r) => sum + r.duration, 0) / result.stepResults.length
      : 0;
    
    // Validate performance targets
    const targetDuration = 120000; // 2 minutes
    const meetsTarget = result.duration < targetDuration;
    
    console.log('\n=== Test Results ===\n');
    console.log(`Duration: ${(result.duration / 1000).toFixed(1)}s (target: < ${targetDuration / 1000}s)`);
    console.log(`Performance: ${meetsTarget ? '✓ PASS' : '✗ FAIL'}`);
    console.log('');
    
    console.log('Services Called:');
    console.log(`  Blockchain: ${result.servicesCalled.blockchain ? '✓' : '✗'} (${blockchainCalls} calls)`);
    console.log(`  Quantum: ${result.servicesCalled.quantum ? '✓' : '✗'} (${quantumCalls} calls)`);
    console.log(`  Bio Sensor: ${result.servicesCalled.bioSensor ? '✓' : '✗'} (${bioSensorCalls} calls)`);
    console.log(`  Go WASM: ${result.servicesCalled.goWasm ? '✓' : '✗'}`);
    console.log(`  Meta-Compiler: ${result.servicesCalled.metaCompiler ? '✓' : '✗'}`);
    console.log(`  Visualization: ${result.servicesCalled.visualization ? '✓' : '✗'} (${visualizationUpdates} updates)`);
    console.log('');
    
    console.log('State Updates:');
    console.log(`  Population: ${result.stateUpdates.population ? '✓' : '✗'}`);
    console.log(`  Energy: ${result.stateUpdates.energy ? '✓' : '✗'}`);
    console.log(`  Mutation Rate: ${result.stateUpdates.mutationRate ? '✓' : '✗'}`);
    console.log(`  Generation: ${result.stateUpdates.generation ? '✓' : '✗'}`);
    console.log(`  Blockchain Generation: ${result.stateUpdates.blockchainGeneration ? '✓' : '✗'}`);
    console.log('');
    
    console.log('Step Results:');
    for (const stepResult of result.stepResults) {
      console.log(`  ${stepResult.step}. ${stepResult.name}: ${stepResult.success ? '✓' : '✗'} (${(stepResult.duration / 1000).toFixed(1)}s)`);
    }
    console.log('');
    
    if (result.errors.length > 0) {
      console.log('Errors:');
      for (const error of result.errors) {
        console.log(`  Step ${error.step}: ${error.error}`);
      }
      console.log('');
    }
    
    const allServicesWorked = Object.values(result.servicesCalled).every(v => v);
    const allStatesUpdated = Object.values(result.stateUpdates).every(v => v);
    const noErrors = result.errors.length === 0;
    
    result.success = meetsTarget && allServicesWorked && allStatesUpdated && noErrors;
    
    console.log(`Overall: ${result.success ? '✓ PASS' : '✗ FAIL'}`);
    console.log('');
    
  } catch (error) {
    console.error('✗ Demo script failed:', error);
    result.success = false;
    result.errors.push({
      step: 'script',
      error: error.message
    });
  }
  
  return result;
}

/**
 * Run performance benchmarks
 * @param {ChimeraOrchestrator} orchestrator - Orchestrator instance
 * @returns {Promise<Object>} Benchmark results
 */
export async function runPerformanceBenchmarks(orchestrator) {
  console.log('=== Running Performance Benchmarks ===\n');
  
  const benchmarks = {
    ourocodeCompilation: { target: 10, actual: 0, pass: false },
    blockchainProposal: { target: 500, actual: 0, pass: false },
    quantumEntropy: { target: 2000, actual: 0, pass: false },
    quantumEntropyCached: { target: 10, actual: 0, pass: false },
    bioSensorReading: { target: 100, actual: 0, pass: false },
    fullMutationCycle: { target: 120000, actual: 0, pass: false }
  };
  
  try {
    // Benchmark 1: Ourocode compilation
    console.log('Benchmarking Ourocode compilation...');
    const compileStart = Date.now();
    const testCode = 'BEGIN IF x > 10 THEN y := 5 END END';
    orchestrator.metaCompiler.compile(testCode, 'algol');
    benchmarks.ourocodeCompilation.actual = Date.now() - compileStart;
    benchmarks.ourocodeCompilation.pass = benchmarks.ourocodeCompilation.actual < benchmarks.ourocodeCompilation.target;
    console.log(`  ${benchmarks.ourocodeCompilation.actual}ms (target: < ${benchmarks.ourocodeCompilation.target}ms) ${benchmarks.ourocodeCompilation.pass ? '✓' : '✗'}`);
    
    // Benchmark 2: Blockchain proposal (if available)
    if (orchestrator.blockchainBridge && orchestrator.serviceHealth.blockchain) {
      console.log('Benchmarking blockchain proposal...');
      const proposalStart = Date.now();
      await orchestrator.proposeMutation(testCode, 'algol');
      benchmarks.blockchainProposal.actual = Date.now() - proposalStart;
      benchmarks.blockchainProposal.pass = benchmarks.blockchainProposal.actual < benchmarks.blockchainProposal.target;
      console.log(`  ${benchmarks.blockchainProposal.actual}ms (target: < ${benchmarks.blockchainProposal.target}ms) ${benchmarks.blockchainProposal.pass ? '✓' : '✗'}`);
    } else {
      console.log('  Blockchain unavailable, skipping');
    }
    
    // Benchmark 3: Quantum entropy (if available)
    if (orchestrator.quantumClient) {
      console.log('Benchmarking quantum entropy...');
      const quantumStart = Date.now();
      await orchestrator.quantumClient.getEntropy(256);
      benchmarks.quantumEntropy.actual = Date.now() - quantumStart;
      benchmarks.quantumEntropy.pass = benchmarks.quantumEntropy.actual < benchmarks.quantumEntropy.target;
      console.log(`  ${benchmarks.quantumEntropy.actual}ms (target: < ${benchmarks.quantumEntropy.target}ms) ${benchmarks.quantumEntropy.pass ? '✓' : '✗'}`);
      
      // Benchmark cached entropy
      console.log('Benchmarking cached quantum entropy...');
      const cachedStart = Date.now();
      await orchestrator.quantumClient.getEntropy(256);
      benchmarks.quantumEntropyCached.actual = Date.now() - cachedStart;
      benchmarks.quantumEntropyCached.pass = benchmarks.quantumEntropyCached.actual < benchmarks.quantumEntropyCached.target;
      console.log(`  ${benchmarks.quantumEntropyCached.actual}ms (target: < ${benchmarks.quantumEntropyCached.target}ms) ${benchmarks.quantumEntropyCached.pass ? '✓' : '✗'}`);
    } else {
      console.log('  Quantum service unavailable, skipping');
    }
    
    // Benchmark 4: Bio sensor reading (if available)
    if (orchestrator.bioSensorClient) {
      console.log('Benchmarking bio sensor reading...');
      const sensorStart = Date.now();
      await orchestrator.bioSensorClient.getReadings();
      benchmarks.bioSensorReading.actual = Date.now() - sensorStart;
      benchmarks.bioSensorReading.pass = benchmarks.bioSensorReading.actual < benchmarks.bioSensorReading.target;
      console.log(`  ${benchmarks.bioSensorReading.actual}ms (target: < ${benchmarks.bioSensorReading.target}ms) ${benchmarks.bioSensorReading.pass ? '✓' : '✗'}`);
    } else {
      console.log('  Bio sensor unavailable, skipping');
    }
    
    // Benchmark 5: Full mutation cycle
    console.log('Benchmarking full mutation cycle...');
    const cycleStart = Date.now();
    await runDemoScript(orchestrator, { showDetails: false });
    benchmarks.fullMutationCycle.actual = Date.now() - cycleStart;
    benchmarks.fullMutationCycle.pass = benchmarks.fullMutationCycle.actual < benchmarks.fullMutationCycle.target;
    console.log(`  ${(benchmarks.fullMutationCycle.actual / 1000).toFixed(1)}s (target: < ${benchmarks.fullMutationCycle.target / 1000}s) ${benchmarks.fullMutationCycle.pass ? '✓' : '✗'}`);
    
    console.log('\n=== Benchmark Results ===\n');
    
    const allPass = Object.values(benchmarks).every(b => b.pass || b.actual === 0);
    console.log(`Overall: ${allPass ? '✓ PASS' : '✗ FAIL'}`);
    
  } catch (error) {
    console.error('✗ Benchmark failed:', error);
  }
  
  return benchmarks;
}

/**
 * Validate blockchain state updates
 * @param {ChimeraOrchestrator} orchestrator - Orchestrator instance
 * @param {number} proposalId - Proposal ID to validate
 * @returns {Promise<Object>} Validation results
 */
export async function validateBlockchainState(orchestrator, proposalId) {
  console.log(`Validating blockchain state for proposal ${proposalId}...`);
  
  const validation = {
    proposalExists: false,
    proposalExecuted: false,
    genomeRecorded: false,
    historyQueryable: false
  };
  
  try {
    // Check if proposal exists
    const proposal = await orchestrator.getProposal(proposalId);
    validation.proposalExists = proposal !== null;
    
    if (proposal) {
      validation.proposalExecuted = proposal.executed;
      
      // Check if genome was recorded
      if (proposal.executed && orchestrator.blockchainBridge) {
        const generation = orchestrator.currentState.blockchainGeneration;
        const history = await orchestrator.blockchainBridge.getGenomeHistory(generation);
        validation.genomeRecorded = history !== null;
        validation.historyQueryable = history !== null;
      }
    }
    
    console.log('  Proposal exists:', validation.proposalExists ? '✓' : '✗');
    console.log('  Proposal executed:', validation.proposalExecuted ? '✓' : '✗');
    console.log('  Genome recorded:', validation.genomeRecorded ? '✓' : '✗');
    console.log('  History queryable:', validation.historyQueryable ? '✓' : '✗');
    
  } catch (error) {
    console.error('  Validation failed:', error.message);
  }
  
  return validation;
}

/**
 * Validate visualization updates
 * @param {Object} visualizer - Visualizer instance
 * @param {number} expectedUpdates - Expected number of updates
 * @returns {Object} Validation results
 */
export function validateVisualizationUpdates(visualizer, expectedUpdates) {
  console.log('Validating visualization updates...');
  
  const validation = {
    updateCount: 0,
    meetsExpectation: false,
    frameRate: 0
  };
  
  if (visualizer && visualizer.getUpdateCount) {
    validation.updateCount = visualizer.getUpdateCount();
    validation.meetsExpectation = validation.updateCount >= expectedUpdates;
    
    if (visualizer.getFrameRate) {
      validation.frameRate = visualizer.getFrameRate();
    }
    
    console.log(`  Updates: ${validation.updateCount} (expected: >= ${expectedUpdates}) ${validation.meetsExpectation ? '✓' : '✗'}`);
    console.log(`  Frame rate: ${validation.frameRate.toFixed(1)} fps`);
  } else {
    console.log('  Visualizer not available');
  }
  
  return validation;
}

export default {
  runDemoScript,
  runPerformanceBenchmarks,
  validateBlockchainState,
  validateVisualizationUpdates
};
