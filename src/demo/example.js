/**
 * Demo Example - How to use the OuroborOS-Chimera demo
 * 
 * This file demonstrates various ways to run and interact with the demo
 */

import ChimeraOrchestrator from '../orchestrator/chimera-orchestrator.js';
import { DemoWorkflow } from './demo-workflow.js';
import { runDemoScript, runPerformanceBenchmarks } from './demo-script.js';
import { 
  DEMO_INITIAL_STATE, 
  getDemoMutation, 
  getDemoProgress 
} from './demo-organism.js';

/**
 * Example 1: Run the full guided demo
 */
async function example1_FullDemo() {
  console.log('=== Example 1: Full Guided Demo ===\n');
  
  // Create and initialize orchestrator
  const orchestrator = new ChimeraOrchestrator({
    enableBlockchain: true,
    enableQuantum: true,
    enableBioSensor: true
  });
  
  await orchestrator.init();
  
  // Create demo workflow
  const demo = new DemoWorkflow(orchestrator, {
    votingDelay: 5000,      // 5 seconds voting period
    stepDelay: 2000,        // 2 seconds between steps
    autoVote: true,         // Automatically vote yes
    showDetails: true,      // Show detailed logs
    autoAdvance: true       // Automatically advance to next step
  });
  
  // Listen for events
  demo.on('stepComplete', (data) => {
    console.log(`Completed step ${data.step} in ${(data.duration / 1000).toFixed(1)}s`);
  });
  
  demo.on('complete', (data) => {
    console.log(`Demo finished in ${(data.duration / 1000).toFixed(1)}s`);
  });
  
  // Start the demo
  await demo.start();
}

/**
 * Example 2: Run demo with manual step control
 */
async function example2_ManualSteps() {
  console.log('=== Example 2: Manual Step Control ===\n');
  
  const orchestrator = new ChimeraOrchestrator();
  await orchestrator.init();
  
  const demo = new DemoWorkflow(orchestrator, {
    autoAdvance: false  // Don't auto-advance
  });
  
  // Execute steps manually
  console.log('Executing step 1...');
  await demo.executeStep(1);
  
  console.log('Waiting before step 2...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Executing step 2...');
  await demo.executeStep(2);
  
  // Check progress
  const progress = demo.getProgress();
  console.log(`Progress: ${progress.currentStep}/${progress.totalSteps} (${progress.percentage}%)`);
}

/**
 * Example 3: Run automated test script
 */
async function example3_AutomatedScript() {
  console.log('=== Example 3: Automated Test Script ===\n');
  
  const orchestrator = new ChimeraOrchestrator();
  await orchestrator.init();
  
  // Run the automated demo script
  const result = await runDemoScript(orchestrator, {
    votingDelay: 1000,
    stepDelay: 500,
    showDetails: false
  });
  
  // Check results
  console.log('Test Results:');
  console.log(`  Success: ${result.success}`);
  console.log(`  Duration: ${(result.duration / 1000).toFixed(1)}s`);
  console.log(`  Steps completed: ${result.stepResults.length}`);
  console.log(`  Errors: ${result.errors.length}`);
  
  // Check which services were called
  console.log('\nServices Called:');
  for (const [service, called] of Object.entries(result.servicesCalled)) {
    console.log(`  ${service}: ${called ? '✓' : '✗'}`);
  }
}

/**
 * Example 4: Run performance benchmarks
 */
async function example4_Benchmarks() {
  console.log('=== Example 4: Performance Benchmarks ===\n');
  
  const orchestrator = new ChimeraOrchestrator();
  await orchestrator.init();
  
  // Run benchmarks
  const benchmarks = await runPerformanceBenchmarks(orchestrator);
  
  // Display results
  console.log('Benchmark Results:');
  for (const [name, result] of Object.entries(benchmarks)) {
    if (result.actual > 0) {
      const unit = result.target > 1000 ? 's' : 'ms';
      const value = result.target > 1000 
        ? (result.actual / 1000).toFixed(1)
        : result.actual;
      console.log(`  ${name}: ${value}${unit} ${result.pass ? '✓' : '✗'}`);
    }
  }
}

/**
 * Example 5: Custom demo with specific mutations
 */
async function example5_CustomDemo() {
  console.log('=== Example 5: Custom Demo ===\n');
  
  const orchestrator = new ChimeraOrchestrator();
  await orchestrator.init();
  
  // Set custom initial state
  orchestrator.updateState({
    population: 75,
    energy: 100,
    mutationRate: 0.08
  });
  
  // Get specific mutation
  const mutation = getDemoMutation(3); // Sensor adaptation
  
  console.log(`Running mutation: ${mutation.name}`);
  console.log(`Description: ${mutation.description}`);
  
  // Propose the mutation
  const proposalId = await orchestrator.proposeMutation(
    mutation.code,
    mutation.language
  );
  
  console.log(`Proposal ID: ${proposalId}`);
  
  // Vote
  await orchestrator.vote(proposalId, true);
  
  // Wait for voting period
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Execute
  const result = await orchestrator.executeMutation(proposalId);
  
  console.log('Mutation executed!');
  console.log('New state:', result.newState);
}

/**
 * Example 6: Demo with terminal integration
 */
