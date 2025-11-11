// Extended Command Set for ChimeraOS
// Provides programming environment commands

export class ExtendedCommands {
  constructor(terminal, orchestrator, filesystem, repl, lispInterpreter, compiler) {
    this.terminal = terminal;
    this.orchestrator = orchestrator;
    this.fs = filesystem;
    this.repl = repl;
    this.lispInterpreter = lispInterpreter;
    this.compiler = compiler;
    this.setupCommands();
  }

  setupCommands() {
    // REPL commands
    this.terminal.registerCommand('lisp', () => this.handleLisp());
    this.terminal.registerCommand('algol', () => this.handleAlgol());
    this.terminal.registerCommand('repl', (args) => this.handleRepl(args));
    this.terminal.registerCommand('eval', (args) => this.handleEval(args));
    this.terminal.registerCommand('script', (args) => this.handleScript(args));
    
    // Filesystem commands
    this.terminal.registerCommand('ls', (args) => this.handleLs(args));
    this.terminal.registerCommand('cd', (args) => this.handleCd(args));
    this.terminal.registerCommand('pwd', () => this.handlePwd());
    this.terminal.registerCommand('cat', (args) => this.handleCat(args));
    this.terminal.registerCommand('write', (args) => this.handleWrite(args));
    this.terminal.registerCommand('edit', (args) => this.handleEdit(args));
    this.terminal.registerCommand('rm', (args) => this.handleRm(args));
    this.terminal.registerCommand('mkdir', (args) => this.handleMkdir(args));
    this.terminal.registerCommand('find', (args) => this.handleFind(args));
    this.terminal.registerCommand('grep', (args) => this.handleGrep(args));
    
    // Program execution
    this.terminal.registerCommand('run', (args) => this.handleRun(args));
    this.terminal.registerCommand('exec', (args) => this.handleExec(args));
    this.terminal.registerCommand('compile', (args) => this.handleCompile(args));
    
    // WASM module interaction
    this.terminal.registerCommand('wasm', (args) => this.handleWasm(args));
    this.terminal.registerCommand('rust', (args) => this.handleRust(args));
    this.terminal.registerCommand('fortran', (args) => this.handleFortran(args));
    this.terminal.registerCommand('go', (args) => this.handleGo(args));
    this.terminal.registerCommand('pascal', (args) => this.handlePascal(args));
    
    // Environment commands
    this.terminal.registerCommand('env', () => this.handleEnv());
    this.terminal.registerCommand('set', (args) => this.handleSet(args));
    this.terminal.registerCommand('get', (args) => this.handleGet(args));
    this.terminal.registerCommand('functions', () => this.handleFunctions());
    
    // Help for extended commands
    this.terminal.registerCommand('help-extended', () => this.handleHelpExtended());
  }

  // REPL commands
  handleLisp() {
    this.repl.enterLispMode();
  }

  handleAlgol() {
    this.repl.enterAlgolMode();
  }

  handleRepl(args) {
    const language = args[0] || 'lisp';
    
    if (language === 'lisp') {
      this.repl.enterLispMode();
    } else if (language === 'algol') {
      this.repl.enterAlgolMode();
    } else {
      this.terminal.writeLine(`Unknown language: ${language}`, 'error');
      this.terminal.writeLine('Available: lisp, algol', 'info');
    }
  }

  handleEval(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: eval <lisp-expression>', 'error');
      return;
    }
    
    const code = args.join(' ');
    
