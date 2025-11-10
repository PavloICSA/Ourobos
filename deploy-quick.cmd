@echo off
REM Quick Deploy Script for OuroborOS-Chimera (Windows)
REM Deploys to Netlify without building WASM modules

echo ========================================
echo OuroborOS-Chimera Quick Deploy
echo ========================================
echo.

REM Check if netlify-cli is installed
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Netlify CLI not found!
    echo.
    echo Installing Netlify CLI...
    call npm install -g netlify-cli
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install Netlify CLI
        echo Please run: npm install -g netlify-cli
        exit /b 1
    )
)

echo [1/4] Checking Netlify authentication...
netlify status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Not logged in. Opening browser for authentication...
    call netlify login
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to login to Netlify
        exit /b 1
    )
)

echo [2/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [3/4] Building application (quick mode - no WASM)...
call npm run build:quick
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    exit /b 1
)

echo [4/4] Deploying to Netlify...
call netlify deploy --prod
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Deployment failed
    exit /b 1
)

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo IMPORTANT: Set these environment variables in Netlify dashboard:
echo   - VITE_BLOCKCHAIN_MOCK=true
echo   - VITE_QUANTUM_MOCK=true
echo   - VITE_BIOSENSOR_MOCK=true
echo.
echo Then redeploy: netlify deploy --prod
echo.
echo Your site is now live!
echo ========================================