async function example6_TerminalDemo() {
  console.log('=== Example 6: Terminal Integration ===\n');
  
  const orchestrator = new ChimeraOrchestrator();
  await orchestrator.init();
  
  // Create mock terminal
  const terminal = {
    writeLine: (message, type) => {
      const prefix = {
        title: '===',
        success: '✓',
        error: '✗',
        warning: '○',
        info: 'ℹ'
      }[type] || '';
      
      console.log(prefix ? `${prefix} ${message}` : message);
    }
  };
  
  // Create demo with terminal
  const demo = new DemoWorkflow(orchestrator);
  demo.setTerminal(terminal);
  
  // Run demo (output will go to terminal)
  await demo.start();
}

/**
 * Example 7: Monitor demo progress
 */
async function example7_MonitorProgress() {
  console.log('=== Example 7: Monitor Progress ===\n');
  
  const orchestrator = new ChimeraOrchestrator();
  await orchestrator.init();
  
  const demo = new DemoWorkflow(orchestrator, {
    autoAdvance: true
  });
  
  // Monitor state changes
  demo.on('stateChange', (data) => {
    console.log(`State: ${data.oldState} → ${data.newState}`);
  });
  
  // Monitor phase changes
  demo.on('phaseChange', (data) => {
    console.log(`Phase: ${data.oldPhase} → ${data.newPhase}`);
  });
  
  // Monitor step progress
  demo.on('stepStart', (data) => {
    const progress = getDemoProgress(data.step);
    console.log(`\nStarting step ${data.step}/${progress.totalSteps}`);
    console.log(`Progress: ${progress.percentage}%`);
  });
  
  // Start demo
  await demo.start();
}

/**
 * Example 8: Pause and resume demo
 */
async function example8_PauseResume() {
  console.log('=== Example 8: Pause and Resume ===\n');
  
  const orchestrator = new ChimeraOrchestrator();
  await orchestrator.init();
  
  const demo = new DemoWorkflow(orchestrator);
  
  // Start demo in background
  const demoPromise = demo.start();
  
  // Pause after 10 seconds
  setTimeout(() => {
    console.log('Pausing demo...');
    demo.pause();
    
    // Resume after 5 seconds
    setTimeout(() => {
      console.log('Resuming demo...');
      demo.resume();
    }, 5000);
  }, 10000);
  
  await demoPromise;
}

/**
 * Example 9: Demo with service health monitoring
 */
async function example9_ServiceMonitoring() {
  console.log('=== Example 9: Service Health Monitoring ===\n');
  
  const orchestrator = new ChimeraOrchestrator({
    enableBlockchain: true,
    enableQuantum: true,
    enableBioSensor: true
  });
  
  await orchestrator.init();
  
  // Monitor service health changes
  orchestrator.on('serviceHealthChanged', (health) => {
    console.log('Service health changed:');
    console.log(`  Blockchain: ${health.blockchain ? 'online' : 'offline'}`);
    console.log(`  Quantum: ${health.quantum ? 'online' : 'offline'}`);
    console.log(`  Bio Sensor: ${health.bioSensor ? 'online' : 'offline'}`);
    console.log(`  Go WASM: ${health.goWasm ? 'online' : 'offline'}`);
  });
  
  const demo = new DemoWorkflow(orchestrator);
  await demo.start();
}

/**
 * Example 10: Demo with error handling
 */
async function example10_ErrorHandling() {
  console.log('=== Example 10: Error Handling ===\n');
  
  const orchestrator = new ChimeraOrchestrator();
  await orchestrator.init();
  
  const demo = new DemoWorkflow(orchestrator);
  
  // Handle errors
  demo.on('error', (data) => {
    console.error(`Error in step ${data.step}:`, data.error.message);
    
    // Could implement retry logic here
    console.log('Continuing despite error...');
  });
  
  try {
    await demo.start();
  } catch (error) {
    console.error('Demo failed:', error.message);
    
    // Get recovery status
    const recovery = orchestrator.getRecoveryStatus();
    console.log('Recovery status:', recovery);
  }
}

// Export examples
export {
  example1_FullDemo,
  example2_ManualSteps,
  example3_AutomatedScript,
  example4_Benchmarks,
  example5_CustomDemo,
  example6_TerminalDemo,
  example7_MonitorProgress,
  example8_PauseResume,
  example9_ServiceMonitoring,
  example10_ErrorHandling
};

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const exampleNumber = process.argv[2] || '1';
  
  const examples = {
    '1': example1_FullDemo,
    '2': example2_ManualSteps,
    '3': example3_AutomatedScript,
    '4': example4_Benchmarks,
    '5': example5_CustomDemo,
    '6': example6_TerminalDemo,
    '7': example7_MonitorProgress,
    '8': example8_PauseResume,
    '9': example9_ServiceMonitoring,
    '10': example10_ErrorHandling
  };
  
  const example = examples[exampleNumber];
  
  if (example) {
    example().catch(error => {
      console.error('Example failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage: node example.js [1-10]');
    console.log('\nAvailable examples:');
    console.log('  1: Full Guided Demo');
    console.log('  2: Manual Step Control');
    console.log('  3: Automated Test Script');
    console.log('  4: Performance Benchmarks');
    console.log('  5: Custom Demo');
    console.log('  6: Terminal Integration');
    console.log('  7: Monitor Progress');
    console.log('  8: Pause and Resume');
    console.log('  9: Service Health Monitoring');
    console.log('  10: Error Handling');
  }
}
