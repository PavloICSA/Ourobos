# Rust WASM Module Integration Guide

This guide explains how to integrate the Rust orchestrator WASM module with the JavaScript orchestrator layer.

## Prerequisites

Before building the module, ensure you have:

1. **Rust toolchain** (1.70+): Install from https://rustup.rs/
2. **wasm-pack**: Install with `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
3. **Node.js** (18+) and npm

## Building the Module

### Option 1: Using npm scripts (recommended)

```bash
# From project root
npm run build:rust
```

### Option 2: Using wasm-pack directly

```bash
cd wasm/rust
wasm-pack build --target web --out-dir ../../public/wasm/rust
```

### Option 3: Using the build script

```bash
# Linux/Mac
cd wasm/rust
chmod +x build-and-test.sh
./build-and-test.sh

# Windows
cd wasm/rust
.\build-and-test.ps1
```

## Integration with JavaScript Orchestrator

### 1. Loading the Module

```javascript
// src/orchestrator/wasm-loader.js
import init, { 
  OrganismState, 
  RuleRegistry, 
  applyRule 
} from '../../public/wasm/rust/ouroboros_rust.js';

export async function loadRustModule() {
  try {
    await init();
    return {
      OrganismState,
      RuleRegistry,
      applyRule,
      loaded: true
    };
  } catch (error) {
    console.error('Failed to load Rust WASM module:', error);
    return { loaded: false, error };
  }
}
```

### 2. Creating the Orchestrator Bridge

```javascript
// src/orchestrator/rust-bridge.js
import { loadRustModule } from './wasm-loader.js';

export class RustBridge {
  constructor() {
    this.module = null;
    this.state = null;
    this.registry = null;
  }
  
  async initialize() {
    this.module = await loadRustModule();
    
    if (!this.module.loaded) {
      throw new Error('Failed to load Rust module');
    }
    
    // Create organism state
    this.state = new this.module.OrganismState();
    
    // Create rule registry
    this.registry = new this.module.RuleRegistry();
    
    return true;
  }
  
  getState() {
    return this.state;
  }
  
  getRegistry() {
    return this.registry;
  }
  
  step(deltaTime) {
    return this.state.step(deltaTime);
  }
  
  registerRule(id, lispCode) {
    return this.registry.registerRule(id, lispCode);
  }
  
  applyRule(ruleId, params) {
    return this.module.applyRule(
      this.registry,
      this.state,
      ruleId,
      params
    );
  }
  
  getSnapshot() {
    return this.state.getSnapshot();
  }
  
  loadSnapshot(json) {
    return this.state.loadSnapshot(json);
  }
  
  getRuleStats(ruleId) {
    const stats = this.registry.getRuleStats(ruleId);
    return JSON.parse(stats);
  }
  
  getAllRuleStats() {
    const stats = this.registry.getAllStats();
    return JSON.parse(stats);
  }
}
```

### 3. Using in the Main Orchestrator

```javascript
// src/orchestrator/orchestrator.js
import { RustBridge } from './rust-bridge.js';

export class Orchestrator {
  constructor() {
    this.rustBridge = null;
    this.modules = new Map();
  }
  
  async initialize() {
    // Load Rust module
    this.rustBridge = new RustBridge();
    await this.rustBridge.initialize();
    
    this.modules.set('rust', this.rustBridge);
    
    console.log('Rust orchestrator module loaded');
  }
  
  async send(target, message) {
    if (target === 'rust') {
      return this.handleRustMessage(message);
    }
    // Handle other targets...
  }
  
