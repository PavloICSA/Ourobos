#!/bin/bash
# deploy.sh - Production deployment script for OuroborOS-Chimera

set -e

echo "=========================================="
echo "  OuroborOS-Chimera Deployment Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Must run from project root directory"
    exit 1
fi

# Parse command line arguments
ENVIRONMENT=${1:-production}
SKIP_TESTS=${2:-false}

echo "Environment: $ENVIRONMENT"
echo "Skip tests: $SKIP_TESTS"
echo ""

# Step 1: Clean previous builds
echo "[1/8] Cleaning previous builds..."
rm -rf dist
rm -rf public/wasm/*.wasm
echo "  ✓ Clean complete"
echo ""

# Step 2: Install dependencies
echo "[2/8] Installing dependencies..."
npm install
echo "  ✓ Dependencies installed"
echo ""

# Step 3: Run tests (unless skipped)
if [ "$SKIP_TESTS" != "true" ]; then
    echo "[3/8] Running tests..."
    npm test || {
        echo "  ✗ Tests failed"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
    echo "  ✓ Tests passed"
else
    echo "[3/8] Skipping tests..."
fi
echo ""

# Step 4: Build smart contracts
echo "[4/8] Building smart contracts..."
cd contracts
npx hardhat compile
cd ..
echo "  ✓ Contracts compiled"
echo ""

# Step 5: Build WASM modules
echo "[5/8] Building WASM modules..."

# Rust
if [ -d "wasm/rust" ]; then
    echo "  Building Rust WASM..."
    cd wasm/rust
    wasm-pack build --target web --out-dir ../../public/wasm/rust
    cd ../..
    echo "    ✓ Rust WASM built"
fi

# Fortran
if [ -d "wasm/fortran" ] && [ -f "wasm/fortran/build.sh" ]; then
    echo "  Building Fortran WASM..."
    cd wasm/fortran
    bash build.sh
    cd ../..
    echo "    ✓ Fortran WASM built"
fi

# Go
if [ -d "wasm/go" ] && [ -f "wasm/go/build_go_wasm.sh" ]; then
    echo "  Building Go WASM..."
    cd wasm/go
    bash build_go_wasm.sh
    cd ../..
    echo "    ✓ Go WASM built"
fi

# Pascal
if [ -d "wasm/pascal" ] && [ -f "wasm/pascal/build_pascal.sh" ]; then
    echo "  Building Pascal WASM..."
    cd wasm/pascal
    bash build_pascal.sh
    cd ../..
    echo "    ✓ Pascal WASM built"
fi

echo "  ✓ All WASM modules built"
echo ""

# Step 6: Optimize WASM modules
echo "[6/8] Optimizing WASM modules..."
if command -v wasm-opt &> /dev/null; then
    bash scripts/optimize-wasm.sh
    echo "  ✓ WASM optimization complete"
else
    echo "  ⚠ wasm-opt not found, skipping optimization"
    echo "    Install binaryen for better WASM optimization"
fi
echo ""

# Step 7: Build frontend
echo "[7/8] Building frontend..."
if [ "$ENVIRONMENT" = "production" ]; then
    NODE_ENV=production npm run build
else
    npm run build
fi
echo "  ✓ Frontend built"
echo ""

# Step 8: Verify build
echo "[8/8] Verifying build..."
if [ ! -d "dist" ]; then
    echo "  ✗ Build failed: dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "  ✗ Build failed: index.html not found"
    exit 1
fi

# Check for WASM files
WASM_COUNT=$(find dist -name "*.wasm" 2>/dev/null | wc -l)
echo "  Found $WASM_COUNT WASM files"

# Check bundle size
BUNDLE_SIZE=$(du -sh dist | cut -f1)
echo "  Total bundle size: $BUNDLE_SIZE"

echo "  ✓ Build verification complete"
echo ""

echo "=========================================="
echo "  Deployment Build Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Test the build locally:"
echo "     npm run preview"
echo ""
echo "  2. Deploy to Netlify:"
echo "     netlify deploy --prod"
echo ""
echo "  3. Deploy to Firebase:"
echo "     firebase deploy"
echo ""
echo "  4. Or copy dist/ to your web server"
echo ""
echo "Build artifacts are in: ./dist"
echo ""
