# Fortran Engine JavaScript Wrapper

JavaScript wrapper for the Fortran WASM numeric engine, providing high-performance mathematical computations with automatic fallback to JavaScript implementations.

## Overview

The `FortranEngine` class wraps three Fortran functions compiled to WebAssembly:

1. **integrate** - Differential equation integration (Euler method)
2. **logisticGrowth** - Population growth with carrying capacity
3. **mutationProb** - Energy-based mutation probability

## Features

- **Automatic WASM Loading**: Dynamically loads Fortran WASM module
- **Memory Management**: Handles allocation/deallocation of WASM heap memory
- **Type Conversion**: Converts between JavaScript and Fortran types
- **Error Handling**: Graceful error handling with automatic fallback
- **JavaScript Fallback**: Pure JS implementations if WASM fails to load
- **Edge Case Handling**: Validates inputs and handles NaN/Infinity

## Installation

```bash
# Build the Fortran WASM module first
npm run build:fortran
```

## Usage

### Basic Usage

```javascript
import { FortranEngine } from './fortran/fortran-engine.js';

// Load the engine
const engine = await FortranEngine.load('/wasm/fortran_engine.js');

// Check status
console.log(engine.getStatus());
// { ready: true, usingFallback: false, wasmAvailable: true }

// Use the functions
const state = new Float64Array([1.0, 2.0, 3.0]);
const integrated = engine.integrate(state, 0.1);

const growth = engine.logisticGrowth(50, 0.1, 100);

const mutProb = engine.mutationProb(10, 0.1, 5);
```

### Integration

Integrate differential equations using Euler method.

```javascript
const state = new Float64Array([1.0, 2.0, 3.0, 4.0, 5.0]);
const dt = 0.1;

const result = engine.integrate(state, dt);
// result[i] = state[i] + dt * (0.1 * state[i])
```

**Parameters:**
- `stateArray` (Float64Array | number[]) - Input state vector
- `dt` (number) - Time step

**Returns:** Float64Array - Integrated state

**Performance:** ~5-8ms for 1000 elements (WASM), ~10-15ms (fallback)

### Logistic Growth

Calculate population growth with carrying capacity.

```javascript
const population = 50;
const growthRate = 0.1;
const capacity = 100;

const growth = engine.logisticGrowth(population, growthRate, capacity);
// growth = rate * population * (1 - population / capacity)
```

**Parameters:**
- `population` (number) - Current population
- `rate` (number) - Growth rate
- `capacity` (number) - Carrying capacity

**Returns:** number - Growth value

**Performance:** <0.1ms per call

### Mutation Probability

Calculate mutation probability with energy-based modulation.

```javascript
const energy = 10.0;
const baseRate = 0.1;
const temperature = 5.0;

const prob = engine.mutationProb(energy, baseRate, temperature);
// prob = baseRate * exp(-energy / temperature)
// Higher energy = lower mutation rate (stable state)
```

**Parameters:**
- `energy` (number) - Current energy level
- `baseRate` (number) - Base mutation rate
- `temperature` (number) - Temperature parameter

**Returns:** number - Mutation probability [0, 1]

**Performance:** <0.1ms per call

## Error Handling

The engine handles errors gracefully:

```javascript
// If WASM fails to load, automatically uses JavaScript fallback
const engine = await FortranEngine.load('/wasm/fortran_engine.js');

if (engine.isFallback()) {
  console.log('Using JavaScript fallback (WASM unavailable)');
}

// Edge cases are handled automatically
const result = engine.integrate(new Float64Array([1, NaN, 3]), 0.1);
// NaN values are converted to 0.0

const growth = engine.logisticGrowth(Infinity, 0.1, 100);
// Returns 0.0 for invalid inputs
```

## Edge Cases

All functions handle edge cases:

- **NaN inputs** → Returns 0.0 or zeros array
- **Infinity inputs** → Returns 0.0 or clamped values
- **Zero/negative capacity** → Returns 0.0
- **Zero/negative temperature** → Returns base rate
- **Overflow results** → Clamped to valid range

## Status Checking

```javascript
// Check if engine is ready
const status = engine.getStatus();
console.log(status);
// {
//   ready: true,
//   usingFallback: false,
//   wasmAvailable: true
// }

// Check if using fallback
if (engine.isFallback()) {
  console.log('Using JavaScript fallback');
}
```

## Performance

**WASM Performance:**
- integrate (1000 elements): ~5-8ms
- logisticGrowth: <0.1ms
- mutationProb: <0.1ms

**JavaScript Fallback Performance:**
- integrate (1000 elements): ~10-15ms
- logisticGrowth: <0.1ms
- mutationProb: <0.1ms

**Target:** Process 1000-element arrays in <16ms ✓

## Examples

See `example.js` for comprehensive usage examples:

```bash
node src/fortran/example.js
```

## Integration with Orchestrator

```javascript
import { FortranEngine } from './fortran/fortran-engine.js';
import { Orchestrator } from './orchestrator/index.js';

// Load engine
const fortran = await FortranEngine.load('/wasm/fortran_engine.js');

// Register with orchestrator
orchestrator.registerModule('fortran', {
  integrate: (state, dt) => fortran.integrate(state, dt),
  logisticGrowth: (pop, rate, cap) => fortran.logisticGrowth(pop, rate, cap),
  mutationProb: (energy, rate, temp) => fortran.mutationProb(energy, rate, temp)
});
```

## Troubleshooting

**WASM fails to load:**
- Check that `public/wasm/fortran_engine.js` and `.wasm` exist
- Verify CORS headers allow WASM loading
- Check browser console for errors
- Engine will automatically use JavaScript fallback

**Performance issues:**
- Verify WASM is loading (check `engine.isFallback()`)
- Ensure arrays are Float64Array (not regular arrays)
- Check for memory leaks (arrays are copied, not referenced)

**Build issues:**
- Ensure f2c and Emscripten are installed
- Run `npm run build:fortran` to rebuild
- Check `wasm/fortran/README.md` for build instructions

## API Reference

### FortranEngine

#### Static Methods

- `static async load(wasmPath)` - Load WASM module and create engine instance

#### Instance Methods

- `integrate(stateArray, dt)` - Integrate differential equations
- `logisticGrowth(population, rate, capacity)` - Calculate logistic growth
- `mutationProb(energy, baseRate, temperature)` - Calculate mutation probability
- `isFallback()` - Check if using JavaScript fallback
- `getStatus()` - Get engine status information

## License

Part of OuroborOS-Chimera project.
