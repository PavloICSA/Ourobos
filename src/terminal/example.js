// Terminal Usage Example
import { Terminal, CommandRegistry } from './index.js';

// Example: Initialize terminal
export function initializeTerminal() {
  const container = document.getElementById('terminal-container');
  const terminal = new Terminal(container);
  
  // Display welcome message
  terminal.writeLine('OuroborOS-Chimera - Living Organism Simulation', 'success');
  terminal.writeLine('Type "help" for available commands', 'info');
  terminal.writeLine('');
  
  // Set up command handlers
  // Note: Pass orchestrator when available
  const commands = new CommandRegistry(terminal, null);
  
  // Example: Custom command handler
  terminal.registerCommand('test', (args) => {
    terminal.writeLine('Test command executed!', 'success');
    terminal.writeLine(`Arguments: ${args.join(', ')}`, 'info');
  });
  
  return { terminal, commands };
}

// Example: Using terminal programmatically
export function terminalDemo() {
  const { terminal } = initializeTerminal();
  
  // Write some output
  terminal.writeLine('Initializing organism...', 'info');
  
  setTimeout(() => {
    terminal.writeLine('Organism initialized', 'success');
    terminal.write('Population: ', 'dim');
    terminal.writeLine('100', 'success');
    terminal.write('Energy: ', 'dim');
    terminal.writeLine('50.0', 'success');
  }, 1000);
  
  // Demonstrate different text styles
  setTimeout(() => {
    terminal.writeLine('');
    terminal.writeLine('Text Style Examples:', 'bold');
    terminal.writeLine('This is normal text');
    terminal.writeLine('This is an error', 'error');
    terminal.writeLine('This is a warning', 'warning');
    terminal.writeLine('This is success', 'success');
    terminal.writeLine('This is info', 'info');
    terminal.writeLine('This is dimmed', 'dim');
  }, 2000);
}

// Example: Connecting to orchestrator
export function connectOrchestrator(terminal, commands, orchestrator) {
  commands.setOrchestrator(orchestrator);
  terminal.writeLine('Orchestrator connected', 'success');
}
