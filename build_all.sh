#!/bin/bash
# OuroborOS-Chimera Unified Build Script
# Builds all WASM modules, smart contracts, and frontend

set -e

echo "========================================="
echo "Building OuroborOS-Chimera"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}[BUILD]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Build Rust WASM module
print_status "Building Rust orchestrator module..."
if [ -d "wasm/rust" ]; then
    cd wasm/rust
    if command -v wasm-pack &> /dev/null; then
        wasm-pack build --target web --out-dir ../../public/wasm/rust
        print_success "Rust module built"
    else
        print_error "wasm-pack not found. Install from https://rustwasm.github.io/wasm-pack/"
        exit 1
    fi
    cd ../..
else
    print_status "Rust module directory not found, skipping..."
fi

# 2. Build Fortran WASM module
print_status "Building Fortran numeric engine..."
if [ -d "wasm/fortran" ] && [ -f "wasm/fortran/build.sh" ]; then
    cd wasm/fortran
    if command -v emcc &> /dev/null; then
        bash build.sh
        print_success "Fortran module built"
    else
        print_error "Emscripten not found. Install from https://emscripten.org/"
        exit 1
    fi
    cd ../..
else
    print_status "Fortran module not ready, skipping..."
fi

# 3. Build Go WASM module
print_status "Building Go neural clusters..."
if [ -d "wasm/go" ] && [ -f "wasm/go/build_go_wasm.sh" ]; then
    cd wasm/go
    if command -v go &> /dev/null; then
        bash build_go_wasm.sh
        print_success "Go module built"
    else
        print_error "Go not found. Install from https://golang.org/"
        exit 1
    fi
    cd ../..
else
    print_status "Go module not ready, skipping..."
fi

# 4. Build Pascal WASM module
print_status "Building Pascal terminal..."
if [ -d "wasm/pascal" ] && [ -f "wasm/pascal/build.sh" ]; then
    cd wasm/pascal
    if command -v fpc &> /dev/null; then
        bash build.sh
        print_success "Pascal module built"
    else
        print_status "Free Pascal not found, skipping Pascal terminal..."
    fi
    cd ../..
else
    print_status "Pascal module not ready, skipping..."
fi

# 5. Compile Solidity contracts
print_status "Compiling smart contracts..."
if [ -d "contracts" ] && [ -f "contracts/hardhat.config.js" ]; then
    cd contracts
    if [ -f "package.json" ]; then
        npm install --silent
        npx hardhat compile
        print_success "Smart contracts compiled"
    else
        print_status "Contracts not configured yet, skipping..."
    fi
    cd ..
else
    print_status "Contracts directory not ready, skipping..."
fi

# 6. Build frontend
print_status "Building frontend..."
if command -v npm &> /dev/null; then
    npm install --silent
    npm run build
    print_success "Frontend built"
else
    print_error "npm not found. Install Node.js from https://nodejs.org/"
    exit 1
fi

echo ""
echo "========================================="
print_success "Build complete!"
echo "========================================="
echo ""
echo "Output locations:"
echo "  - Frontend: dist/"
echo "  - WASM modules: public/wasm/"
echo "  - Smart contracts: contracts/artifacts/"
echo ""
echo "Next steps:"
echo "  1. Start local blockchain: npm run blockchain:start"
echo "  2. Deploy contracts: npm run deploy:contracts"
echo "  3. Start dev server: npm run dev"
echo "  OR use Docker: docker-compose up"
