// Pascal WASM Bridge
// Provides JavaScript-Pascal interop for terminal commands

export class PascalBridge {
  constructor(orchestrator = null) {
    this.orchestrator = orchestrator;
    this.wasmModule = null;
    this.wasmInstance = null;
    this.memory = null;
    this.exports = null;
    this.terminal = null;
    
    // String encoding/decoding
    this.textEncoder = new TextEncoder();
    this.textDecoder = new TextDecoder();
  }

  /**
   * Load Pascal WASM module
   */
  async load(wasmPath = '/wasm/pascal/terminal.wasm') {
    try {
      // Create import object with JavaScript bridge functions
      const importObject = {
        env: {
          // Bridge functions called from Pascal
          jsbridge_submit_proposal: (codePtr, languagePtr) => {
            const code = this.readStringFromWASM(codePtr);
            const language = this.readStringFromWASM(languagePtr);
            this.handleSubmitProposal(code, language);
          },
          
          jsbridge_vote: (proposalId, support) => {
            this.handleVote(proposalId, support);
          },
          
          jsbridge_query_blockchain: (generation) => {
            this.handleQueryBlockchain(generation);
          },
          
          jsbridge_get_quantum_entropy: () => {
            this.handleGetQuantumEntropy();
          },
          
          jsbridge_get_bio_sensors: () => {
            this.handleGetBioSensors();
          },
          
          jsbridge_get_status: () => {
            this.handleGetStatus();
          },
          
          jsbridge_display_text: (textPtr) => {
            const text = this.readStringFromWASM(textPtr);
            this.displayText(text);
          },
          
          jsbridge_display_error: (textPtr) => {
            const text = this.readStringFromWASM(textPtr);
            this.displayText(text, 'error');
          },
          
          jsbridge_display_success: (textPtr) => {
            const text = this.readStringFromWASM(textPtr);
            this.displayText(text, 'success');
          },
          
          jsbridge_display_info: (textPtr) => {
            const text = this.readStringFromWASM(textPtr);
            this.displayText(text, 'info');
          }
        }
      };

      // Load and instantiate WASM module
      const response = await fetch(wasmPath);
      if (!response.ok) {
        throw new Error(`Failed to load Pascal WASM: ${response.statusText}`);
      }

      const wasmBuffer = await response.arrayBuffer();
      const result = await WebAssembly.instantiate(wasmBuffer, importObject);

      this.wasmInstance = result.instance;
      this.exports = result.instance.exports;
      this.memory = this.exports.memory;

      // Initialize Pascal terminal
      if (this.exports.Initialize) {
        this.exports.Initialize();
      }

      return true;
    } catch (error) {
      console.error('Failed to load Pascal WASM:', error);
      throw error;
    }
  }

  /**
   * Read null-terminated string from WASM memory
   */
  readStringFromWASM(ptr) {
    if (!this.memory || ptr === 0) {
      return '';
    }

    const memoryBuffer = new Uint8Array(this.memory.buffer);
    let length = 0;
    
    // Find null terminator
    while (memoryBuffer[ptr + length] !== 0 && length < 10000) {
      length++;
    }

    // Decode string
    const stringBytes = memoryBuffer.slice(ptr, ptr + length);
    return this.textDecoder.decode(stringBytes);
  }

  /**
   * Write string to WASM memory (if needed for future use)
   */
  writeStringToWASM(str) {
    if (!this.memory) {
      return 0;
    }

    const bytes = this.textEncoder.encode(str + '\0');
    
    // Allocate memory (simplified - in production would need proper allocator)
    // For now, we'll use a fixed buffer area
    const ptr = this.allocateString(bytes.length);
    
    if (ptr === 0) {
      return 0;
    }

    const memoryBuffer = new Uint8Array(this.memory.buffer);
    memoryBuffer.set(bytes, ptr);
    
    return ptr;
  }

  /**
   * Allocate memory for string (simplified)
   */
  allocateString(size) {
    // In a real implementation, this would call a Pascal memory allocator
    // For now, we use a simple approach
    if (this.exports.allocate) {
      return this.exports.allocate(size);
    }
    return 0;
  }

  /**
   * Process command from JavaScript
   */
  processCommand(command) {
    if (!this.exports || !this.exports.ProcessCommand) {
      console.error('Pascal WASM not loaded or ProcessCommand not exported');
      return;
    }

    try {
      const commandPtr = this.writeStringToWASM(command);
      if (commandPtr !== 0) {
        this.exports.ProcessCommand(commandPtr);
      }
    } catch (error) {
      console.error('Error processing command in Pascal:', error);
      this.displayText(`Error: ${error.message}`, 'error');
    }
  }

  /**
   * Check if Pascal terminal is running
   */
  isRunning() {
    if (!this.exports || !this.exports.IsRunning) {
      return false;
    }
    return this.exports.IsRunning();
  }

  /**
   * Set terminal for output
   */
  setTerminal(terminal) {
    this.terminal = terminal;
  }

