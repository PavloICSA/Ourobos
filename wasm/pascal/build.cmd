@echo off
REM Build Pascal terminal to WASM
REM Requires Free Pascal Compiler with WASM target support

echo Building Pascal Terminal to WASM...

REM Check if fpc is installed
where fpc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Free Pascal Compiler ^(fpc^) not found
    echo Please install Free Pascal with WASM support
    echo.
    echo Installation options:
    echo   - Download from: https://www.freepascal.org/
    echo   - Or use package manager ^(Chocolatey^): choco install freepascal
    echo.
    echo Note: WASM target support may require building FPC from source
    echo See: https://wiki.freepascal.org/WebAssembly
    exit /b 1
)

REM Check FPC version
for /f "tokens=*" %%i in ('fpc -iV') do set FPC_VERSION=%%i
echo Free Pascal Compiler version: %FPC_VERSION%

REM Create output directory
if not exist "..\..\public\wasm\pascal" mkdir "..\..\public\wasm\pascal"

REM Compile Pascal to WASM
echo Compiling terminal.pas to WASM...

REM Note: As of 2024, Free Pascal WASM support is experimental
REM This may require a custom FPC build with WASM target enabled
REM Alternative: Use pas2js to compile to JavaScript instead

fpc -Twasm -h >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    REM WASM target is available
    echo Using WASM target...
    fpc -Twasm -O3 -Xs -XX -CX terminal.pas -FU..\..\public\wasm\pascal\ -o..\..\public\wasm\pascal\terminal.wasm
    
    if %ERRORLEVEL% EQU 0 (
        echo WASM compilation successful!
        echo Output: ..\..\public\wasm\pascal\terminal.wasm
    ) else (
        echo WASM compilation failed
        exit /b 1
    )
) else (
    echo Warning: WASM target not available in this FPC installation
    echo.
    echo Attempting alternative: pas2js compilation to JavaScript...
    
    where pas2js >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        REM Compile to JavaScript as fallback
        pas2js -Jirtl -Jc terminal.pas -o..\..\public\wasm\pascal\terminal.js
        
        if %ERRORLEVEL% EQU 0 (
            echo JavaScript compilation successful!
            echo Output: ..\..\public\wasm\pascal\terminal.js
            echo.
            echo Note: This is JavaScript, not WASM. For true WASM:
            echo   1. Build FPC from source with WASM support
            echo   2. Or use Emscripten to compile Pascal to WASM
        ) else (
            echo JavaScript compilation failed
            exit /b 1
        )
    ) else (
        echo Error: Neither WASM target nor pas2js available
        echo.
        echo Options:
        echo   1. Build FPC with WASM support from source
        echo   2. Install pas2js: npm install -g pas2js
        echo   3. Use alternative Pascal-to-WASM toolchain
        exit /b 1
    )
)

echo.
echo Build complete!
