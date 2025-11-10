#!/bin/bash
# Build Go WASM module for neural clusters

set -e

echo "Building Go neural clusters WASM module..."

# Set WASM target
export GOOS=js
export GOARCH=wasm

# Build the WASM module
go build -o neural_cluster.wasm neural_cluster.go

# Create output directory if it doesn't exist
mkdir -p ../../public/wasm/go

# Copy WASM module to public directory
cp neural_cluster.wasm ../../public/wasm/go/

# Copy wasm_exec.js from Go installation
GOROOT=$(go env GOROOT)
cp "$GOROOT/misc/wasm/wasm_exec.js" ../../public/wasm/go/

echo "Go WASM module built successfully!"
echo "Output: public/wasm/go/neural_cluster.wasm"
