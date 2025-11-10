// OuroborOS-Chimera Main Entry Point
import { Terminal, CommandRegistry } from './terminal/index.js';
import { ALGOLCompiler } from './algol/compiler.js';
import { ChimeraOrchestrator } from './orchestrator/chimera-orchestrator.js';
import { ChimeraVisualizer } from './visualization/chimera-visualizer.js';
import { LispInterpreter } from './lisp/interpreter.js';
import config from './config/index.js';

console.log('OuroborOS-Chimera initializing...');

let terminal = null;
let commands = null;
let compiler = null;
let orchestrator = null;
let visualizer = null;
let lispInterpreter = null;

// WASM module instances
let rustEngine = null;
let fortranEngine = null;
let pascalBridge = null;
let goNeuralClusters = null;

// Initialization state
let initializationComplete = false;
let initializationError = null;

/**
 * Main application initialization
 * Initializes all Chimera components in sequence
 */
export async function init() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       OuroborOS-Chimera - Polyglot Digital Organism      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  
  try {
    // Initialize terminal first
    await initTerminal();
    
    // Display welcome message
    displayWelcomeMessage();
    
    // Initialize core components
    terminal.writeLine('Initializing core components...', 'info');
    await initCoreComponents();
    
    // Initialize ChimeraOrchestrator with all services
    terminal.writeLine('Initializing Chimera orchestrator...', 'info');
    await initChimeraOrchestrator();
    
    // Load WASM modules
    terminal.writeLine('Loading WASM modules...', 'info');
    await loadWasmModules();
    
    // Connect Pascal terminal to orchestrator
    terminal.writeLine('Connecting Pascal terminal...', 'info');
    await connectPascalTerminal();
    
    // Set up blockchain event listeners
    terminal.writeLine('Setting up blockchain event listeners...', 'info');
    setupBlockchainEventListeners();
    
    // Initialize visualization with extended features
    terminal.writeLine('Initializing visualization engine...', 'info');
    await initVisualization();
    
    // Start service health monitoring
    terminal.writeLine('Starting service health monitoring...', 'info');
    startServiceHealthMonitoring();
    
    // Set up command handlers
    terminal.writeLine('Configuring command handlers...', 'info');
    setupCommandHandlers();
    
    // Initialization complete
    initializationComplete = true;
    terminal.writeLine('', 'success');
    terminal.writeLine('✓ Initialization complete!', 'success');
    terminal.writeLine('', 'success');
    
    // Display service status
    displayServiceStatus();
    
    terminal.writeLine('');
    terminal.writeLine('Type "help" for available commands', 'dim');
    terminal.writeLine('Type "status" to check service health', 'dim');
    terminal.writeLine('');
    
    console.log('OuroborOS-Chimera ready!');
    
  } catch (error) {
    console.error('Initialization failed:', error);
    initializationError = error;
    
    if (terminal) {
      terminal.writeLine('', 'error');
      terminal.writeLine('✗ Initialization failed: ' + error.message, 'error');
      terminal.writeLine('', 'error');
      terminal.writeLine('Some features may be unavailable.', 'warning');
      terminal.writeLine('Type "status" to check service health', 'dim');
      terminal.writeLine('');
    }
  }
}

/**
 * Initialize terminal UI
 */
async function initTerminal() {
  const terminalContainer = document.getElementById('terminal-container');
  if (!terminalContainer) {
    throw new Error('Terminal container not found');
  }
  
  terminal = new Terminal(terminalContainer);
  console.log('Terminal initialized');
}

/**
 * Display welcome message
 */
function displayWelcomeMessage() {
  terminal.writeLine('╔═══════════════════════════════════════════════════════════╗', 'success');
  terminal.writeLine('║       OuroborOS-Chimera - Polyglot Digital Organism      ║', 'success');
  terminal.writeLine('╚═══════════════════════════════════════════════════════════╝', 'success');
  terminal.writeLine('');
  terminal.writeLine('A self-modifying organism with blockchain governance,', 'info');
  terminal.writeLine('quantum entropy, bio sensors, and multi-language WASM', 'info');
  terminal.writeLine('');
}

/**
 * Initialize core components (compiler, interpreter)
 */
async function initCoreComponents() {
  // Initialize ALGOL compiler
  compiler = new ALGOLCompiler();
  console.log('  ✓ ALGOL compiler initialized');
  
  // Initialize Lisp interpreter
  lispInterpreter = new LispInterpreter();
  console.log('  ✓ Lisp interpreter initialized');
}

/**
 * Initialize ChimeraOrchestrator with all services
 */
