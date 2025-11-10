/**
 * Demo Workflow - Guided demonstration of OuroborOS-Chimera
 * 
 * This module provides a step-by-step guided demo that showcases:
 * - Mutation proposal process
 * - Voting with simulated voters
 * - Quantum entropy generation
 * - Bio sensor influence
 * - Blockchain confirmation
 * - Neural cluster decisions
 * 
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */

import {
  DEMO_INITIAL_STATE,
  DEMO_MUTATION_SEQUENCE,
  getDemoMutation,
  getNextDemoMutation,
  isDemoComplete,
  getDemoProgress
} from './demo-organism.js';

/**
 * Demo workflow states
 */
const DemoState = {
  NOT_STARTED: 'not_started',
  INTRO: 'intro',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error'
};

/**
 * Demo step phases
 */
const StepPhase = {
  PROPOSING: 'proposing',
  VOTING: 'voting',
  EXECUTING: 'executing',
  COMPLETE: 'complete'
};

/**
 * DemoWorkflow - Orchestrates the guided demonstration
 */
export class DemoWorkflow {
  constructor(orchestrator, options = {}) {
    this.orchestrator = orchestrator;
    
    // Options
    this.options = {
      votingDelay: options.votingDelay ?? 5000, // 5 seconds for demo
      stepDelay: options.stepDelay ?? 2000, // 2 seconds between steps
      autoVote: options.autoVote ?? true,
      voteSupport: options.voteSupport ?? true,
      showDetails: options.showDetails ?? true,
      autoAdvance: options.autoAdvance ?? false,
      ...options
    };
    
    // State
    this.state = DemoState.NOT_STARTED;
    this.currentStep = 0;
    this.currentPhase = null;
    this.currentProposalId = null;
    
    // Timing
    this.startTime = null;
    this.stepStartTime = null;
    this.stepTimings = [];
    
    // Event listeners
    this.eventListeners = {
      stateChange: [],
      stepStart: [],
      stepComplete: [],
      phaseChange: [],
      message: [],
      error: []
    };
    
    // Terminal reference (set externally)
    this.terminal = null;
  }
  
  /**
   * Set terminal for output
   * @param {Object} terminal - Terminal instance
   */
  setTerminal(terminal) {
    this.terminal = terminal;
  }
  
  /**
   * Start the demo workflow
   * @returns {Promise<void>}
   */
  async start() {
    if (this.state !== DemoState.NOT_STARTED) {
      throw new Error('Demo already started');
    }
    
    this.log('=== OuroborOS-Chimera Demo ===\n', 'title');
    
    // Show intro message
    await this.showIntro();
    
    // Check service health
    await this.checkServices();
    
    // Reset organism to demo initial state
    this.orchestrator.updateState(DEMO_INITIAL_STATE);
    
    // Start demo sequence
    this.setState(DemoState.RUNNING);
    this.startTime = Date.now();
    
    this.log('\nStarting demo sequence...\n', 'success');
    
    // Execute all steps
    for (let step = 1; step <= DEMO_MUTATION_SEQUENCE.length; step++) {
      if (this.state !== DemoState.RUNNING) {
        break; // Paused or stopped
      }
      
      await this.executeStep(step);
      
      // Delay between steps (unless last step)
      if (step < DEMO_MUTATION_SEQUENCE.length && this.options.autoAdvance) {
        await this.delay(this.options.stepDelay);
      } else if (step < DEMO_MUTATION_SEQUENCE.length && !this.options.autoAdvance) {
        // Wait for user to continue
        this.log('\n[Press Enter to continue to next step...]', 'info');
        await this.waitForContinue();
      }
    }
    
    // Demo complete
    await this.complete();
  }
  
