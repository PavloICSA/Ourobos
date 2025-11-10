#!/bin/bash
# Quick Deploy Script for OuroborOS-Chimera (Linux/macOS)
# Deploys to Netlify without building WASM modules

set -e

echo "========================================"
echo "OuroborOS-Chimera Quick Deploy"
echo "========================================"
echo ""

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "[ERROR] Netlify CLI not found!"
    echo ""
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo "[1/4] Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo "Not logged in. Opening browser for authentication..."
    netlify login
fi

echo "[2/4] Installing dependencies..."
npm install

echo "[3/4] Building application (quick mode - no WASM)..."
npm run build:quick

echo "[4/4] Deploying to Netlify..."
netlify deploy --prod

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "IMPORTANT: Set these environment variables in Netlify dashboard:"
echo "  - VITE_BLOCKCHAIN_MOCK=true"
echo "  - VITE_QUANTUM_MOCK=true"
echo "  - VITE_BIOSENSOR_MOCK=true"
echo ""
echo "Then redeploy: netlify deploy --prod"
echo ""
echo "Your site is now live!"
echo "========================================"
