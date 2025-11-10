@echo off
REM Build Pascal terminal WASM module (Windows)

echo Building Pascal terminal WASM module...

REM Check if Free Pascal compiler is available
where fpc >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Free Pascal compiler ^(fpc^) not found
    echo Install from: https://www.freepascal.org/
    exit /b 1
)

REM Build Pascal to WASM (if supported by FPC version)
REM Note: WASM target support in FPC is experimental
fpc -h | findstr /C:"wasm" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    fpc -Twasm -O3 terminal.pas -o terminal.wasm
) else (
    echo Warning: FPC WASM target not available
    echo Consider using pas2js or DOSBox-WASM as alternative
    exit /b 1
)

REM Create output directory if it doesn't exist
if not exist "..\..\public\wasm\pascal" mkdir "..\..\public\wasm\pascal"

REM Copy WASM module to public directory
copy terminal.wasm ..\..\public\wasm\pascal\

echo Pascal WASM module built successfully!
echo Output: public\wasm\pascal\terminal.wasm
