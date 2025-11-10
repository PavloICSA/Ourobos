# Pascal Terminal Integration Guide

Complete guide for integrating the Pascal WASM terminal with OuroborOS-Chimera.

## Overview

The Pascal terminal provides a retro-style command interface compiled to WebAssembly. It integrates with the Chimera orchestrator to provide blockchain governance, quantum entropy, and bio sensor commands.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Application                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  HTML/CSS UI Layer                                     │ │
│  │  - Terminal container                                  │ │
│  │  - Visualization canvas                                │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────────┐ │
│  │  JavaScript Terminal (terminal.js)                     │ │
│  │  - Keyboard input capture                              │ │
│  │  - Text rendering and cursor                           │ │
│  │  - Command history                                     │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     │ Commands                               │
│                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Pascal Bridge (pascal-bridge.js)                      │ │
│  │  - WASM module loader                                  │ │
│  │  - String encoding/decoding                            │ │
│  │  - Bridge function implementations                     │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     │ WASM Calls                             │
│                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Pascal WASM (terminal.wasm)                           │ │
│  │  - Command parsing                                     │ │
│  │  - Argument validation                                 │ │
│  │  - Bridge callbacks                                    │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     │ Orchestrator Calls                     │
│                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Chimera Orchestrator                                  │ │
│  │  - Blockchain operations                               │ │
│  │  - Quantum entropy                                     │ │
│  │  - Bio sensor readings                                 │ │
│  │  - Meta-compiler                                       │ │
│  │  - Go neural clusters                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Integration Steps

### Step 1: Basic Setup

```javascript
// main.js or app.js
import { Terminal } from './terminal/terminal.js';
import { PascalBridge } from './pascal/pascal-bridge.js';

// Create terminal
const container = document.getElementById('terminal-container');
const terminal = new Terminal(container);

// Create Pascal bridge
const pascalBridge = new PascalBridge();
pascalBridge.setTerminal(terminal);

// Load Pascal WASM
try {
  await pascalBridge.load('/wasm/pascal/terminal.wasm');
  terminal.writeLine('Pascal terminal loaded', 'success');
} catch (error) {
  terminal.writeLine('Failed to load Pascal terminal', 'error');
  // Fall back to JavaScript commands
}

// Route commands to Pascal
terminal.onCommand((command) => {
  pascalBridge.processCommand(command);
});
```

### Step 2: Connect Orchestrator

```javascript
import { ChimeraOrchestrator } from './orchestrator/chimera-orchestrator.js';

// Initialize orchestrator
const orchestrator = new ChimeraOrchestrator();
await orchestrator.init();

// Connect to Pascal bridge
pascalBridge.setOrchestrator(orchestrator);

terminal.writeLine('Orchestrator connected', 'success');
```

### Step 3: Service Health Monitoring

```javascript
// Check service health
async function checkServices() {
  terminal.writeLine('Checking services...', 'info');
  
  const services = {
    blockchain: await orchestrator.checkBlockchainHealth(),
    quantum: await orchestrator.checkQuantumHealth(),
    bioSensor: await orchestrator.checkBioSensorHealth()
  };
  
  for (const [name, healthy] of Object.entries(services)) {
    terminal.writeLine(
      `${name}: ${healthy ? 'Connected' : 'Offline'}`,
      healthy ? 'success' : 'warning'
    );
  }
}

await checkServices();
```

### Step 4: Error Handling

```javascript
// Monitor Pascal terminal
setInterval(() => {
  if (!pascalBridge.isRunning()) {
    terminal.writeLine('Pascal terminal stopped', 'warning');
  }
}, 5000);

// Handle WASM errors
window.addEventListener('error', (event) => {
  if (event.message.includes('wasm')) {
    terminal.writeLine(`WASM Error: ${event.message}`, 'error');
  }
});
```

## Complete Integration Example

