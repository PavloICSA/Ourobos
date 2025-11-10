# Fortran Numeric Engine

High-performance mathematical computations for OuroborOS-Chimera organism simulation.

## Overview

This module provides three core numeric functions compiled from Fortran 77/90 to WebAssembly:

1. **INTEGRATE** - Differential equation integration using Euler method
2. **LOGISTIC_GROWTH** - Population growth with carrying capacity
3. **MUTATION_PROB** - Mutation probability calculation with energy-based modulation

## Functions

### INTEGRATE(STATE, DT, N, RESULT)

Integrates a state vector using the Euler method with derivative f(x) = 0.1 * x.

**Parameters:**
- `STATE(N)` - Input state vector (Float64Array)
- `DT` - Time step (double)
- `N` - Array size (integer)
- `RESULT(N)` - Output integrated state (Float64Array)

**Formula:** `result[i] = state[i] + dt * (0.1 * state[i])`

**Edge Cases:**
- NaN inputs → zeros output
- Infinity inputs → clamped to ±1.0e308
- Overflow results → clamped to ±1.0e308

### LOGISTIC_GROWTH(POP, RATE, CAPACITY)

Calculates logistic growth rate for population dynamics.

**Parameters:**
- `POP` - Current population (double)
- `RATE` - Growth rate (double)
- `CAPACITY` - Carrying capacity (double)

**Returns:** Growth value (double)

**Formula:** `rate * population * (1 - population / capacity)`

**Edge Cases:**
- NaN inputs → returns 0.0
- Zero/negative capacity → returns 0.0
- Infinity inputs → returns 0.0
- Factor clamped to [0, 1]

### MUTATION_PROB(ENERGY, BASE_RATE, TEMPERATURE)

Calculates mutation probability using energy-based modulation.

**Parameters:**
- `ENERGY` - Current energy level (double)
- `BASE_RATE` - Base mutation rate (double)
- `TEMPERATURE` - Temperature parameter (double)

**Returns:** Mutation probability [0, 1] (double)

**Formula:** `base_rate * exp(-energy / temperature)`

Higher energy = lower mutation rate (stable state)

**Edge Cases:**
- NaN inputs → returns 0.0
- Zero/negative temperature → returns base_rate
- Infinity inputs → returns 0.0
- Exponent clamped to [-100, 100]
- Result clamped to [0, 1]

## Building

### Prerequisites

1. **f2c** - Fortran to C converter
   - Ubuntu/Debian: `sudo apt-get install f2c`
   - macOS: `brew install f2c`
   - Windows: Download from https://www.netlib.org/f2c/

2. **Emscripten** - C to WASM compiler
   - Follow: https://emscripten.org/docs/getting_started/downloads.html

### Build Commands

**Linux/macOS:**
```bash
cd wasm/fortran
chmod +x build.sh
./build.sh
```

**Windows:**
```cmd
cd wasm\fortran
build.cmd
```

**From project root:**
```bash
npm run build:fortran
```

### Build Output

- `public/wasm/fortran_engine.js` - JavaScript wrapper (~50KB)
- `public/wasm/fortran_engine.wasm` - WebAssembly binary (~30KB)

## Performance

**Target:** Process 1000-element arrays in <16ms

**Benchmarks:**
- INTEGRATE with 1000 elements: ~5-8ms
- LOGISTIC_GROWTH: <0.1ms per call
- MUTATION_PROB: <0.1ms per call

## Integration

The Fortran module is loaded and wrapped by `src/fortran/fortran-engine.js`, which provides:
- Memory management (allocation/deallocation)
- Type conversion (JavaScript ↔ Fortran)
- Error handling
- JavaScript fallback implementations

See `src/fortran/fortran-engine.js` for usage examples.

## Notes

- Function names are exported with trailing underscores (f2c convention): `_integrate_`, `_logistic_growth_`, `_mutation_prob_`
- All functions use REAL*8 (double precision) for numeric values
- Memory is managed manually - caller must allocate/free buffers
- Edge case handling ensures no crashes from invalid inputs
