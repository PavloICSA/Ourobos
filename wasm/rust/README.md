# Rust Orchestrator WASM Module

This module provides the core organism state management and rule execution tracking for OuroborOS-Chimera.

## Components

### OrganismState

The `OrganismState` struct manages the core metrics and state of the organism:

- **Core Metrics**: population, energy, generation, age
- **Evolution Parameters**: mutation_rate, selection_pressure, adaptation_score
- **State Vector**: Numeric state for Fortran computations

#### Key Methods

- `new()` - Create a new organism with default values
- `initFromConfig(json)` - Initialize from JSON configuration
- `step(delta_time)` - Perform one evolution step
- `getSnapshot()` - Export state as JSON
- `loadSnapshot(json)` - Restore state from JSON
- Getters/setters for all properties

### RuleRegistry

The `RuleRegistry` manages the collection of executable rules and tracks their execution:

- **Rule Storage**: HashMap of rules with metadata
- **Execution Tracking**: Counts, timing, and statistics
- **Execution Order**: Maintains rule execution sequence

#### Key Methods

- `new()` - Create empty registry
- `registerRule(id, lisp_code)` - Add a new rule
- `removeRule(id)` - Remove a rule
- `getRuleCode(id)` - Get Lisp code for a rule
- `recordExecution(id, time_ms)` - Track execution timing
- `getRuleStats(id)` - Get statistics for a rule
- `getAllStats()` - Get all rule statistics
- `exportRegistry()` - Export as JSON
- `importRegistry(json)` - Import from JSON

### Rule Application

The `applyRule()` function coordinates rule execution:

- Takes registry, state, rule_id, and parameters
- Tracks execution timing
- Updates rule statistics
- Returns adaptation score

## Building

```bash
# Build the WASM module
npm run build:rust

# Or directly with wasm-pack
cd wasm/rust
wasm-pack build --target web --out-dir ../../public/wasm/rust
```

## Requirements

- Rust toolchain (1.70+)
- wasm-pack
- wasm-bindgen

## Dependencies

- `wasm-bindgen` - Rust/JavaScript interop
- `serde` - Serialization/deserialization
- `serde-wasm-bindgen` - WASM-specific serde support
- `serde_json` - JSON handling

## Usage from JavaScript

```javascript
import init, { OrganismState, RuleRegistry, applyRule } from './public/wasm/rust/ouroboros_rust.js';

// Initialize the WASM module
await init();

// Create organism state
const state = new OrganismState();
console.log(state.population); // 100.0

// Perform evolution step
const score = state.step(0.1);
console.log(score);

// Create rule registry
const registry = new RuleRegistry();
registry.registerRule('growth', '(lambda (state) (+ population 10))');

// Apply rule
const result = applyRule(registry, state, 'growth', [1.0, 2.0]);

// Get statistics
const stats = registry.getRuleStats('growth');
console.log(JSON.parse(stats));

// Export state
const snapshot = state.getSnapshot();
localStorage.setItem('organism', snapshot);

// Load state
const loaded = new OrganismState();
loaded.loadSnapshot(localStorage.getItem('organism'));
```

## Architecture Notes

This module implements Requirements 2.1, 2.3, 4.1, and 4.3 from the design specification:

- **2.1**: WASM module loading and initialization
- **2.3**: Shared memory and typed array support via state vector
- **4.1**: Rule execution and state modification
- **4.3**: Execution tracking and statistics

The module is designed to work with the JavaScript orchestrator and Lisp interpreter. The `applyRule` function currently contains placeholder logic that will be replaced with actual Lisp interpreter integration in later tasks.

## Performance

- State operations: O(1)
- Rule lookup: O(1) via HashMap
- Serialization: O(n) where n is state size
- Optimized for size with `opt-level = "z"` and LTO

## Future Enhancements

- Direct Lisp interpreter integration
- Parallel rule execution
- State diffing for efficient updates
- Hot-swap support for module replacement
