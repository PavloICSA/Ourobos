@echo off
REM OuroborOS-Chimera Fortran to WASM Build Script (Windows)
REM Converts Fortran 77/90 to C using f2c, then compiles to WASM using Emscripten

echo Building Fortran numeric engine to WASM...

REM Configuration
set FORTRAN_SRC=numeric_engine.f90
set C_OUTPUT=numeric_engine.c
set WASM_OUTPUT=..\..\public\wasm\fortran_engine

REM Create output directory
if not exist "..\..\public\wasm" mkdir "..\..\public\wasm"

REM Check for f2c
where f2c >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: f2c not found. Please install f2c.
    echo Download from: https://www.netlib.org/f2c/
    exit /b 1
)

REM Check for emcc
where emcc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: emcc ^(Emscripten^) not found. Please install Emscripten.
    echo Visit: https://emscripten.org/docs/getting_started/downloads.html
    exit /b 1
)

echo Step 1: Converting Fortran to C using f2c...
f2c %FORTRAN_SRC% -o %C_OUTPUT%

if not exist "%C_OUTPUT%" (
    echo ERROR: f2c conversion failed
    exit /b 1
)

echo Step 2: Compiling C to WASM using Emscripten...
call emcc %C_OUTPUT% ^
  -O3 ^
  -s WASM=1 ^
  -s MODULARIZE=1 ^
  -s EXPORT_NAME="FortranModule" ^
  -s EXPORTED_FUNCTIONS="[\"_integrate_\",\"_logistic_growth_\",\"_mutation_prob_\",\"_malloc\",\"_free\"]" ^
  -s EXPORTED_RUNTIME_METHODS="[\"ccall\",\"cwrap\",\"getValue\",\"setValue\",\"HEAPF64\"]" ^
  -s ALLOW_MEMORY_GROWTH=1 ^
  -s INITIAL_MEMORY=16777216 ^
  -s MAXIMUM_MEMORY=134217728 ^
  -s NO_EXIT_RUNTIME=1 ^
  -s ASSERTIONS=0 ^
  -lm ^
  -o %WASM_OUTPUT%.js

if not exist "%WASM_OUTPUT%.js" (
    echo ERROR: Emscripten compilation failed
    exit /b 1
)

REM Clean up intermediate C file
del /f /q %C_OUTPUT% 2>nul

echo.
echo Build complete!
echo   Output: %WASM_OUTPUT%.js
echo   Output: %WASM_OUTPUT%.wasm
