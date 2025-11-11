// Terminal Command Handlers
// Requirements: 3.3

export class CommandRegistry {
  constructor(terminal, orchestrator = null, repl = null) {
    this.terminal = terminal;
    this.orchestrator = orchestrator;
    this.repl = repl;
    this.setupCommands();
  }

  setupCommands() {
    // Help command
    this.terminal.registerCommand('help', () => this.handleHelp());
    
    // Evolution commands
    this.terminal.registerCommand('evolve', (args) => this.handleEvolve(args));
    this.terminal.registerCommand('mutate', (args) => this.handleMutate(args));
    this.terminal.registerCommand('status', () => this.handleStatus());
    
    // Persistence commands
    this.terminal.registerCommand('save', (args) => this.handleSave(args));
    this.terminal.registerCommand('load', (args) => this.handleLoad(args));
    this.terminal.registerCommand('export', () => this.handleExport());
    this.terminal.registerCommand('import', () => this.handleImport());
    
    // Utility commands
    this.terminal.registerCommand('reset', () => this.handleReset());
    this.terminal.registerCommand('clear', () => this.handleClear());
  }
  
  setREPL(repl) {
    this.repl = repl;
  }

  handleHelp() {
    this.terminal.writeLine('');
    this.terminal.writeLine('OuroborOS-Chimera - Available Commands:', 'success');
    this.terminal.writeLine('');
    this.terminal.writeLine('Evolution:', 'info');
    this.terminal.writeLine('  evolve [steps]    - Run evolution for N steps (default: 1)');
    this.terminal.writeLine('  mutate <rule>     - Apply ALGOL mutation rule');
    this.terminal.writeLine('  status            - Display organism state');
    this.terminal.writeLine('');
    this.terminal.writeLine('Persistence:', 'info');
    this.terminal.writeLine('  save <name>       - Save current snapshot');
    this.terminal.writeLine('  load <name>       - Load saved snapshot');
    this.terminal.writeLine('  export            - Download .obg file');
    this.terminal.writeLine('  import            - Upload .obg file');
    this.terminal.writeLine('');
    this.terminal.writeLine('Utility:', 'info');
    this.terminal.writeLine('  reset             - Revert to last save');
    this.terminal.writeLine('  clear             - Clear terminal output');
    this.terminal.writeLine('  help              - Show this help message');
    this.terminal.writeLine('');
  }

