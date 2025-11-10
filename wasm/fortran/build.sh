#!/bin/bash
# OuroborOS-Chimera Fortran to WASM Build Script
# Converts Fortran 77/90 to C using f2c, then compiles to WASM using Emscripten

set -e

echo "Building Fortran numeric engine to WASM..."

# Configuration
FORTRAN_SRC="numeric_engine.f90"
C_OUTPUT="numeric_engine.c"
WASM_OUTPUT="../../public/wasm/fortran_engine"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

# Create output directory
mkdir -p ../../public/wasm

# Check for f2c
if ! command -v f2c &> /dev/null; then
    echo "ERROR: f2c not found. Please install f2c:"
    echo "  - Ubuntu/Debian: sudo apt-get install f2c"
    echo "  - macOS: brew install f2c"
    echo "  - Or download from: https://www.netlib.org/f2c/"
    exit 1
fi

# Check for emcc
if ! command -v emcc &> /dev/null; then
    echo "ERROR: emcc (Emscripten) not found. Please install Emscripten:"
    echo "  Visit: https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

echo "Step 1: Converting Fortran to C using f2c..."
f2c "$FORTRAN_SRC" -o "$C_OUTPUT"

if [ ! -f "$C_OUTPUT" ]; then
    echo "ERROR: f2c conversion failed"
    exit 1
fi

echo "Step 2: Compiling C to WASM using Emscripten..."
emcc "$C_OUTPUT" \
  -O3 \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="FortranModule" \
  -s EXPORTED_FUNCTIONS='["_integrate_","_logistic_growth_","_mutation_prob_","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue","HEAPF64"]' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s INITIAL_MEMORY=16777216 \
  -s MAXIMUM_MEMORY=134217728 \
  -s NO_EXIT_RUNTIME=1 \
  -s ASSERTIONS=0 \
  -lm \
  -o "${WASM_OUTPUT}.js"

if [ ! -f "${WASM_OUTPUT}.js" ]; then
    echo "ERROR: Emscripten compilation failed"
    exit 1
fi

# Clean up intermediate C file
rm -f "$C_OUTPUT"

echo "✓ Fortran WASM build complete!"
echo "  Output: ${WASM_OUTPUT}.js"
echo "  Output: ${WASM_OUTPUT}.wasm"

# Display file sizes
if [ -f "${WASM_OUTPUT}.wasm" ]; then
    WASM_SIZE=$(du -h "${WASM_OUTPUT}.wasm" | cut -f1)
    JS_SIZE=$(du -h "${WASM_OUTPUT}.js" | cut -f1)
    echo "  WASM size: $WASM_SIZE"
    echo "  JS wrapper size: $JS_SIZE"
fi