  /**
   * Show introduction message
   * @private
   */
  async showIntro() {
    this.setState(DemoState.INTRO);
    
    const intro = `
Welcome to the Chimera demonstration!

This demo will showcase the complete mutation lifecycle across
seven integrated technology layers:

  1. Pascal Terminal UI (Retro interface)
  2. Blockchain Governance (Ethereum smart contracts)
  3. Quantum Entropy (Qiskit quantum circuits)
  4. Bio Sensor Network (Raspberry Pi environmental data)
  5. Meta-Compiler (Multi-language → Ourocode)
  6. Runtime Orchestration (Rust + Go + Fortran + Lisp)
  7. Visualization (Fractal neural topology)

The demo will execute ${DEMO_MUTATION_SEQUENCE.length} mutations, each demonstrating:
  ✓ Mutation proposal and compilation
  ✓ DAO voting process
  ✓ Quantum entropy generation
  ✓ Bio sensor influence
  ✓ Blockchain confirmation
  ✓ Neural cluster decisions
  ✓ Real-time visualization

Expected duration: < 60 seconds
    `.trim();
    
    this.log(intro, 'info');
    this.log(''); // blank line
  }
  
  /**
   * Check service health and display status
   * @private
   */
  async checkServices() {
    this.log('Service Status:', 'info');
    
    const health = await this.orchestrator.checkServiceHealth();
    const detailed = this.orchestrator.getDetailedServiceStatus();
    
    // Blockchain
    const blockchainStatus = health.blockchain ? 
      `Connected (${detailed.blockchain.status})` : 
      'Mock mode';
    this.log(`  ${health.blockchain ? '✓' : '○'} Blockchain: ${blockchainStatus}`, 
             health.blockchain ? 'success' : 'warning');
    
    // Quantum
    const quantumStatus = health.quantum ? 
      'Online' : 
      'Mock mode (classical entropy)';
    this.log(`  ${health.quantum ? '✓' : '○'} Quantum: ${quantumStatus}`, 
             health.quantum ? 'success' : 'warning');
    
    // Bio Sensors
    const bioStatus = health.bioSensor ? 
      'Connected' : 
      'Mock mode (simulated)';
    this.log(`  ${health.bioSensor ? '✓' : '○'} Bio Sensors: ${bioStatus}`, 
             health.bioSensor ? 'success' : 'warning');
    
    // Go WASM
    const goStatus = health.goWasm ? 
      'Loaded' : 
      'Unavailable';
    this.log(`  ${health.goWasm ? '✓' : '○'} Go WASM: ${goStatus}`, 
             health.goWasm ? 'success' : 'warning');
    
    this.log(''); // blank line
  }
  
  /**
   * Execute a specific demo step
   * @param {number} step - Step number (1-5)
   * @returns {Promise<Object>} Step result
   */
  async executeStep(step) {
    const mutation = getDemoMutation(step);
    
    if (!mutation) {
      throw new Error(`Invalid demo step: ${step}`);
    }
    
    this.currentStep = step;
    this.stepStartTime = Date.now();
    this.emit('stepStart', { step, mutation });
    
    // Show step header
    this.log(`--- Step ${step}/${DEMO_MUTATION_SEQUENCE.length}: ${mutation.name} ---`, 'title');
    this.log(`Description: ${mutation.description}`, 'info');
    this.log(`Code: ${mutation.language.toUpperCase()} rule (${mutation.code.split('\n').length} lines)\n`);
    
    try {
      // Phase 1: Propose mutation
      await this.proposePhase(mutation);
      
      // Phase 2: Voting
      await this.votingPhase(mutation);
      
      // Phase 3: Execute mutation
      await this.executePhase(mutation);
      
      // Step complete
      const stepDuration = Date.now() - this.stepStartTime;
      this.stepTimings.push({
        step,
        name: mutation.name,
        duration: stepDuration
      });
      
      this.log(`\nResult: ${mutation.expectedOutcome}`, 'success');
      
      const progress = getDemoProgress(step);
      this.log(`Progress: ${progress.currentStep}/${progress.totalSteps} complete (${progress.percentage}%)\n`, 'info');
      
      this.emit('stepComplete', { step, mutation, duration: stepDuration });
      
      return {
        success: true,
        step,
        mutation,
        duration: stepDuration
      };
      
    } catch (error) {
      this.log(`\nError in step ${step}: ${error.message}`, 'error');
      this.emit('error', { step, error });
      throw error;
    }
  }
  