  handleEvolve(args) {
    const steps = args.length > 0 ? parseInt(args[0]) : 1;
    
    if (isNaN(steps) || steps < 1) {
      this.terminal.writeLine('Error: Invalid step count', 'error');
      return;
    }

    if (!this.orchestrator) {
      this.terminal.writeLine('Error: Orchestrator not initialized', 'error');
      return;
    }

    this.terminal.writeLine(`Evolving for ${steps} step(s)...`, 'info');
    
    try {
      // Send evolve message to orchestrator
      this.orchestrator.send('evolution', {
        type: 'evolve',
        payload: { steps }
      }).then(result => {
        this.terminal.writeLine(`Evolution complete. Generation: ${result.generation}`, 'success');
      }).catch(error => {
        this.terminal.writeLine(`Evolution failed: ${error.message}`, 'error');
      });
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleMutate(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Error: No mutation rule provided', 'error');
      this.terminal.writeLine('Usage: mutate <ALGOL code>', 'info');
      return;
    }

    const rule = args.join(' ');
    
    if (!this.orchestrator) {
      this.terminal.writeLine('Error: Orchestrator not initialized', 'error');
      return;
    }

    this.terminal.writeLine('Compiling and applying mutation...', 'info');
    
    try {
      // Send compile and mutate message to orchestrator
      this.orchestrator.send('compiler', {
        type: 'compile',
        payload: { source: rule, language: 'algol' }
      }).then(compiled => {
        if (compiled.success) {
          this.terminal.writeLine('Compilation successful', 'success');
          this.terminal.writeLine(`Generated Lisp: ${compiled.lisp}`, 'dim');
          
          return this.orchestrator.send('evolution', {
            type: 'mutate',
            payload: { code: compiled.lisp }
          });
        } else {
          this.terminal.writeLine('Compilation failed:', 'error');
          compiled.errors.forEach(err => {
            this.terminal.writeLine(`  Line ${err.line}, Col ${err.column}: ${err.message}`, 'error');
          });
          throw new Error('Compilation failed');
        }
      }).then(result => {
        if (result) {
          this.terminal.writeLine('Mutation applied successfully', 'success');
        }
      }).catch(error => {
        this.terminal.writeLine(`Mutation failed: ${error.message}`, 'error');
      });
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleStatus() {
    if (!this.orchestrator) {
      this.terminal.writeLine('Error: Orchestrator not initialized', 'error');
      return;
    }

    try {
      this.orchestrator.send('state', {
        type: 'get_status'
      }).then(status => {
        this.terminal.writeLine('');
        this.terminal.writeLine('=== Organism Status ===', 'success');
        this.terminal.writeLine('');
        this.terminal.writeLine(`Generation:       ${status.generation || 0}`);
        this.terminal.writeLine(`Age (steps):      ${status.age || 0}`);
        this.terminal.writeLine(`Population:       ${status.population || 0}`);
        this.terminal.writeLine(`Energy:           ${status.energy || 0}`);
        this.terminal.writeLine(`Mutation Rate:    ${status.mutationRate || 0}`);
        this.terminal.writeLine(`Active Rules:     ${status.ruleCount || 0}`);
        this.terminal.writeLine('');
      }).catch(error => {
        this.terminal.writeLine(`Failed to get status: ${error.message}`, 'error');
      });
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleSave(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Error: No save name provided', 'error');
      this.terminal.writeLine('Usage: save <name>', 'info');
      return;
    }

    const name = args.join(' ');
    
    if (!this.orchestrator) {
      this.terminal.writeLine('Error: Orchestrator not initialized', 'error');
      return;
    }

    this.terminal.writeLine(`Saving snapshot "${name}"...`, 'info');
    
    try {
      this.orchestrator.send('persistence', {
        type: 'save',
        payload: { name }
      }).then(result => {
        if (result.success) {
          this.terminal.writeLine(`Snapshot saved successfully`, 'success');
        } else {
          this.terminal.writeLine(`Save failed: ${result.error}`, 'error');
        }
      }).catch(error => {
        this.terminal.writeLine(`Save failed: ${error.message}`, 'error');
      });
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleLoad(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Error: No snapshot name provided', 'error');
      this.terminal.writeLine('Usage: load <name>', 'info');
      return;
    }

    const name = args.join(' ');
    
    if (!this.orchestrator) {
      this.terminal.writeLine('Error: Orchestrator not initialized', 'error');
      return;
    }

    this.terminal.writeLine(`Loading snapshot "${name}"...`, 'info');
    
    try {
      this.orchestrator.send('persistence', {
        type: 'load',
        payload: { name }
      }).then(result => {
        if (result.success) {
          this.terminal.writeLine(`Snapshot loaded successfully`, 'success');
          this.terminal.writeLine(`Generation: ${result.snapshot.metadata.generation}`, 'info');
        } else {
          this.terminal.writeLine(`Load failed: ${result.error}`, 'error');
        }
      }).catch(error => {
        this.terminal.writeLine(`Load failed: ${error.message}`, 'error');
      });
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleExport() {
    if (!this.orchestrator) {
      this.terminal.writeLine('Error: Orchestrator not initialized', 'error');
      return;
    }

    this.terminal.writeLine('Exporting snapshot...', 'info');
    
    try {
      this.orchestrator.send('persistence', {
        type: 'export'
      }).then(result => {
        if (result.success) {
          this.terminal.writeLine(`Snapshot exported as ${result.filename}`, 'success');
        } else {
          this.terminal.writeLine(`Export failed: ${result.error}`, 'error');
        }
      }).catch(error => {
        this.terminal.writeLine(`Export failed: ${error.message}`, 'error');
      });
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleImport() {
    if (!this.orchestrator) {
      this.terminal.writeLine('Error: Orchestrator not initialized', 'error');
      return;
    }

    this.terminal.writeLine('Opening file picker...', 'info');
    
    try {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.obg,.json';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          this.terminal.writeLine('No file selected', 'warning');
          return;
        }

        this.terminal.writeLine(`Importing ${file.name}...`, 'info');
        
        this.orchestrator.send('persistence', {
          type: 'import',
          payload: { file }
        }).then(result => {
          if (result.success) {
            this.terminal.writeLine(`Snapshot imported successfully`, 'success');
            this.terminal.writeLine(`Generation: ${result.snapshot.metadata.generation}`, 'info');
          } else {
            this.terminal.writeLine(`Import failed: ${result.error}`, 'error');
          }
        }).catch(error => {
          this.terminal.writeLine(`Import failed: ${error.message}`, 'error');
        });
      };
      
      input.click();
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleReset() {
    if (!this.orchestrator) {
      this.terminal.writeLine('Error: Orchestrator not initialized', 'error');
      return;
    }

    this.terminal.writeLine('Resetting to last save...', 'warning');
    
    try {
      this.orchestrator.send('state', {
        type: 'reset'
      }).then(result => {
        if (result.success) {
          this.terminal.writeLine('Reset successful', 'success');
        } else {
          this.terminal.writeLine(`Reset failed: ${result.error}`, 'error');
        }
      }).catch(error => {
        this.terminal.writeLine(`Reset failed: ${error.message}`, 'error');
      });
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleClear() {
    this.terminal.clear();
    this.terminal.writeLine('OuroborOS-Chimera - Living Organism Simulation', 'success');
    this.terminal.writeLine('Type "help" for available commands', 'info');
    this.terminal.writeLine('');
  }

  setOrchestrator(orchestrator) {
    this.orchestrator = orchestrator;
  }
}
