#!/bin/bash
# optimize-wasm.sh - Optimize all WASM modules with wasm-opt

set -e

echo "Optimizing WASM modules..."

# Check if wasm-opt is installed
if ! command -v wasm-opt &> /dev/null; then
    echo "Warning: wasm-opt not found. Install binaryen for WASM optimization:"
    echo "  - macOS: brew install binaryen"
    echo "  - Linux: apt-get install binaryen or download from https://github.com/WebAssembly/binaryen"
    echo "  - Windows: Download from https://github.com/WebAssembly/binaryen/releases"
    echo "Skipping WASM optimization..."
    exit 0
fi

# Optimize Rust WASM
if [ -f "public/wasm/rust/ouroboros_rust_bg.wasm" ]; then
    echo "Optimizing Rust WASM..."
    wasm-opt -Oz --enable-bulk-memory --enable-simd \
        public/wasm/rust/ouroboros_rust_bg.wasm \
        -o public/wasm/rust/ouroboros_rust_bg.wasm
    echo "  Rust WASM optimized"
fi

# Optimize Fortran WASM
if [ -f "public/wasm/fortran_engine.wasm" ]; then
    echo "Optimizing Fortran WASM..."
    wasm-opt -Oz --enable-bulk-memory \
        public/wasm/fortran_engine.wasm \
        -o public/wasm/fortran_engine.wasm
    echo "  Fortran WASM optimized"
fi

# Optimize Go WASM
if [ -f "public/wasm/neural_cluster.wasm" ]; then
    echo "Optimizing Go WASM..."
    wasm-opt -Oz --enable-bulk-memory \
        public/wasm/neural_cluster.wasm \
        -o public/wasm/neural_cluster.wasm
    echo "  Go WASM optimized"
fi

# Optimize Pascal WASM
if [ -f "public/wasm/terminal.wasm" ]; then
    echo "Optimizing Pascal WASM..."
    wasm-opt -Oz --enable-bulk-memory \
        public/wasm/terminal.wasm \
        -o public/wasm/terminal.wasm
    echo "  Pascal WASM optimized"
fi

echo "WASM optimization complete!"
echo ""
echo "Optimization flags used:"
echo "  -Oz: Optimize aggressively for size"
echo "  --enable-bulk-memory: Enable bulk memory operations"
echo "  --enable-simd: Enable SIMD operations (Rust only)"
