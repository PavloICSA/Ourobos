#!/bin/bash
# Build Pascal terminal to WASM
# Requires Free Pascal Compiler with WASM target support

set -e

echo "Building Pascal Terminal to WASM..."

# Check if fpc is installed
if ! command -v fpc &> /dev/null; then
    echo "Error: Free Pascal Compiler (fpc) not found"
    echo "Please install Free Pascal with WASM support"
    echo ""
    echo "Installation options:"
    echo "  - Download from: https://www.freepascal.org/"
    echo "  - Or use package manager:"
    echo "    Ubuntu/Debian: sudo apt-get install fp-compiler"
    echo "    macOS: brew install fpc"
    echo ""
    echo "Note: WASM target support may require building FPC from source"
    echo "See: https://wiki.freepascal.org/WebAssembly"
    exit 1
fi

# Check FPC version
FPC_VERSION=$(fpc -iV)
echo "Free Pascal Compiler version: $FPC_VERSION"

# Create output directory
mkdir -p ../../public/wasm/pascal

# Compile Pascal to WASM
echo "Compiling terminal.pas to WASM..."

# Note: As of 2024, Free Pascal WASM support is experimental
# This may require a custom FPC build with WASM target enabled
# Alternative: Use pas2js to compile to JavaScript instead

if fpc -Twasm -h &> /dev/null; then
    # WASM target is available
    echo "Using WASM target..."
    fpc -Twasm \
        -O3 \
        -Xs \
        -XX \
        -CX \
        terminal.pas \
        -FU../../public/wasm/pascal/ \
        -o../../public/wasm/pascal/terminal.wasm
    
    echo "WASM compilation successful!"
    echo "Output: ../../public/wasm/pascal/terminal.wasm"
else
    echo "Warning: WASM target not available in this FPC installation"
    echo ""
    echo "Attempting alternative: pas2js compilation to JavaScript..."
    
    if command -v pas2js &> /dev/null; then
        # Compile to JavaScript as fallback
        pas2js -Jirtl -Jc terminal.pas -o../../public/wasm/pascal/terminal.js
        
        echo "JavaScript compilation successful!"
        echo "Output: ../../public/wasm/pascal/terminal.js"
        echo ""
        echo "Note: This is JavaScript, not WASM. For true WASM:"
        echo "  1. Build FPC from source with WASM support"
        echo "  2. Or use Emscripten to compile Pascal to WASM"
    else
        echo "Error: Neither WASM target nor pas2js available"
        echo ""
        echo "Options:"
        echo "  1. Build FPC with WASM support from source"
        echo "  2. Install pas2js: npm install -g pas2js"
        echo "  3. Use alternative Pascal-to-WASM toolchain"
        exit 1
    fi
fi

echo ""
echo "Build complete!"
