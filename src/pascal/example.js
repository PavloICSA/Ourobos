// Pascal Terminal Integration Example
// Demonstrates how to connect Pascal WASM terminal with Chimera orchestrator

import { Terminal } from '../terminal/terminal.js';
import { PascalBridge } from './pascal-bridge.js';

/**
 * Example: Basic Pascal Terminal Setup
 */
export async function setupPascalTerminal() {
  // Create terminal container
  const container = document.getElementById('terminal-container');
  if (!container) {
    console.error('Terminal container not found');
    return;
  }

  // Initialize JavaScript terminal for display
  const terminal = new Terminal(container);
  
  // Create Pascal bridge (without orchestrator for now)
  const pascalBridge = new PascalBridge();
  pascalBridge.setTerminal(terminal);

  try {
    // Load Pascal WASM module
    terminal.writeLine('Loading Pascal terminal...', 'info');
    await pascalBridge.load('/wasm/pascal/terminal.wasm');
    terminal.writeLine('Pascal terminal loaded successfully!', 'success');
    terminal.writeLine('', '');
  } catch (error) {
    terminal.writeLine(`Failed to load Pascal terminal: ${error.message}`, 'error');
    terminal.writeLine('Falling back to JavaScript terminal...', 'warning');
    return null;
  }

  // Route terminal commands to Pascal
  terminal.onCommand((command) => {
    pascalBridge.processCommand(command);
  });

  return { terminal, pascalBridge };
}

/**
 * Example: Pascal Terminal with Mock Orchestrator
 */
export async function setupPascalTerminalWithMockOrchestrator() {
  const { terminal, pascalBridge } = await setupPascalTerminal();
  
  if (!pascalBridge) {
    return null;
  }

  // Create mock orchestrator for testing
  const mockOrchestrator = {
    async proposeMutation(code, language) {
      console.log('Mock: Propose mutation', { code, language });
      return Math.floor(Math.random() * 1000); // Mock proposal ID
    },

    async vote(proposalId, support) {
      console.log('Mock: Vote', { proposalId, support });
    },

    async getGenomeHistory(generation) {
      console.log('Mock: Get genome history', { generation });
      return {
        hash: '0x' + '1234567890abcdef'.repeat(4),
        blockNumber: generation * 100,
        timestamp: Date.now() / 1000
      };
    },

    async getQuantumEntropy() {
      console.log('Mock: Get quantum entropy');
      return {
        entropy: '0x' + Array(64).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        backend: 'mock_simulator'
      };
    },

    async getBioSensorReadings() {
      console.log('Mock: Get bio sensor readings');
      return {
        light: Math.random(),
        temperature: Math.random(),
        acceleration: Math.random(),
        timestamp: Date.now() / 1000
      };
    },

    async getStatus() {
      console.log('Mock: Get status');
      return {
        population: 100,
        energy: 50,
        generation: 5,
        age: 1000,
        mutationRate: 0.05,
        blockchainGeneration: 5,
        lastGenomeHash: '0x' + '1234567890abcdef'.repeat(4),
        lastBlockNumber: 500,
        activeClusterIds: ['main', 'secondary']
      };
    }
  };

  // Connect mock orchestrator to Pascal bridge
  pascalBridge.setOrchestrator(mockOrchestrator);
  
  terminal.writeLine('Mock orchestrator connected', 'success');
  terminal.writeLine('Try commands like: status, quantum-entropy, bio-sensors', 'info');
  terminal.writeLine('', '');

  return { terminal, pascalBridge, orchestrator: mockOrchestrator };
}

/**
 * Example: Pascal Terminal with Real Chimera Orchestrator
 */
export async function setupPascalTerminalWithChimeraOrchestrator(orchestrator) {
  const { terminal, pascalBridge } = await setupPascalTerminal();
  
  if (!pascalBridge) {
    return null;
  }

  // Connect real orchestrator
  pascalBridge.setOrchestrator(orchestrator);
  
  terminal.writeLine('Chimera orchestrator connected', 'success');
  terminal.writeLine('All services available', 'info');
  terminal.writeLine('', '');

  return { terminal, pascalBridge, orchestrator };
}