async function initChimeraOrchestrator() {
  orchestrator = new ChimeraOrchestrator({
    enableBlockchain: config.blockchain.enabled,
    enableQuantum: config.quantum.enabled,
    enableBioSensor: config.bioSensor.enabled,
    useMockQuantum: config.quantum.useMock,
    useMockBioSensor: config.bioSensor.useMock
  });
  
  // Set Lisp interpreter
  orchestrator.setLispInterpreter(lispInterpreter);
  
  // Initialize orchestrator (connects to all services)
  await orchestrator.init();
  
  console.log('  ✓ Chimera orchestrator initialized');
}

/**
 * Load all WASM modules (Pascal, Rust, Fortran, Go)
 */
async function loadWasmModules() {
  const loadedModules = [];
  const failedModules = [];
  
  // Load Rust WASM module
  try {
    const { WasmBridge } = await import('./orchestrator/wasm-bridge.js');
    rustEngine = new WasmBridge();
    await rustEngine.load(config.wasm.rustPath);
    orchestrator.setRustEngine(rustEngine);
    loadedModules.push('Rust');
    console.log('  ✓ Rust WASM module loaded');
  } catch (error) {
    console.warn('  ⚠ Rust WASM module failed to load:', error.message);
    failedModules.push('Rust');
  }
  
  // Load Fortran WASM module
  try {
    const { FortranEngine } = await import('./fortran/fortran-engine.js');
    fortranEngine = new FortranEngine();
    await fortranEngine.load(config.wasm.fortranPath);
    orchestrator.setFortranEngine(fortranEngine);
    loadedModules.push('Fortran');
    console.log('  ✓ Fortran WASM module loaded');
  } catch (error) {
    console.warn('  ⚠ Fortran WASM module failed to load:', error.message);
    failedModules.push('Fortran');
  }
  
  // Load Go WASM module (already initialized in orchestrator)
  if (orchestrator.goNeuralClusters && orchestrator.serviceHealth.goWasm) {
    goNeuralClusters = orchestrator.goNeuralClusters;
    loadedModules.push('Go');
    console.log('  ✓ Go WASM module loaded');
  } else {
    console.warn('  ⚠ Go WASM module failed to load');
    failedModules.push('Go');
  }
  
  // Load Pascal WASM module
  try {
    const { PascalBridge } = await import('./pascal/pascal-bridge.js');
    pascalBridge = new PascalBridge();
    await pascalBridge.init();
    loadedModules.push('Pascal');
    console.log('  ✓ Pascal WASM module loaded');
  } catch (error) {
    console.warn('  ⚠ Pascal WASM module failed to load:', error.message);
    failedModules.push('Pascal');
  }
  
  // Log summary
  if (loadedModules.length > 0) {
    console.log(`  Loaded ${loadedModules.length} WASM modules: ${loadedModules.join(', ')}`);
  }
  if (failedModules.length > 0) {
    console.log(`  Failed to load ${failedModules.length} WASM modules: ${failedModules.join(', ')}`);
  }
}

/**
 * Connect Pascal terminal to orchestrator
 */
async function connectPascalTerminal() {
  if (!pascalBridge) {
    console.log('  ⚠ Pascal terminal not available (WASM not loaded)');
    return;
  }
  
  try {
    // Connect Pascal terminal commands to orchestrator methods
    pascalBridge.setCommandHandler('propose-mutation', async (code, language) => {
      return await orchestrator.proposeMutation(code, language);
    });
    
    pascalBridge.setCommandHandler('vote', async (proposalId, support) => {
      return await orchestrator.vote(proposalId, support);
    });
    
    pascalBridge.setCommandHandler('execute', async (proposalId) => {
      return await orchestrator.executeMutation(proposalId);
    });
    
    pascalBridge.setCommandHandler('query-chain', async (generation) => {
      if (orchestrator.blockchainBridge) {
        return await orchestrator.blockchainBridge.getGenomeHistory(generation);
      }
      return null;
    });
    
    console.log('  ✓ Pascal terminal connected to orchestrator');
  } catch (error) {
    console.warn('  ⚠ Failed to connect Pascal terminal:', error.message);
  }
}

/**
 * Set up blockchain event listeners
 */
