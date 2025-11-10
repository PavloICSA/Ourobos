#!/bin/bash
# Build Pascal terminal WASM module

set -e

echo "Building Pascal terminal WASM module..."

# Check if Free Pascal compiler is available
if ! command -v fpc &> /dev/null; then
    echo "Error: Free Pascal compiler (fpc) not found"
    echo "Install from: https://www.freepascal.org/"
    exit 1
fi

# Build Pascal to WASM (if supported by FPC version)
# Note: WASM target support in FPC is experimental
# Alternative: Use pas2js for JavaScript target
if fpc -h | grep -q "wasm"; then
    fpc -Twasm -O3 terminal.pas -o terminal.wasm
else
    echo "Warning: FPC WASM target not available"
    echo "Consider using pas2js or DOSBox-WASM as alternative"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p ../../public/wasm/pascal

# Copy WASM module to public directory
cp terminal.wasm ../../public/wasm/pascal/

echo "Pascal WASM module built successfully!"
echo "Output: public/wasm/pascal/terminal.wasm"
