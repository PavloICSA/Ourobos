#!/bin/bash
# Build and test script for Rust WASM module

set -e

echo "=== Building Rust WASM Module ==="

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack is not installed"
    echo "Install it with: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"
    exit 1
fi

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    echo "Error: cargo is not installed"
    echo "Install Rust from: https://rustup.rs/"
    exit 1
fi

echo "Checking Rust code..."
cargo check

echo "Running Rust tests..."
cargo test

echo "Building WASM module..."
wasm-pack build --target web --out-dir ../../public/wasm/rust

echo "=== Build Complete ==="
echo "WASM module is available at: ../../public/wasm/rust/"
echo ""
echo "You can now use it in JavaScript:"
echo "  import init, { OrganismState, RuleRegistry } from './public/wasm/rust/ouroboros_rust.js';"
echo ""
echo "See example.js for usage examples."