function setupBlockchainEventListeners() {
  if (!orchestrator.blockchainBridge) {
    console.log('  ⚠ Blockchain not available, skipping event listeners');
    return;
  }
  
  // Listen for proposal created events
  orchestrator.on('proposalCreated', (event) => {
    if (terminal) {
      terminal.writeLine('', 'info');
      terminal.writeLine(`📋 Proposal #${event.id} created`, 'info');
      terminal.writeLine(`   Genome hash: ${event.hash.substring(0, 16)}...`, 'dim');
      terminal.writeLine('');
    }
  });
  
  // Listen for vote cast events
  orchestrator.on('voteCast', (event) => {
    if (terminal) {
      terminal.writeLine(`🗳️  Vote cast on proposal #${event.proposalId}: ${event.support ? 'YES' : 'NO'}`, 'dim');
    }
  });
  
  // Listen for proposal executed events
  orchestrator.on('proposalExecuted', (event) => {
    if (terminal) {
      terminal.writeLine('', 'success');
      terminal.writeLine(`✓ Proposal #${event.proposalId} executed`, 'success');
      terminal.writeLine(`  Generation: ${event.generation}`, 'dim');
      terminal.writeLine('');
    }
  });
  
  // Listen for mutation complete events
  orchestrator.on('mutationComplete', (event) => {
    if (terminal) {
      terminal.writeLine('', 'success');
      terminal.writeLine(`✓ Mutation complete! Generation ${event.generation}`, 'success');
      terminal.writeLine(`  Population: ${event.newState.population.toFixed(2)}`, 'dim');
      terminal.writeLine(`  Energy: ${event.newState.energy.toFixed(2)}`, 'dim');
      terminal.writeLine(`  Mutation rate: ${event.newState.mutationRate.toFixed(4)}`, 'dim');
      terminal.writeLine('');
    }
    
    // Update visualization
    if (visualizer) {
      visualizer.render(orchestrator.getCurrentState());
    }
  });
  
  console.log('  ✓ Blockchain event listeners configured');
}

/**
 * Initialize visualization with extended features
 */
async function initVisualization() {
  const visualizationContainer = document.getElementById('visualization-container');
  if (!visualizationContainer) {
    console.log('  ⚠ Visualization container not found');
    return;
  }
  
  try {
    visualizer = new ChimeraVisualizer(visualizationContainer);
    await visualizer.init();
    
    // Set visualizer in orchestrator
    orchestrator.setVisualizer(visualizer);
    
    // Render initial state
    visualizer.render(orchestrator.getCurrentState());
    
    console.log('  ✓ Visualization engine initialized');
  } catch (error) {
    console.warn('  ⚠ Visualization initialization failed:', error.message);
  }
}

/**
 * Start service health monitoring
 */
function startServiceHealthMonitoring() {
  // Listen for service health changes
  orchestrator.on('serviceHealthChanged', (health) => {
    console.log('Service health changed:', health);
    
    // Update UI if needed
    if (terminal && config.dev.verbose) {
      const status = [];
      if (health.blockchain) status.push('blockchain');
      if (health.quantum) status.push('quantum');
      if (health.bioSensor) status.push('bio-sensor');
      if (health.goWasm) status.push('go-wasm');
      
      terminal.writeLine(`Services online: ${status.join(', ') || 'none'}`, 'dim');
    }
  });
  
  console.log('  ✓ Service health monitoring started');
}

/**
 * Set up command handlers
 */
function setupCommandHandlers() {
  commands = new CommandRegistry(terminal, orchestrator);
  console.log('  ✓ Command handlers configured');
}

/**
 * Display service status
 */
function displayServiceStatus() {
  const health = orchestrator.getServiceHealth();
  
  terminal.writeLine('Service Status:', 'info');
  terminal.writeLine(`  Blockchain:  ${health.blockchain ? '✓ Online' : '✗ Offline (mock mode)'}`, 
                     health.blockchain ? 'success' : 'warning');
  terminal.writeLine(`  Quantum:     ${health.quantum ? '✓ Online' : '✗ Offline (mock mode)'}`, 
                     health.quantum ? 'success' : 'warning');
  terminal.writeLine(`  Bio Sensors: ${health.bioSensor ? '✓ Online' : '✗ Offline (mock mode)'}`, 
                     health.bioSensor ? 'success' : 'warning');
  terminal.writeLine(`  Go WASM:     ${health.goWasm ? '✓ Loaded' : '✗ Not loaded'}`, 
                     health.goWasm ? 'success' : 'warning');
}

/**
 * Get initialization status
 */
export function getInitializationStatus() {
  return {
    complete: initializationComplete,
    error: initializationError
  };
}

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for use in other modules
export { 
  terminal, 
  commands, 
  compiler, 
  orchestrator, 
  visualizer,
  lispInterpreter,
  rustEngine,
  fortranEngine,
  pascalBridge,
  goNeuralClusters
};