    try {
      const result = this.lispInterpreter.eval(code);
      this.terminal.writeLine(this.repl.formatResult(result), 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleScript(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: script <language>', 'error');
      this.terminal.writeLine('Available: lisp, algol', 'info');
      return;
    }
    
    const language = args[0].toLowerCase();
    
    if (language !== 'lisp' && language !== 'algol') {
      this.terminal.writeLine(`Unknown language: ${language}`, 'error');
      return;
    }
    
    this.repl.enterMultilineMode(language);
  }

  // Filesystem commands
  handleLs(args) {
    const path = args[0] || null;
    
    try {
      const entries = this.fs.listDirectory(path);
      
      if (entries.length === 0) {
        this.terminal.writeLine('(empty directory)', 'dim');
        return;
      }
      
      this.terminal.writeLine('');
      entries.forEach(entry => {
        const type = entry.type === 'directory' ? 'DIR ' : 'FILE';
        const size = entry.type === 'file' ? `${entry.size}B`.padStart(8) : '       -';
        const name = entry.type === 'directory' ? entry.name + '/' : entry.name;
        const style = entry.type === 'directory' ? 'info' : '';
        
        this.terminal.writeLine(`${type}  ${size}  ${name}`, style);
      });
      this.terminal.writeLine('');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleCd(args) {
    if (args.length === 0) {
      this.fs.changeDirectory('/');
      return;
    }
    
    try {
      this.fs.changeDirectory(args[0]);
      this.terminal.writeLine(`Changed directory to ${this.fs.getCurrentDirectory()}`, 'dim');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handlePwd() {
    this.terminal.writeLine(this.fs.getCurrentDirectory());
  }

  handleCat(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: cat <file>', 'error');
      return;
    }
    
    try {
      const content = this.fs.readFile(args[0]);
      this.terminal.writeLine('');
      content.split('\n').forEach(line => {
        this.terminal.writeLine(line);
      });
      this.terminal.writeLine('');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleWrite(args) {
    if (args.length < 2) {
      this.terminal.writeLine('Usage: write <file> <content...>', 'error');
      this.terminal.writeLine('Or use: edit <file> for multiline editing', 'info');
      return;
    }
    
    const filename = args[0];
    const content = args.slice(1).join(' ');
    
    try {
      this.fs.writeFile(filename, content);
      this.terminal.writeLine(`File written: ${filename}`, 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleEdit(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: edit <file>', 'error');
      return;
    }
    
    const filename = args[0];
    
    // Check if file exists
    let existingContent = '';
    if (this.fs.exists(filename)) {
      try {
        existingContent = this.fs.readFile(filename);
        this.terminal.writeLine(`Editing: ${filename}`, 'info');
        this.terminal.writeLine('Current content:', 'dim');
        this.terminal.writeLine('');
        existingContent.split('\n').forEach(line => {
          this.terminal.writeLine(line, 'dim');
        });
        this.terminal.writeLine('');
      } catch (error) {
        this.terminal.writeLine(`Error reading file: ${error.message}`, 'error');
        return;
      }
    } else {
      this.terminal.writeLine(`Creating new file: ${filename}`, 'info');
    }
    
    this.terminal.writeLine('Enter content (type END on a line by itself to save):', 'info');
    this.terminal.writeLine('');
    
    // Enter multiline edit mode
    this.terminal.setPrompt('... ');
    const lines = [];
    
    const originalHandler = this.terminal.commandCallback;
    this.terminal.commandCallback = (input) => {
      if (input.trim().toUpperCase() === 'END') {
        const content = lines.join('\n');
        try {
          this.fs.writeFile(filename, content);
          this.terminal.writeLine('', 'success');
          this.terminal.writeLine(`File saved: ${filename}`, 'success');
        } catch (error) {
          this.terminal.writeLine(`Error: ${error.message}`, 'error');
        }
        this.terminal.setPrompt('> ');
        this.terminal.commandCallback = originalHandler;
      } else if (input.trim().toUpperCase() === 'CANCEL') {
        this.terminal.writeLine('Cancelled', 'warning');
        this.terminal.setPrompt('> ');
        this.terminal.commandCallback = originalHandler;
      } else {
        lines.push(input);
      }
    };
  }

  handleRm(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: rm <file>', 'error');
      return;
    }
    
    try {
      this.fs.deleteFile(args[0]);
      this.terminal.writeLine(`Deleted: ${args[0]}`, 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleMkdir(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: mkdir <directory>', 'error');
      return;
    }
    
    try {
      this.fs.mkdir(args[0]);
      this.terminal.writeLine(`Directory created: ${args[0]}`, 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleFind(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: find <pattern>', 'error');
      return;
    }
    
    try {
      const results = this.fs.find(args[0]);
      
      if (results.length === 0) {
        this.terminal.writeLine('No files found', 'dim');
        return;
      }
      
      this.terminal.writeLine('');
      this.terminal.writeLine(`Found ${results.length} file(s):`, 'info');
      results.forEach(result => {
        this.terminal.writeLine(`  ${result.path}`, 'success');
      });
      this.terminal.writeLine('');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleGrep(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: grep <pattern> [file]', 'error');
      return;
    }
    
    const pattern = args[0];
    const file = args[1] || null;
    
    try {
      const results = this.fs.grep(pattern, file);
      
      if (results.length === 0) {
        this.terminal.writeLine('No matches found', 'dim');
        return;
      }
      
      this.terminal.writeLine('');
      this.terminal.writeLine(`Found ${results.length} match(es):`, 'info');
      results.forEach(result => {
        this.terminal.writeLine(`${result.path}:${result.line}: ${result.content}`, 'success');
      });
      this.terminal.writeLine('');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  // Program execution
  handleRun(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: run <file>', 'error');
      return;
    }
    
    const filename = args[0];
    
    try {
      const content = this.fs.readFile(filename);
      const ext = filename.split('.').pop().toLowerCase();
      
      this.terminal.writeLine(`Running: ${filename}`, 'info');
      this.terminal.writeLine('');
      
      if (ext === 'lisp') {
        const result = this.lispInterpreter.eval(content);
        this.terminal.writeLine(this.repl.formatResult(result), 'success');
      } else if (ext === 'algol') {
        const compileResult = this.compiler.compile(content);
        
        if (compileResult.success) {
          const result = this.lispInterpreter.eval(compileResult.lisp);
          this.terminal.writeLine(this.repl.formatResult(result), 'success');
        } else {
          this.terminal.writeLine('Compilation errors:', 'error');
          compileResult.errors.forEach(err => {
            this.terminal.writeLine(`  ${err.toString()}`, 'error');
          });
        }
      } else {
        this.terminal.writeLine(`Unknown file type: .${ext}`, 'error');
        this.terminal.writeLine('Supported: .lisp, .algol', 'info');
      }
      
      this.terminal.writeLine('');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleExec(args) {
    // Alias for run
    this.handleRun(args);
  }

  handleCompile(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: compile <algol-file>', 'error');
      return;
    }
    
    const filename = args[0];
    
    try {
      const content = this.fs.readFile(filename);
      const result = this.compiler.compile(content);
      
      if (result.success) {
        this.terminal.writeLine('Compilation successful!', 'success');
        this.terminal.writeLine('');
        this.terminal.writeLine('Generated Lisp:', 'info');
        this.terminal.writeLine('');
        result.lisp.split('\n').forEach(line => {
          this.terminal.writeLine(line, 'dim');
        });
        this.terminal.writeLine('');
        
        // Offer to save
        const outputFile = filename.replace(/\.algol$/, '.lisp');
        this.fs.writeFile(outputFile, result.lisp);
        this.terminal.writeLine(`Saved to: ${outputFile}`, 'success');
      } else {
        this.terminal.writeLine('Compilation failed:', 'error');
        result.errors.forEach(err => {
          this.terminal.writeLine(`  ${err.toString()}`, 'error');
        });
      }
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  // WASM module interaction
  handleWasm(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: wasm <module> <function> [args...]', 'error');
      this.terminal.writeLine('Available modules: rust, fortran, go, pascal', 'info');
      return;
    }
    
    const module = args[0].toLowerCase();
    
    if (module === 'rust') {
      this.handleRust(args.slice(1));
    } else if (module === 'fortran') {
      this.handleFortran(args.slice(1));
    } else if (module === 'go') {
      this.handleGo(args.slice(1));
    } else if (module === 'pascal') {
      this.handlePascal(args.slice(1));
    } else {
      this.terminal.writeLine(`Unknown module: ${module}`, 'error');
    }
  }

  handleRust(args) {
    if (!this.orchestrator || !this.orchestrator.rustEngine) {
      this.terminal.writeLine('Rust WASM module not loaded', 'error');
      return;
    }
    
    if (args.length === 0) {
      this.terminal.writeLine('Usage: rust <function> [args...]', 'error');
      return;
    }
    
    const funcName = args[0];
    const funcArgs = args.slice(1).map(arg => {
      // Try to parse as number
      const num = parseFloat(arg);
      return isNaN(num) ? arg : num;
    });
    
    try {
      const result = this.orchestrator.rustEngine.call(funcName, ...funcArgs);
      this.terminal.writeLine(`Result: ${result}`, 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleFortran(args) {
    if (!this.orchestrator || !this.orchestrator.fortranEngine) {
      this.terminal.writeLine('Fortran WASM module not loaded', 'error');
      return;
    }
    
    if (args.length === 0) {
      this.terminal.writeLine('Usage: fortran <function> [args...]', 'error');
      return;
    }
    
    const funcName = args[0];
    const funcArgs = args.slice(1).map(arg => parseFloat(arg));
    
    try {
      const result = this.orchestrator.fortranEngine.call(funcName, ...funcArgs);
      this.terminal.writeLine(`Result: ${result}`, 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleGo(args) {
    if (!this.orchestrator || !this.orchestrator.goNeuralClusters) {
      this.terminal.writeLine('Go WASM module not loaded', 'error');
      return;
    }
    
    if (args.length === 0) {
      this.terminal.writeLine('Usage: go <command> [args...]', 'error');
      this.terminal.writeLine('Commands: list, create, update, decide', 'info');
      return;
    }
    
    const command = args[0].toLowerCase();
    
    try {
      if (command === 'list') {
        const clusters = this.orchestrator.goNeuralClusters.listClusters();
        this.terminal.writeLine('Active clusters:', 'info');
        clusters.forEach(id => {
          this.terminal.writeLine(`  - ${id}`, 'success');
        });
      } else if (command === 'create') {
        if (args.length < 2) {
          this.terminal.writeLine('Usage: go create <cluster-id>', 'error');
          return;
        }
        this.orchestrator.goNeuralClusters.createCluster(args[1]);
        this.terminal.writeLine(`Cluster created: ${args[1]}`, 'success');
      } else if (command === 'decide') {
        if (args.length < 2) {
          this.terminal.writeLine('Usage: go decide <cluster-id>', 'error');
          return;
        }
        const decision = this.orchestrator.goNeuralClusters.makeDecision(args[1]);
        this.terminal.writeLine(`Decision: ${decision}`, 'success');
      } else {
        this.terminal.writeLine(`Unknown command: ${command}`, 'error');
      }
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handlePascal(args) {
    if (!this.orchestrator || !this.orchestrator.pascalBridge) {
      this.terminal.writeLine('Pascal WASM module not loaded', 'error');
      return;
    }
    
    this.terminal.writeLine('Pascal terminal integration', 'info');
    this.terminal.writeLine('Use standard commands for Pascal functionality', 'dim');
  }

  // Environment commands
  handleEnv() {
    const env = this.lispInterpreter.getEnvironment();
    this.terminal.writeLine('');
    this.terminal.writeLine('Lisp Environment:', 'info');
    this.terminal.writeLine('');
    this.terminal.writeLine('Built-in functions:', 'dim');
    this.terminal.writeLine('  Arithmetic: +, -, *, /', 'dim');
    this.terminal.writeLine('  Comparison: <, >, =, <=, >=', 'dim');
    this.terminal.writeLine('  List: car, cdr, cons, list, length, null?', 'dim');
    this.terminal.writeLine('  Boolean: not, and, or', 'dim');
    this.terminal.writeLine('  Type: number?, string?, list?, procedure?', 'dim');
    this.terminal.writeLine('  Bridge: call-js, call-wasm', 'dim');
    this.terminal.writeLine('');
    this.terminal.writeLine('Special forms:', 'dim');
    this.terminal.writeLine('  def, lambda, if, let, set!, begin, quote', 'dim');
    this.terminal.writeLine('');
  }

  handleSet(args) {
    if (args.length < 2) {
      this.terminal.writeLine('Usage: set <name> <value>', 'error');
      return;
    }
    
    const name = args[0];
    const valueStr = args.slice(1).join(' ');
    
    try {
      // Try to parse as Lisp expression
      const value = this.lispInterpreter.eval(valueStr);
      this.lispInterpreter.define(name, value);
      this.terminal.writeLine(`Set ${name} = ${this.repl.formatResult(value)}`, 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleGet(args) {
    if (args.length === 0) {
      this.terminal.writeLine('Usage: get <name>', 'error');
      return;
    }
    
    const name = args[0];
    
    try {
      const value = this.lispInterpreter.getEnvironment().get(name);
      this.terminal.writeLine(`${name} = ${this.repl.formatResult(value)}`, 'success');
    } catch (error) {
      this.terminal.writeLine(`Error: ${error.message}`, 'error');
    }
  }

  handleFunctions() {
    this.terminal.writeLine('');
    this.terminal.writeLine('User-defined functions:', 'info');
    this.terminal.writeLine('');
    
    const env = this.lispInterpreter.getEnvironment();
    const bindings = env.bindings;
    
    let found = false;
    for (const [name, value] of Object.entries(bindings)) {
      if (typeof value === 'function' || (value && value.constructor && value.constructor.name === 'Lambda')) {
        this.terminal.writeLine(`  ${name}`, 'success');
        found = true;
      }
    }
    
    if (!found) {
      this.terminal.writeLine('  (none defined)', 'dim');
    }
    
    this.terminal.writeLine('');
  }

  handleHelpExtended() {
    this.terminal.writeLine('');
    this.terminal.writeLine('Extended Programming Commands:', 'success');
    this.terminal.writeLine('');
    
    this.terminal.writeLine('REPL & Execution:', 'info');
    this.terminal.writeLine('  lisp              - Enter Lisp REPL mode');
    this.terminal.writeLine('  algol             - Enter ALGOL REPL mode');
    this.terminal.writeLine('  eval <expr>       - Evaluate Lisp expression');
    this.terminal.writeLine('  script <lang>     - Enter multiline script mode');
    this.terminal.writeLine('  run <file>        - Execute a program file');
    this.terminal.writeLine('  compile <file>    - Compile ALGOL to Lisp');
    this.terminal.writeLine('');
    
    this.terminal.writeLine('Filesystem:', 'info');
    this.terminal.writeLine('  ls [path]         - List directory contents');
    this.terminal.writeLine('  cd <path>         - Change directory');
    this.terminal.writeLine('  pwd               - Print working directory');
    this.terminal.writeLine('  cat <file>        - Display file contents');
    this.terminal.writeLine('  write <file> ...  - Write to file');
    this.terminal.writeLine('  edit <file>       - Edit file (multiline)');
    this.terminal.writeLine('  rm <file>         - Remove file');
    this.terminal.writeLine('  mkdir <dir>       - Create directory');
    this.terminal.writeLine('  find <pattern>    - Find files by pattern');
    this.terminal.writeLine('  grep <pattern>    - Search in files');
    this.terminal.writeLine('');
    
    this.terminal.writeLine('WASM Modules:', 'info');
    this.terminal.writeLine('  rust <func> ...   - Call Rust function');
    this.terminal.writeLine('  fortran <func> .. - Call Fortran function');
    this.terminal.writeLine('  go <cmd> ...      - Interact with Go clusters');
    this.terminal.writeLine('  pascal            - Pascal terminal info');
    this.terminal.writeLine('');
    
    this.terminal.writeLine('Environment:', 'info');
    this.terminal.writeLine('  env               - Show environment info');
    this.terminal.writeLine('  set <name> <val>  - Define variable');
    this.terminal.writeLine('  get <name>        - Get variable value');
    this.terminal.writeLine('  functions         - List user functions');
    this.terminal.writeLine('');
    
    this.terminal.writeLine('Type "help" for basic commands', 'dim');
    this.terminal.writeLine('');
  }
}
