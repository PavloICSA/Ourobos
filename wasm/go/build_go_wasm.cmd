@echo off
REM Build Go WASM module for neural clusters (Windows)

echo Building Go neural clusters WASM module...

REM Set WASM target
set GOOS=js
set GOARCH=wasm

REM Build the WASM module
go build -o neural_cluster.wasm neural_cluster.go

REM Create output directory if it doesn't exist
if not exist "..\..\public\wasm\go" mkdir "..\..\public\wasm\go"

REM Copy WASM module to public directory
copy neural_cluster.wasm ..\..\public\wasm\go\

REM Copy wasm_exec.js from Go installation
for /f "tokens=*" %%i in ('go env GOROOT') do set GOROOT=%%i
copy "%GOROOT%\misc\wasm\wasm_exec.js" ..\..\public\wasm\go\

echo Go WASM module built successfully!
echo Output: public\wasm\go\neural_cluster.wasm