```javascript
// complete-integration.js
import { Terminal } from './terminal/terminal.js';
import { PascalBridge } from './pascal/pascal-bridge.js';
import { ChimeraOrchestrator } from './orchestrator/chimera-orchestrator.js';

export async function initializeChimeraTerminal() {
  // 1. Create terminal
  const container = document.getElementById('terminal-container');
  const terminal = new Terminal(container);
  
  // Display banner
  terminal.writeLine('╔═══════════════════════════════════════════════════════════╗', 'success');
  terminal.writeLine('║      OuroborOS-Chimera - Polyglot Digital Organism       ║', 'success');
  terminal.writeLine('╚═══════════════════════════════════════════════════════════╝', 'success');
  terminal.writeLine('', '');
  
  // 2. Initialize orchestrator
  terminal.writeLine('Initializing Chimera orchestrator...', 'info');
  const orchestrator = new ChimeraOrchestrator();
  
  try {
    await orchestrator.init();
    terminal.writeLine('Orchestrator initialized', 'success');
  } catch (error) {
    terminal.writeLine(`Orchestrator failed: ${error.message}`, 'error');
    return null;
  }
  
  // 3. Load Pascal WASM
  terminal.writeLine('Loading Pascal terminal...', 'info');
  const pascalBridge = new PascalBridge(orchestrator);
  pascalBridge.setTerminal(terminal);
  
  try {
    await pascalBridge.load('/wasm/pascal/terminal.wasm');
    terminal.writeLine('Pascal terminal loaded', 'success');
  } catch (error) {
    terminal.writeLine(`Pascal load failed: ${error.message}`, 'error');
    terminal.writeLine('Using JavaScript fallback', 'warning');
    // Could fall back to JavaScript commands here
  }
  
  // 4. Route commands
  terminal.onCommand((command) => {
    pascalBridge.processCommand(command);
  });
  
  // 5. Check service health
  terminal.writeLine('', '');
  terminal.writeLine('Service Status:', 'info');
  
  const services = {
    'Blockchain': await orchestrator.checkBlockchainHealth(),
    'Quantum': await orchestrator.checkQuantumHealth(),
    'Bio Sensor': await orchestrator.checkBioSensorHealth(),
    'Go WASM': await orchestrator.checkGoWasmHealth()
  };
  
  for (const [name, healthy] of Object.entries(services)) {
    const status = healthy ? '✓ Connected' : '✗ Offline';
    const style = healthy ? 'success' : 'warning';
    terminal.writeLine(`  ${name.padEnd(12)} ${status}`, style);
  }
  
  // 6. Set up monitoring
  setInterval(async () => {
    if (!pascalBridge.isRunning()) {
      terminal.writeLine('Warning: Pascal terminal stopped', 'warning');
    }
  }, 10000);
  
  // 7. Display ready message
  terminal.writeLine('', '');
  terminal.writeLine('System ready. Type "help" for commands', 'success');
  terminal.writeLine('', '');
  
  return { terminal, pascalBridge, orchestrator };
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChimeraTerminal);
} else {
  initializeChimeraTerminal();
}
```

## Orchestrator Interface

The Pascal bridge expects the orchestrator to implement these methods:

```typescript
interface ChimeraOrchestrator {
  // Blockchain operations
  proposeMutation(code: string, language: string): Promise<number>;
  vote(proposalId: number, support: boolean): Promise<void>;
  getGenomeHistory(generation: number): Promise<GenomeRecord>;
  
  // External services
  getQuantumEntropy(): Promise<{ entropy: string; backend: string }>;
  getBioSensorReadings(): Promise<SensorReadings>;
  
  // Status
  getStatus(): Promise<OrganismStatus>;
  
  // Health checks
  checkBlockchainHealth(): Promise<boolean>;
  checkQuantumHealth(): Promise<boolean>;
  checkBioSensorHealth(): Promise<boolean>;
  checkGoWasmHealth(): Promise<boolean>;
}
```

## Command Flow

### Example: propose-mutation Command

```
1. User types: propose-mutation algol IF x > 10 THEN y := 5
                        ↓
2. Terminal captures input, calls onCommand callback
                        ↓
3. PascalBridge.processCommand() called
                        ↓
4. String written to WASM memory
                        ↓
5. Pascal ProcessCommand() function called
                        ↓
6. Pascal parses command, extracts language and code
                        ↓
7. Pascal calls JSBridge_SubmitProposal(code, language)
                        ↓
8. JavaScript bridge function invoked
                        ↓
9. PascalBridge.handleSubmitProposal() called
                        ↓
10. orchestrator.proposeMutation() called
                        ↓
11. Result displayed via displayText()
                        ↓
12. Terminal shows success message
```