/**
 * Example: Handle Pascal Terminal Errors
 */
export function setupErrorHandling(pascalBridge, terminal) {
  // Monitor Pascal terminal status
  setInterval(() => {
    if (!pascalBridge.isRunning()) {
      terminal.writeLine('Pascal terminal stopped', 'warning');
    }
  }, 5000);

  // Handle window errors
  window.addEventListener('error', (event) => {
    if (event.message.includes('wasm') || event.message.includes('pascal')) {
      terminal.writeLine(`WASM Error: ${event.message}`, 'error');
    }
  });
}

/**
 * Example: Full Integration with Service Health Monitoring
 */
export async function setupFullIntegration(orchestrator) {
  const { terminal, pascalBridge } = await setupPascalTerminal();
  
  if (!pascalBridge) {
    return null;
  }

  // Connect orchestrator
  pascalBridge.setOrchestrator(orchestrator);

  // Set up error handling
  setupErrorHandling(pascalBridge, terminal);

  // Display service status
  terminal.writeLine('Checking service health...', 'info');
  
  try {
    // Check blockchain
    const blockchainHealth = await orchestrator.checkBlockchainHealth();
    terminal.writeLine(
      `Blockchain: ${blockchainHealth ? 'Connected' : 'Offline'}`,
      blockchainHealth ? 'success' : 'warning'
    );

    // Check quantum service
    const quantumHealth = await orchestrator.checkQuantumHealth();
    terminal.writeLine(
      `Quantum:    ${quantumHealth ? 'Connected' : 'Offline'}`,
      quantumHealth ? 'success' : 'warning'
    );

    // Check bio sensors
    const bioHealth = await orchestrator.checkBioSensorHealth();
    terminal.writeLine(
      `Bio Sensor: ${bioHealth ? 'Connected' : 'Offline'}`,
      bioHealth ? 'success' : 'warning'
    );

    terminal.writeLine('', '');
    terminal.writeLine('Type "help" for available commands', 'info');
    terminal.writeLine('', '');
  } catch (error) {
    terminal.writeLine(`Health check failed: ${error.message}`, 'error');
  }

  return { terminal, pascalBridge, orchestrator };
}

/**
 * Example: Command Interception for Logging
 */
export function setupCommandLogging(pascalBridge, terminal) {
  const originalProcessCommand = pascalBridge.processCommand.bind(pascalBridge);
  
  pascalBridge.processCommand = function(command) {
    // Log command
    console.log('[Pascal Command]', command);
    
    // Log to terminal with timestamp
    const timestamp = new Date().toISOString();
    terminal.writeLine(`[${timestamp}] > ${command}`, 'dim');
    
    // Process command
    return originalProcessCommand(command);
  };
}

/**
 * Example: Custom Command Handler
 */
export function addCustomCommands(pascalBridge, terminal) {
  // Store original handlers
  const originalHandlers = {
    handleGetStatus: pascalBridge.handleGetStatus.bind(pascalBridge)
  };

  // Override status handler with enhanced version
  pascalBridge.handleGetStatus = async function() {
    terminal.writeLine('Fetching enhanced status...', 'info');
    
    // Call original handler
    await originalHandlers.handleGetStatus();
    
    // Add custom information
    terminal.writeLine('', '');
    terminal.writeLine('=== System Information ===', 'info');
    terminal.writeLine(`Browser: ${navigator.userAgent}`, '');
    terminal.writeLine(`Memory: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`, '');
    terminal.writeLine('', '');
  };
}

// Export all examples
export default {
  setupPascalTerminal,
  setupPascalTerminalWithMockOrchestrator,
  setupPascalTerminalWithChimeraOrchestrator,
  setupErrorHandling,
  setupFullIntegration,
  setupCommandLogging,
  addCustomCommands
};