  /**
   * Set orchestrator for command handling
   */
  setOrchestrator(orchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Display text in terminal
   */
  displayText(text, style = '') {
    if (this.terminal) {
      this.terminal.writeLine(text, style);
    } else {
      console.log(`[${style || 'text'}] ${text}`);
    }
  }

  // Command Handlers

  async handleSubmitProposal(code, language) {
    if (!this.orchestrator) {
      this.displayText('Error: Orchestrator not initialized', 'error');
      return;
    }

    try {
      this.displayText(`Compiling ${language} code to Ourocode...`, 'info');
      
      // Send to orchestrator
      const result = await this.orchestrator.proposeMutation(code, language);
      
      this.displayText(`Proposal submitted successfully!`, 'success');
      this.displayText(`Proposal ID: ${result}`, 'info');
      this.displayText(`Voting period: 60 seconds`, 'info');
    } catch (error) {
      this.displayText(`Failed to submit proposal: ${error.message}`, 'error');
    }
  }

  async handleVote(proposalId, support) {
    if (!this.orchestrator) {
      this.displayText('Error: Orchestrator not initialized', 'error');
      return;
    }

    try {
      const voteStr = support ? 'YES' : 'NO';
      this.displayText(`Voting ${voteStr} on proposal ${proposalId}...`, 'info');
      
      await this.orchestrator.vote(proposalId, support);
      
      this.displayText(`Vote recorded successfully!`, 'success');
    } catch (error) {
      this.displayText(`Failed to vote: ${error.message}`, 'error');
    }
  }

  async handleQueryBlockchain(generation) {
    if (!this.orchestrator) {
      this.displayText('Error: Orchestrator not initialized', 'error');
      return;
    }

    try {
      this.displayText(`Querying blockchain for generation ${generation}...`, 'info');
      
      const history = await this.orchestrator.getGenomeHistory(generation);
      
      if (history) {
        this.displayText('', '');
        this.displayText('=== Blockchain Record ===', 'success');
        this.displayText(`Generation: ${generation}`, 'info');
        this.displayText(`Genome Hash: ${history.hash}`, 'info');
        this.displayText(`Block Number: ${history.blockNumber}`, 'info');
        this.displayText(`Timestamp: ${new Date(history.timestamp * 1000).toISOString()}`, 'info');
        this.displayText('', '');
      } else {
        this.displayText(`No record found for generation ${generation}`, 'warning');
      }
    } catch (error) {
      this.displayText(`Failed to query blockchain: ${error.message}`, 'error');
    }
  }

  async handleGetQuantumEntropy() {
    if (!this.orchestrator) {
      this.displayText('Error: Orchestrator not initialized', 'error');
      return;
    }

    try {
      const entropy = await this.orchestrator.getQuantumEntropy();
      
      this.displayText('', '');
      this.displayText('=== Quantum Entropy ===', 'success');
      this.displayText(`Entropy Hash: ${entropy.substring(0, 64)}...`, 'info');
      this.displayText(`Bits: 256`, 'info');
      this.displayText(`Backend: ${entropy.backend || 'qasm_simulator'}`, 'info');
      this.displayText('', '');
    } catch (error) {
      this.displayText(`Failed to get quantum entropy: ${error.message}`, 'error');
    }
  }

  async handleGetBioSensors() {
    if (!this.orchestrator) {
      this.displayText('Error: Orchestrator not initialized', 'error');
      return;
    }

    try {
      const readings = await this.orchestrator.getBioSensorReadings();
      
      this.displayText('', '');
      this.displayText('=== Bio Sensor Readings ===', 'success');
      this.displayText(`Light:        ${readings.light !== null ? readings.light.toFixed(3) : 'N/A'}`, 'info');
      this.displayText(`Temperature:  ${readings.temperature !== null ? readings.temperature.toFixed(3) : 'N/A'}`, 'info');
      this.displayText(`Acceleration: ${readings.acceleration !== null ? readings.acceleration.toFixed(3) : 'N/A'}`, 'info');
      this.displayText(`Timestamp:    ${new Date(readings.timestamp * 1000).toISOString()}`, 'info');
      this.displayText('', '');
    } catch (error) {
      this.displayText(`Failed to read bio sensors: ${error.message}`, 'error');
    }
  }

  async handleGetStatus() {
    if (!this.orchestrator) {
      this.displayText('Error: Orchestrator not initialized', 'error');
      return;
    }

    try {
      const status = await this.orchestrator.getStatus();
      
      this.displayText('', '');
      this.displayText('=== Organism Status ===', 'success');
      this.displayText('', '');
      this.displayText('Core Metrics:', 'info');
      this.displayText(`  Population:       ${status.population || 0}`, '');
      this.displayText(`  Energy:           ${status.energy || 0}`, '');
      this.displayText(`  Generation:       ${status.generation || 0}`, '');
      this.displayText(`  Age:              ${status.age || 0}`, '');
      this.displayText(`  Mutation Rate:    ${status.mutationRate || 0}`, '');
      this.displayText('', '');
      
      if (status.blockchainGeneration !== undefined) {
        this.displayText('Blockchain:', 'info');
        this.displayText(`  Generation:       ${status.blockchainGeneration}`, '');
        this.displayText(`  Last Hash:        ${status.lastGenomeHash ? status.lastGenomeHash.substring(0, 16) + '...' : 'N/A'}`, '');
        this.displayText(`  Block Number:     ${status.lastBlockNumber || 'N/A'}`, '');
        this.displayText('', '');
      }
      
      if (status.activeClusterIds) {
        this.displayText('Neural Clusters:', 'info');
        this.displayText(`  Active:           ${status.activeClusterIds.length}`, '');
        this.displayText('', '');
      }
    } catch (error) {
      this.displayText(`Failed to get status: ${error.message}`, 'error');
    }
  }
}
