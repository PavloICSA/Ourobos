@echo off
REM OuroborOS-Chimera Unified Build Script (Windows)
REM Builds all WASM modules, smart contracts, and frontend

echo =========================================
echo Building OuroborOS-Chimera
echo =========================================
echo.

REM 1. Build Rust WASM module
echo [BUILD] Building Rust orchestrator module...
if exist "wasm\rust" (
    cd wasm\rust
    where wasm-pack >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        wasm-pack build --target web --out-dir ../../public/wasm/rust
        echo [SUCCESS] Rust module built
    ) else (
        echo [ERROR] wasm-pack not found. Install from https://rustwasm.github.io/wasm-pack/
        exit /b 1
    )
    cd ..\..
) else (
    echo [BUILD] Rust module directory not found, skipping...
)

REM 2. Build Fortran WASM module
echo [BUILD] Building Fortran numeric engine...
if exist "wasm\fortran\build.cmd" (
    cd wasm\fortran
    where emcc >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        call build.cmd
        echo [SUCCESS] Fortran module built
    ) else (
        echo [ERROR] Emscripten not found. Install from https://emscripten.org/
        exit /b 1
    )
    cd ..\..
) else (
    echo [BUILD] Fortran module not ready, skipping...
)

REM 3. Build Go WASM module
echo [BUILD] Building Go neural clusters...
if exist "wasm\go\build_go_wasm.cmd" (
    cd wasm\go
    where go >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        call build_go_wasm.cmd
        echo [SUCCESS] Go module built
    ) else (
        echo [ERROR] Go not found. Install from https://golang.org/
        exit /b 1
    )
    cd ..\..
) else (
    echo [BUILD] Go module not ready, skipping...
)

REM 4. Build Pascal WASM module
echo [BUILD] Building Pascal terminal...
if exist "wasm\pascal\build.cmd" (
    cd wasm\pascal
    where fpc >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        call build.cmd
        echo [SUCCESS] Pascal module built
    ) else (
        echo [BUILD] Free Pascal not found, skipping Pascal terminal...
    )
    cd ..\..
) else (
    echo [BUILD] Pascal module not ready, skipping...
)

REM 5. Compile Solidity contracts
echo [BUILD] Compiling smart contracts...
if exist "contracts\hardhat.config.js" (
    cd contracts
    if exist "package.json" (
        call npm install --silent
        call npx hardhat compile
        echo [SUCCESS] Smart contracts compiled
    ) else (
        echo [BUILD] Contracts not configured yet, skipping...
    )
    cd ..
) else (
    echo [BUILD] Contracts directory not ready, skipping...
)

REM 6. Build frontend
echo [BUILD] Building frontend...
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call npm install --silent
    call npm run build
    echo [SUCCESS] Frontend built
) else (
    echo [ERROR] npm not found. Install Node.js from https://nodejs.org/
    exit /b 1
)

echo.
echo =========================================
echo [SUCCESS] Build complete!
echo =========================================
echo.
echo Output locations:
echo   - Frontend: dist\
echo   - WASM modules: public\wasm\
echo   - Smart contracts: contracts\artifacts\
echo.
echo Next steps:
echo   1. Start local blockchain: npm run blockchain:start
echo   2. Deploy contracts: npm run deploy:contracts
echo   3. Start dev server: npm run dev
echo   OR use Docker: docker-compose up
