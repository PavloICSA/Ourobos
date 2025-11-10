@echo off
REM deploy.cmd - Production deployment script for OuroborOS-Chimera (Windows)

echo ==========================================
echo   OuroborOS-Chimera Deployment Script
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Must run from project root directory
    exit /b 1
)

REM Parse command line arguments
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set SKIP_TESTS=%2
if "%SKIP_TESTS%"=="" set SKIP_TESTS=false

echo Environment: %ENVIRONMENT%
echo Skip tests: %SKIP_TESTS%
echo.

REM Step 1: Clean previous builds
echo [1/8] Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist public\wasm\*.wasm del /q public\wasm\*.wasm
echo   Done
echo.

REM Step 2: Install dependencies
echo [2/8] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo   Error installing dependencies
    exit /b 1
)
echo   Done
echo.

REM Step 3: Run tests (unless skipped)
if "%SKIP_TESTS%" NEQ "true" (
    echo [3/8] Running tests...
    call npm test
    if %ERRORLEVEL% NEQ 0 (
        echo   Tests failed
        set /p CONTINUE="Continue anyway? (y/n) "
        if /i not "%CONTINUE%"=="y" exit /b 1
    )
    echo   Done
) else (
    echo [3/8] Skipping tests...
)
echo.

REM Step 4: Build smart contracts
echo [4/8] Building smart contracts...
cd contracts
call npx hardhat compile
cd ..
echo   Done
echo.

REM Step 5: Build WASM modules
echo [5/8] Building WASM modules...

REM Rust
if exist "wasm\rust" (
    echo   Building Rust WASM...
    cd wasm\rust
    call wasm-pack build --target web --out-dir ..\..\public\wasm\rust
    cd ..\..
    echo     Done
)

REM Fortran
if exist "wasm\fortran\build.sh" (
    echo   Building Fortran WASM...
    cd wasm\fortran
    bash build.sh
    cd ..\..
    echo     Done
)

REM Go
if exist "wasm\go\build_go_wasm.sh" (
    echo   Building Go WASM...
    cd wasm\go
    bash build_go_wasm.sh
    cd ..\..
    echo     Done
)

REM Pascal
if exist "wasm\pascal\build_pascal.sh" (
    echo   Building Pascal WASM...
    cd wasm\pascal
    bash build_pascal.sh
    cd ..\..
    echo     Done
)

echo   All WASM modules built
echo.

REM Step 6: Optimize WASM modules
echo [6/8] Optimizing WASM modules...
where wasm-opt >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call scripts\optimize-wasm.cmd
    echo   Done
) else (
    echo   Warning: wasm-opt not found, skipping optimization
    echo   Install binaryen for better WASM optimization
)
echo.

REM Step 7: Build frontend
echo [7/8] Building frontend...
if "%ENVIRONMENT%"=="production" (
    set NODE_ENV=production
)
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo   Build failed
    exit /b 1
)
echo   Done
echo.

REM Step 8: Verify build
echo [8/8] Verifying build...
if not exist "dist" (
    echo   Build failed: dist directory not found
    exit /b 1
)

if not exist "dist\index.html" (
    echo   Build failed: index.html not found
    exit /b 1
)

REM Check bundle size
for /f "tokens=3" %%a in ('dir /s dist ^| find "File(s)"') do set BUNDLE_SIZE=%%a
echo   Total files: %BUNDLE_SIZE%

echo   Build verification complete
echo.

echo ==========================================
echo   Deployment Build Complete!
echo ==========================================
echo.
echo Next steps:
echo   1. Test the build locally:
echo      npm run preview
echo.
echo   2. Deploy to Netlify:
echo      netlify deploy --prod
echo.
echo   3. Deploy to Firebase:
echo      firebase deploy
echo.
echo   4. Or copy dist\ to your web server
echo.
echo Build artifacts are in: .\dist
echo.
