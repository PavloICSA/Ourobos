@echo off
REM OuroborOS-Chimera Fortran to WASM Build Script (Windows)
REM Compile Fortran with gfortran, then link with Emscripten

echo Building Fortran numeric engine to WASM...

set FORTRAN_SRC=numeric_engine.f90
set C_SRC=numeric_engine.c
set WASM_OUTPUT=..\..\public\wasm\fortran_engine

REM Create output directory
if not exist "..\..\public\wasm" mkdir "..\..\public\wasm"

echo Step 1: Converting Fortran to C with f2c...
echo Note: This requires f2c which is not available on Windows easily.
echo Skipping Fortran build - using JavaScript fallback instead.
echo.
echo To build Fortran WASM, you need:
echo 1. Install WSL (Windows Subsystem for Linux)
echo 2. Run: sudo apt-get install f2c
echo 3. Build from WSL using build.sh
echo.
echo The app will work without Fortran WASM using JavaScript fallbacks.

exit /b 0