## Testing

### Unit Tests

```javascript
import { tests } from './pascal/integration-test.js';

// Run all tests
const results = await tests.runAllTests();
console.log('Test results:', results);
```

### Manual Testing

```javascript
// Test in browser console
import { examples } from './pascal/index.js';

// Set up with mock orchestrator
const { terminal, pascalBridge } = 
  await examples.setupPascalTerminalWithMockOrchestrator();

// Try commands
pascalBridge.processCommand('help');
pascalBridge.processCommand('status');
pascalBridge.processCommand('quantum-entropy');
```

## Troubleshooting

### Pascal WASM Not Loading

**Symptoms**: Error message "Failed to load Pascal WASM"

**Solutions**:
1. Check file exists at `/wasm/pascal/terminal.wasm`
2. Verify server MIME type for `.wasm` files
3. Check browser console for detailed errors
4. Try building Pascal module: `cd wasm/pascal && ./build.sh`

### Commands Not Working

**Symptoms**: Commands typed but no response

**Solutions**:
1. Check orchestrator is connected: `pascalBridge.orchestrator !== null`
2. Verify Pascal is running: `pascalBridge.isRunning()`
3. Check browser console for JavaScript errors
4. Test with mock orchestrator first

### String Encoding Issues

**Symptoms**: Garbled text or crashes

**Solutions**:
1. Ensure all strings are null-terminated in Pascal
2. Check UTF-8 encoding is used
3. Verify memory boundaries in WASM
4. Test string conversion separately

### Performance Issues

**Symptoms**: Slow command response

**Solutions**:
1. Check WASM module size (should be <100KB)
2. Profile with browser DevTools
3. Reduce string allocations
4. Cache frequently used strings

## Best Practices

### 1. Error Handling

Always wrap orchestrator calls in try-catch:

```javascript
async handleSubmitProposal(code, language) {
  try {
    const result = await this.orchestrator.proposeMutation(code, language);
    this.displayText(`Success: ${result}`, 'success');
  } catch (error) {
    this.displayText(`Error: ${error.message}`, 'error');
  }
}
```

### 2. Service Degradation

Provide fallbacks when services are unavailable:

```javascript
if (!this.orchestrator) {
  this.displayText('Orchestrator offline, using mock mode', 'warning');
  return this.mockProposeMutation(code, language);
}
```

### 3. User Feedback

Always provide feedback for long operations:

```javascript
this.displayText('Submitting proposal...', 'info');
const result = await this.orchestrator.proposeMutation(code, language);
this.displayText('Proposal submitted!', 'success');
```

### 4. Memory Management

Be careful with string allocations in WASM:

```javascript
// Good: Reuse encoder/decoder
this.textEncoder = new TextEncoder();
this.textDecoder = new TextDecoder();

// Bad: Create new encoder each time
const encoder = new TextEncoder(); // Don't do this in hot path
```

## Performance Metrics

Expected performance:

- **WASM Load Time**: <100ms
- **Command Parse**: <1ms
- **String Conversion**: <0.5ms per string
- **Total Command Latency**: <2ms (excluding network)
- **Memory Usage**: ~1-2 MB

## Security Considerations

1. **Input Validation**: Pascal validates all command arguments
2. **Sandboxing**: WASM provides memory isolation
3. **No Direct Memory Access**: JavaScript cannot directly access WASM memory
4. **String Bounds**: All string operations check boundaries

## Future Enhancements

- [ ] Multi-line code input
- [ ] Command history in Pascal layer
- [ ] Tab completion
- [ ] Syntax highlighting
- [ ] Interactive proposal browser
- [ ] Real-time voting status
- [ ] Command aliases
- [ ] Macro support

## Resources

- [Pascal Bridge API](./README.md)
- [Pascal Source Code](../../wasm/pascal/terminal.pas)
- [Build Instructions](../../wasm/pascal/README.md)
- [Integration Examples](./example.js)
- [Integration Tests](./integration-test.js)