  handleRustMessage(message) {
    const { type, payload } = message;
    
    switch (type) {
      case 'step':
        return this.rustBridge.step(payload.deltaTime);
      
      case 'registerRule':
        return this.rustBridge.registerRule(
          payload.id,
          payload.lispCode
        );
      
      case 'applyRule':
        return this.rustBridge.applyRule(
          payload.ruleId,
          payload.params
        );
      
      case 'getState':
        return {
          population: this.rustBridge.getState().population,
          energy: this.rustBridge.getState().energy,
          generation: this.rustBridge.getState().generation,
          age: this.rustBridge.getState().age,
          mutationRate: this.rustBridge.getState().mutationRate,
          adaptationScore: this.rustBridge.getState().adaptationScore
        };
      
      case 'snapshot':
        return this.rustBridge.getSnapshot();
      
      case 'load':
        return this.rustBridge.loadSnapshot(payload.json);
      
      case 'stats':
        if (payload.ruleId) {
          return this.rustBridge.getRuleStats(payload.ruleId);
        }
        return this.rustBridge.getAllRuleStats();
      
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }
}
```

### 4. Terminal Command Integration

```javascript
// src/terminal/commands.js
export async function handleEvolveCommand(orchestrator, steps = 1) {
  for (let i = 0; i < steps; i++) {
    const score = await orchestrator.send('rust', {
      type: 'step',
      payload: { deltaTime: 0.1 }
    });
    
    const state = await orchestrator.send('rust', {
      type: 'getState',
      payload: {}
    });
    
    terminal.writeLine(
      `Step ${i + 1}: Pop=${state.population.toFixed(2)}, ` +
      `Energy=${state.energy.toFixed(2)}, ` +
      `Score=${score.toFixed(3)}`
    );
  }
}

export async function handleStatusCommand(orchestrator) {
  const state = await orchestrator.send('rust', {
    type: 'getState',
    payload: {}
  });
  
  terminal.writeLine('=== Organism Status ===');
  terminal.writeLine(`Population: ${state.population.toFixed(2)}`);
  terminal.writeLine(`Energy: ${state.energy.toFixed(2)}`);
  terminal.writeLine(`Generation: ${state.generation}`);
  terminal.writeLine(`Age: ${state.age}`);
  terminal.writeLine(`Mutation Rate: ${state.mutationRate.toFixed(4)}`);
  terminal.writeLine(`Adaptation Score: ${state.adaptationScore.toFixed(3)}`);
}

export async function handleSaveCommand(orchestrator, name) {
  const snapshot = await orchestrator.send('rust', {
    type: 'snapshot',
    payload: {}
  });
  
  localStorage.setItem(`organism:${name}`, snapshot);
  terminal.writeLine(`Saved organism as "${name}"`);
}

export async function handleLoadCommand(orchestrator, name) {
  const snapshot = localStorage.getItem(`organism:${name}`);
  
  if (!snapshot) {
    terminal.writeLine(`Error: No saved organism named "${name}"`);
    return;
  }
  
  await orchestrator.send('rust', {
    type: 'load',
    payload: { json: snapshot }
  });
  
  terminal.writeLine(`Loaded organism "${name}"`);
}
```

## Message Protocol

The Rust module responds to these message types:

| Type | Payload | Returns | Description |
|------|---------|---------|-------------|
| `step` | `{ deltaTime: number }` | `number` | Perform evolution step, returns adaptation score |
| `registerRule` | `{ id: string, lispCode: string }` | `void` | Register a new rule |
| `applyRule` | `{ ruleId: string, params: number[] }` | `number` | Apply rule with parameters |
| `getState` | `{}` | `OrganismState` | Get current state |
| `snapshot` | `{}` | `string` | Get JSON snapshot |
| `load` | `{ json: string }` | `void` | Load from snapshot |
| `stats` | `{ ruleId?: string }` | `object` | Get rule statistics |

## Error Handling

```javascript
try {
  const result = await orchestrator.send('rust', {
    type: 'applyRule',
    payload: { ruleId: 'growth', params: [1.0] }
  });
} catch (error) {
  if (error.message.includes('Rule not found')) {
    terminal.writeLine('Error: Rule does not exist');
  } else {
    terminal.writeLine(`Error: ${error.message}`);
  }
}
```

## Performance Considerations

1. **State Access**: Use getters/setters sparingly; batch operations when possible
2. **Snapshots**: JSON serialization is expensive; cache snapshots when appropriate
3. **Rule Application**: Track execution time to identify slow rules
4. **Memory**: State vector is allocated in WASM memory; avoid frequent resizing

## Testing

```javascript
// test/rust-bridge.test.js
import { describe, test, expect, beforeAll } from 'vitest';
import { RustBridge } from '../src/orchestrator/rust-bridge.js';

describe('RustBridge', () => {
  let bridge;
  
  beforeAll(async () => {
    bridge = new RustBridge();
    await bridge.initialize();
  });
  
  test('initializes with default state', () => {
    const state = bridge.getState();
    expect(state.population).toBe(100.0);
    expect(state.energy).toBe(1000.0);
  });
  
  test('performs evolution step', () => {
    const score = bridge.step(0.1);
    expect(score).toBeGreaterThan(0);
  });
  
  test('registers and applies rules', () => {
    bridge.registerRule('test', '(lambda (state) state)');
    const result = bridge.applyRule('test', [1.0]);
    expect(result).toBeDefined();
  });
  
  test('creates and loads snapshots', () => {
    const snapshot = bridge.getSnapshot();
    expect(snapshot).toBeTruthy();
    
    bridge.loadSnapshot(snapshot);
    const state = bridge.getState();
    expect(state.population).toBeDefined();
  });
});
```

## Troubleshooting

### Module fails to load

- Ensure WASM file is in `public/wasm/rust/`
- Check browser console for CORS errors
- Verify WASM is served with correct MIME type

### Build errors

- Update Rust: `rustup update`
- Clean build: `cargo clean && wasm-pack build`
- Check Cargo.toml dependencies

### Performance issues

- Enable release mode: `wasm-pack build --release`
- Profile with browser DevTools
- Check for memory leaks in state management

## Next Steps

After integrating the Rust module:

1. Connect to Lisp interpreter (Task 11.2)
2. Implement Fortran numeric engine (Task 5)
3. Add visualization updates (Task 11.4)
4. Implement full evolution loop (Task 11.5)

## References

- [wasm-bindgen documentation](https://rustwasm.github.io/wasm-bindgen/)
- [wasm-pack guide](https://rustwasm.github.io/wasm-pack/)
- [Design document](../../.kiro/specs/ouroboros-chimera/design.md)
- [Requirements document](../../.kiro/specs/ouroboros-chimera/requirements.md)
