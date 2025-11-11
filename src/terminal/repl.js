// REPL (Read-Eval-Print Loop) for Lisp and other languages
// Provides interactive programming environment

export class REPL {
  constructor(terminal, interpreter, compiler = null) {
    this.terminal = terminal;
    this.interpreter = interpreter;
    this.compiler = compiler;
    this.mode = 'command'; // 'command', 'lisp', 'algol', 'multiline'
    this.multilineBuffer = [];
    this.multilinePrompt = '... ';
    this.originalPrompt = '> ';
    this.history = [];
    this.historyIndex = -1;
  }

  // Mode management
  enterLispMode() {
    this.mode = 'lisp';
    this.terminal.setPrompt('lisp> ');
    this.terminal.writeLine('Entering Lisp REPL mode', 'info');
    this.terminal.writeLine('Type (exit) or Ctrl+D to return to command mode', 'dim');
    this.terminal.writeLine('');
  }

  enterAlgolMode() {
    this.mode = 'algol';
    this.terminal.setPrompt('algol> ');
    this.terminal.writeLine('Entering ALGOL REPL mode', 'info');
    this.terminal.writeLine('Type EXIT or Ctrl+D to return to command mode', 'dim');
    this.terminal.writeLine('');
  }

  enterMultilineMode(language = 'lisp') {
    this.mode = 'multiline';
    this.multilineLanguage = language;
    this.multilineBuffer = [];
    this.terminal.setPrompt(this.multilinePrompt);
    this.terminal.writeLine(`Entering multiline ${language} mode`, 'info');
    this.terminal.writeLine('Type END on a line by itself to execute', 'dim');
    this.terminal.writeLine('Type CANCEL to abort', 'dim');
    this.terminal.writeLine('');
  }

  exitMode() {
    this.mode = 'command';
    this.terminal.setPrompt(this.originalPrompt);
    this.multilineBuffer = [];
  }

  getMode() {
    return this.mode;
  }

  // Input handling
  handleInput(input) {
    switch (this.mode) {
      case 'lisp':
        return this.handleLispInput(input);
      
      case 'algol':
        return this.handleAlgolInput(input);
      
      case 'multiline':
        return this.handleMultilineInput(input);
      
      default:
        return false; // Not handled by REPL
    }
  }

  handleLispInput(input) {
    const trimmed = input.trim();
    
    // Check for exit
    if (trimmed === '(exit)' || trimmed === 'exit' || trimmed === ':q') {
      this.exitMode();
      this.terminal.writeLine('Exiting Lisp REPL', 'info');
      this.terminal.writeLine('');
      return true;
    }
    
    // Empty input
    if (!trimmed) {
      return true;
    }
    
    // Try to evaluate
    try {
      const result = this.interpreter.eval(trimmed);
      this.terminal.writeLine(this.formatResult(result), 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
    
    return true;
  }

  handleAlgolInput(input) {
    const trimmed = input.trim().toUpperCase();
    
    // Check for exit
    if (trimmed === 'EXIT' || trimmed === ':Q') {
      this.exitMode();
      this.terminal.writeLine('Exiting ALGOL REPL', 'info');
      this.terminal.writeLine('');
      return true;
    }
    
    // Empty input
    if (!input.trim()) {
      return true;
    }
    
    // Try to compile and execute
    if (!this.compiler) {
      this.terminal.writeLine('Error: ALGOL compiler not available', 'error');
      return true;
    }
    
    try {
      const result = this.compiler.compile(input);
      
      if (result.success) {
        this.terminal.writeLine('Compiled to Lisp:', 'dim');
        this.terminal.writeLine(result.lisp, 'dim');
        this.terminal.writeLine('');
        
        // Execute the compiled Lisp
        const evalResult = this.interpreter.eval(result.lisp);
        this.terminal.writeLine(this.formatResult(evalResult), 'success');
      } else {
        this.terminal.writeLine('Compilation errors:', 'error');
        result.errors.forEach(err => {
          this.terminal.writeLine(`  ${err.toString()}`, 'error');
        });
      }
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
    
    return true;
  }

  handleMultilineInput(input) {
    const trimmed = input.trim();
    
    // Check for end
    if (trimmed.toUpperCase() === 'END') {
      const code = this.multilineBuffer.join('\n');
      this.terminal.writeLine('');
      
      // Execute the code
      try {
        if (this.multilineLanguage === 'lisp') {
          const result = this.interpreter.eval(code);
          this.terminal.writeLine(this.formatResult(result), 'success');
        } else if (this.multilineLanguage === 'algol' && this.compiler) {
          const compileResult = this.compiler.compile(code);
          
          if (compileResult.success) {
            const result = this.interpreter.eval(compileResult.lisp);
            this.terminal.writeLine(this.formatResult(result), 'success');
          } else {
            this.terminal.writeLine('Compilation errors:', 'error');
            compileResult.errors.forEach(err => {
              this.terminal.writeLine(`  ${err.toString()}`, 'error');
            });
          }
        }
      } catch (error) {
        this.terminal.writeLine(`Error: ${error.message}`, 'error');
      }
      
      this.exitMode();
      this.terminal.writeLine('');
      return true;
    }
    
    // Check for cancel
    if (trimmed.toUpperCase() === 'CANCEL') {
      this.exitMode();
      this.terminal.writeLine('Cancelled', 'warning');
      this.terminal.writeLine('');
      return true;
    }
    
    // Add line to buffer
    this.multilineBuffer.push(input);
    return true;
  }

  // Result formatting
  formatResult(result) {
    if (result === null || result === undefined) {
      return 'nil';
    }
    
    if (Array.isArray(result)) {
      return '(' + result.map(r => this.formatResult(r)).join(' ') + ')';
    }
    
    if (typeof result === 'object' && result.type === 'symbol') {
      return result.value;
    }
    
    if (typeof result === 'string') {
      return `"${result}"`;
    }
    
    if (typeof result === 'function') {
      return '<function>';
    }
    
    return String(result);
  }

  // Evaluation helpers
  evalLisp(code) {
    try {
      return {
        success: true,
        result: this.interpreter.eval(code)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  evalAlgol(code) {
    if (!this.compiler) {
      return {
        success: false,
        error: 'ALGOL compiler not available'
      };
    }
    
    try {
      const compileResult = this.compiler.compile(code);
      
      if (!compileResult.success) {
        return {
          success: false,
          error: 'Compilation failed',
          errors: compileResult.errors
        };
      }
      
      const result = this.interpreter.eval(compileResult.lisp);
      return {
        success: true,
        result: result,
        lisp: compileResult.lisp
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