  /**
   * Propose mutation phase
   * @private
   */
  async proposePhase(mutation) {
    this.setPhase(StepPhase.PROPOSING);
    this.log('[1] Proposing mutation...', 'info');
    
    try {
      // Propose mutation to orchestrator
      const proposalId = await this.orchestrator.proposeMutation(
        mutation.code,
        mutation.language
      );
      
      this.currentProposalId = proposalId;
      
      if (this.options.showDetails) {
        this.log('    ✓ Compiled to Ourocode', 'success');
        this.log('    ✓ Validated syntax', 'success');
        this.log('    ✓ Generated hashes', 'success');
      }
      
      this.log(`    ✓ Submitted to blockchain (proposal #${proposalId})`, 'success');
      this.log('');
      
    } catch (error) {
      this.log(`    ✗ Proposal failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Voting phase
   * @private
   */
  async votingPhase(mutation) {
    this.setPhase(StepPhase.VOTING);
    
    const votingDelay = mutation.votingDelay || this.options.votingDelay;
    const votingSeconds = (votingDelay / 1000).toFixed(0);
    
    this.log(`[2] Voting period (${votingSeconds}s)...`, 'info');
    
    // Show countdown
    if (this.options.showDetails) {
      for (let i = votingSeconds; i > 0; i--) {
        this.log(`    Voting ends in ${i}s...`, 'info');
        await this.delay(1000);
      }
    } else {
      await this.delay(votingDelay);
    }
    
    // Auto-vote if enabled
    if (mutation.autoVote ?? this.options.autoVote) {
      try {
        const support = mutation.voteSupport ?? this.options.voteSupport;
        await this.orchestrator.vote(this.currentProposalId, support);
        
        this.log(`    ✓ Auto-vote: ${support ? 'YES' : 'NO'}`, 'success');
        
        // Get voting status
        const status = await this.orchestrator.getVotingStatus(this.currentProposalId);
        
        if (status.found) {
          this.log(`    ✓ Proposal ${status.executed ? 'executed' : 'approved'} (${status.percentFor}% yes)`, 'success');
        }
        
      } catch (error) {
        this.log(`    ○ Vote not recorded (${error.message})`, 'warning');
      }
    }
    
    this.log('');
  }
  
  /**
   * Execute mutation phase
   * @private
   */
  async executePhase(mutation) {
    this.setPhase(StepPhase.EXECUTING);
    this.log('[3] Executing mutation...', 'info');
    
    try {
      // Execute mutation
      const result = await this.orchestrator.executeMutation(this.currentProposalId);
      
      // Display quantum entropy
      if (result.quantumEntropy) {
        const entropyPreview = result.quantumEntropy.substring(0, 16);
        this.log(`    ✓ Quantum entropy: ${entropyPreview}...`, 'success');
      }
      
      // Display sensor readings
      if (result.sensorReadings) {
        const { light, temperature, acceleration } = result.sensorReadings;
        this.log(`    ✓ Sensor readings: light=${light.toFixed(2)}, temp=${temperature.toFixed(2)}, accel=${acceleration.toFixed(2)}`, 'success');
      }
      
      // Display execution steps
      if (this.options.showDetails) {
        this.log('    ✓ Ourocode executed', 'success');
        this.log('    ✓ Neural clusters updated', 'success');
      }
      
      // Display blockchain confirmation
      if (result.generation) {
        this.log(`    ✓ Blockchain confirmed (generation #${result.generation})`, 'success');
      }
      
      // Display visualization update
      this.log('    ✓ Visualization updated', 'success');
      
      // Display neural cluster decisions (if available)
      if (this.orchestrator.serviceHealth.goWasm) {
        await this.displayClusterDecisions();
      }
      
    } catch (error) {
      this.log(`    ✗ Execution failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Display neural cluster decisions
   * @private
   */
  async displayClusterDecisions() {
    if (!this.orchestrator.goNeuralClusters) return;
    
    const clusters = this.orchestrator.activeClusterIds || ['main'];
    
    for (const clusterId of clusters) {
      try {
        const decision = this.orchestrator.goNeuralClusters.getClusterDecision(clusterId);
        
        if (decision) {
          this.log(`    ✓ Cluster '${clusterId}': ${decision.action} (confidence: ${(decision.confidence * 100).toFixed(0)}%)`, 'success');
        }
      } catch (error) {
        // Ignore cluster errors in demo
      }
    }
  }
  
  /**
   * Complete the demo
   * @private
   */
  async complete() {
    this.setState(DemoState.COMPLETED);
    
    const totalDuration = Date.now() - this.startTime;
    const totalSeconds = (totalDuration / 1000).toFixed(1);
    
    this.log('\n=== Demo Complete! ===\n', 'title');
    this.log(`Total duration: ${totalSeconds}s`, 'success');
    this.log(`Average per step: ${(totalDuration / DEMO_MUTATION_SEQUENCE.length / 1000).toFixed(1)}s`, 'info');
    
    // Show step timings
    if (this.options.showDetails && this.stepTimings.length > 0) {
      this.log('\nStep Timings:', 'info');
      for (const timing of this.stepTimings) {
        this.log(`  ${timing.step}. ${timing.name}: ${(timing.duration / 1000).toFixed(1)}s`);
      }
    }
    
    // Show final state
    const finalState = this.orchestrator.getCurrentState();
    this.log('\nFinal Organism State:', 'info');
    this.log(`  Population: ${finalState.population.toFixed(1)}`);
    this.log(`  Energy: ${finalState.energy.toFixed(1)}`);
    this.log(`  Mutation Rate: ${finalState.mutationRate.toFixed(3)}`);
    this.log(`  Generation: ${finalState.generation}`);
    this.log(`  Blockchain Generation: ${finalState.blockchainGeneration}`);
    
    this.log('\nThank you for experiencing OuroborOS-Chimera!', 'success');
    
    this.emit('complete', {
      duration: totalDuration,
      stepTimings: this.stepTimings,
      finalState
    });
  }
  
  /**
   * Pause the demo
   */
  pause() {
    if (this.state === DemoState.RUNNING) {
      this.setState(DemoState.PAUSED);
      this.log('\n[Demo paused]', 'warning');
    }
  }
  
  /**
   * Resume the demo
   */
  resume() {
    if (this.state === DemoState.PAUSED) {
      this.setState(DemoState.RUNNING);
      this.log('[Demo resumed]\n', 'success');
    }
  }
  
  /**
   * Stop the demo
   */
  stop() {
    this.setState(DemoState.ERROR);
    this.log('\n[Demo stopped]', 'error');
  }
  
  /**
   * Get current demo state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }
  
  /**
   * Get current step
   * @returns {number} Current step number
   */
  getCurrentStep() {
    return this.currentStep;
  }
  
  /**
   * Get demo progress
   * @returns {Object} Progress information
   */
  getProgress() {
    return getDemoProgress(this.currentStep);
  }
  
  /**
   * Check if demo is running
   * @returns {boolean} True if running
   */
  isRunning() {
    return this.state === DemoState.RUNNING;
  }
  
  /**
   * Check if demo is complete
   * @returns {boolean} True if complete
   */
  isComplete() {
    return this.state === DemoState.COMPLETED;
  }
  
  /**
   * Set demo state
   * @private
   */
  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.emit('stateChange', { oldState, newState });
  }
  
  /**
   * Set current phase
   * @private
   */
  setPhase(newPhase) {
    const oldPhase = this.currentPhase;
    this.currentPhase = newPhase;
    this.emit('phaseChange', { oldPhase, newPhase });
  }
  
  /**
   * Log message
   * @private
   */
  log(message, type = 'normal') {
    // Emit message event
    this.emit('message', { message, type });
    
    // Write to terminal if available
    if (this.terminal) {
      this.terminal.writeLine(message, type);
    } else {
      // Fallback to console
      const prefix = {
        title: '===',
        success: '✓',
        error: '✗',
        warning: '○',
        info: 'ℹ'
      }[type] || '';
      
      console.log(prefix ? `${prefix} ${message}` : message);
    }
  }
  
  /**
   * Delay helper
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Wait for user to continue
   * @private
   */
  waitForContinue() {
    return new Promise(resolve => {
      // In a real implementation, this would wait for Enter key
      // For now, just resolve immediately
      resolve();
    });
  }
  
  /**
   * Register event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   */
  on(eventType, callback) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].push(callback);
    }
  }
  
  /**
   * Remove event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   */
  off(eventType, callback) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType] = this.eventListeners[eventType]
        .filter(cb => cb !== callback);
    }
  }
  
  /**
   * Emit event
   * @private
   */
  emit(eventType, data) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }
}

export default DemoWorkflow;
