# Go Neural Clusters WASM - Quick Start Guide

This guide will help you build and test the Go neural clusters WASM module.

## Prerequisites

### Required
- **Go 1.21+**: Download from https://golang.org/dl/
- **Node.js 18+**: For running the JavaScript bridge

### Verify Installation
```bash
go version  # Should show Go 1.21 or later
node --version  # Should show Node 18 or later
```

## Building the Module

### Step 1: Navigate to the Go WASM directory
```bash
cd wasm/go
```

### Step 2: Build the WASM module

**On Linux/Mac:**
```bash
chmod +x build_go_wasm.sh
./build_go_wasm.sh
```

**On Windows:**
```cmd
build_go_wasm.cmd
```

### What the build does:
1. Sets `GOOS=js` and `GOARCH=wasm` environment variables
2. Compiles `neural_cluster.go` to `neural_cluster.wasm`
3. Creates `public/wasm/go/` directory if it doesn't exist
4. Copies the WASM module to `public/wasm/go/neural_cluster.wasm`
5. Copies `wasm_exec.js` from your Go installation to `public/wasm/go/`

### Expected Output:
```
Building Go neural clusters WASM module...
Go WASM module built successfully!
Output: public/wasm/go/neural_cluster.wasm
```

## Verifying the Build

Check that the following files were created:
```bash
ls -la ../../public/wasm/go/
```

You should see:
- `neural_cluster.wasm` (the compiled Go module)
- `wasm_exec.js` (Go WASM runtime support)

## Testing the Module

### Step 1: Create a test HTML file

Create `test.html` in the project root:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Go Neural Clusters Test</title>
</head>
<body>
    <h1>Go Neural Clusters WASM Test</h1>
    <div id="output"></div>
    
    <script src="public/wasm/go/wasm_exec.js"></script>
    <script type="module">
        const go = new Go();
        
        async function loadWasm() {
            const result = await WebAssembly.instantiateStreaming(
                fetch('public/wasm/go/neural_cluster.wasm'),
                go.importObject
            );
            
            // Run the Go program
            go.run(result.instance);
            
            // Wait a bit for Go to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Test the functions
            const output = document.getElementById('output');
            
            // Create a cluster
            const clusterId = goCreateCluster('test-cluster');
            output.innerHTML += `<p>Created cluster: ${clusterId}</p>`;
            
            // Update state
            const state = JSON.stringify({
                population: 100,
                energy: 75,
                mutation_rate: 0.08
            });
            const updateResult = goUpdateClusterState(clusterId, state);
            output.innerHTML += `<p>Update result: ${updateResult}</p>`;
            
            // Get a decision
            setTimeout(() => {
                const decisionJSON = goGetClusterDecision(clusterId);
                if (decisionJSON) {
                    const decision = JSON.parse(decisionJSON);
                    output.innerHTML += `<p>Decision: ${decision.action} (confidence: ${decision.confidence})</p>`;
                }
            }, 200);
            
            // List clusters
            const clusters = goListClusters();
            output.innerHTML += `<p>Active clusters: ${clusters.length}</p>`;
        }
        
        loadWasm().catch(err => {
            console.error('Failed to load WASM:', err);
            document.getElementById('output').innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
        });
    </script>
</body>
</html>
```

### Step 2: Serve the test file

You need a local web server because browsers don't allow loading WASM from `file://` URLs.

**Using Python:**
```bash
python -m http.server 8080
```

**Using Node.js:**
```bash
npx http-server -p 8080
```

**Using npm (if you have the dev server configured):**
```bash
npm run dev
```

### Step 3: Open in browser

Navigate to: http://localhost:8080/test.html

You should see:
- "Created cluster: test-cluster"
- "Update result: ok"
- A decision with action and confidence
- "Active clusters: 1"

## Integration with JavaScript

See `src/go-bridge/README.md` for the JavaScript bridge API.

Quick example:
```javascript
import { GoNeuralClusters } from './src/go-bridge/bridge.js';

const clusters = new GoNeuralClusters();
await clusters.init();

const id = clusters.createCluster('main');
clusters.updateClusterState(id, {
    population: 100,
    energy: 50,
    mutation_rate: 0.05
});

const decision = clusters.getClusterDecision(id);
console.log(decision);
```

## Troubleshooting

### "go: command not found"
- Install Go from https://golang.org/dl/
- Make sure Go is in your PATH: `export PATH=$PATH:/usr/local/go/bin`

### "wasm_exec.js not found"
- The build script copies this from your Go installation
- Manual location: `$(go env GOROOT)/misc/wasm/wasm_exec.js`
- Copy it manually to `public/wasm/go/` if needed

### WASM module fails to load in browser
- Make sure you're using a web server (not `file://` protocol)
- Check browser console for CORS errors
- Verify the WASM file exists at `public/wasm/go/neural_cluster.wasm`

### "WebAssembly.instantiateStreaming failed"
- Your browser might not support streaming compilation
- Use `WebAssembly.instantiate()` with `fetch().then(r => r.arrayBuffer())` instead

### Decisions are always null
- Wait at least 100ms after creating a cluster before requesting decisions
- The decision-making goroutine needs time to generate decisions

## Building as Part of Full Project

To build all WASM modules including Go:

**Linux/Mac:**
```bash
./build_all.sh
```

**Windows:**
```cmd
build_all.cmd
```

This will build:
- Rust orchestrator module
- Fortran numeric engine
- Go neural clusters (this module)
- Pascal terminal
- Solidity smart contracts
- Frontend bundle

## Next Steps

1. **Implement JavaScript Bridge**: See task 7.3 in the implementation plan
2. **Integrate with Orchestrator**: See task 7.4 in the implementation plan
3. **Test with Real Mutations**: Connect to the blockchain and quantum services

## Resources

- [Go WASM Documentation](https://github.com/golang/go/wiki/WebAssembly)
- [syscall/js Package](https://pkg.go.dev/syscall/js)
- [Go WASM Examples](https://github.com/golang/go/wiki/WebAssembly#getting-started)
