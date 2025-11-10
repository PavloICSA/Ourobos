# Build and test script for Rust WASM module (PowerShell)

Write-Host "=== Building Rust WASM Module ===" -ForegroundColor Green

# Check if wasm-pack is installed
if (-not (Get-Command wasm-pack -ErrorAction SilentlyContinue)) {
    Write-Host "Error: wasm-pack is not installed" -ForegroundColor Red
    Write-Host "Install it from: https://rustwasm.github.io/wasm-pack/installer/"
    exit 1
}

# Check if cargo is installed
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "Error: cargo is not installed" -ForegroundColor Red
    Write-Host "Install Rust from: https://rustup.rs/"
    exit 1
}

Write-Host "Checking Rust code..." -ForegroundColor Cyan
cargo check

Write-Host "Running Rust tests..." -ForegroundColor Cyan
cargo test

Write-Host "Building WASM module..." -ForegroundColor Cyan
wasm-pack build --target web --out-dir ../../public/wasm/rust

Write-Host "=== Build Complete ===" -ForegroundColor Green
Write-Host "WASM module is available at: ../../public/wasm/rust/" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now use it in JavaScript:"
Write-Host "  import init, { OrganismState, RuleRegistry } from './public/wasm/rust/ouroboros_rust.js';"
Write-Host ""
Write-Host "See example.js for usage examples."
