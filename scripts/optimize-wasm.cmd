@echo off
REM optimize-wasm.cmd - Optimize all WASM modules with wasm-opt (Windows)

echo Optimizing WASM modules...

REM Check if wasm-opt is installed
where wasm-opt >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Warning: wasm-opt not found. Install binaryen for WASM optimization:
    echo   Download from https://github.com/WebAssembly/binaryen/releases
    echo Skipping WASM optimization...
    exit /b 0
)

REM Optimize Rust WASM
if exist "public\wasm\rust\ouroboros_rust_bg.wasm" (
    echo Optimizing Rust WASM...
    wasm-opt -Oz --enable-bulk-memory --enable-simd public\wasm\rust\ouroboros_rust_bg.wasm -o public\wasm\rust\ouroboros_rust_bg.wasm
    echo   Rust WASM optimized
)

REM Optimize Fortran WASM
if exist "public\wasm\fortran_engine.wasm" (
    echo Optimizing Fortran WASM...
    wasm-opt -Oz --enable-bulk-memory public\wasm\fortran_engine.wasm -o public\wasm\fortran_engine.wasm
    echo   Fortran WASM optimized
)

REM Optimize Go WASM
if exist "public\wasm\neural_cluster.wasm" (
    echo Optimizing Go WASM...
    wasm-opt -Oz --enable-bulk-memory public\wasm\neural_cluster.wasm -o public\wasm\neural_cluster.wasm
    echo   Go WASM optimized
)

REM Optimize Pascal WASM
if exist "public\wasm\terminal.wasm" (
    echo Optimizing Pascal WASM...
    wasm-opt -Oz --enable-bulk-memory public\wasm\terminal.wasm -o public\wasm\terminal.wasm
    echo   Pascal WASM optimized
)

echo WASM optimization complete!
