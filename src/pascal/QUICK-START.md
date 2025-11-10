# Pascal Terminal Quick Start

Get the Pascal WASM terminal running in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- Free Pascal Compiler (optional, for building from source)

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Pascal WASM (Optional)

If you have Free Pascal installed:

```bash
cd wasm/pascal
./build.sh  # Linux/Mac
# or
build.cmd   # Windows
```

Otherwise, a pre-built WASM module should be available.

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open Browser

Navigate to `http://localhost:3000`

## Testing with Mock Orchestrator

```javascript
// In browser console
import { examples } from './pascal/index.js';

// Set up Pascal terminal with mock orchestrator
const { terminal, pascalBridge, orchestrator } = 
  await examples.setupPascalTerminalWithMockOrchestrator();

// Try commands
pascalBridge.processCommand('help');
pascalBridge.processCommand('status');
pascalBridge.processCommand('quantum-entropy');
pascalBridge.processCommand('bio-sensors');
```

## Available Commands

### Blockchain Governance
```
propose-mutation algol IF x > 10 THEN y := 5
vote 1 yes
query-chain 5
```

### External Services
```
quantum-entropy
bio-sensors
status
```

### Utility
```
help
exit
```

## Example Session

```
> help

=== OuroborOS-Chimera Commands ===

Blockchain Governance:
  propose-mutation <language> <code>  - Submit mutation proposal
  vote <id> <yes|no>                  - Vote on proposal
  query-chain <generation>            - Query blockchain history

External Services:
  quantum-entropy                     - Get quantum random bits
  bio-sensors                         - Read physical sensors
  status                              - Display organism status

Utility:
  help                                - Show this help
  exit                                - Exit terminal

> status

Fetching organism status...

=== Organism Status ===

Core Metrics:
  Population:       100
  Energy:           50
  Generation:       5
  Age:              1000
  Mutation Rate:    0.05

Blockchain:
  Generation:       5
  Last Hash:        0x1234567890abcdef...
  Block Number:     500

Neural Clusters:
  Active:           2

> quantum-entropy

Requesting quantum entropy...

=== Quantum Entropy ===
Entropy Hash: 0xabcdef1234567890...
Bits: 256
Backend: qasm_simulator

> propose-mutation algol IF population > 100 THEN mutation_rate := 0.05

Submitting mutation proposal...
Compiling algol code to Ourocode...
Proposal submitted successfully!
Proposal ID: 42
Voting period: 60 seconds

> vote 42 yes

Voting YES on proposal 42...
Vote recorded successfully!
```

## Troubleshooting

### Pascal WASM Not Loading

**Error**: "Failed to load Pascal WASM"

**Solution**: 
1. Check if file exists: `public/wasm/pascal/terminal.wasm`
2. Build from source: `cd wasm/pascal && ./build.sh`
3. Use JavaScript fallback (automatic)

### Commands Not Working

**Error**: Commands typed but no response

**Solution**:
1. Check browser console for errors
2. Verify orchestrator is connected
3. Try with mock orchestrator first

### Build Fails

**Error**: "fpc: command not found"

**Solution**: Install Free Pascal:
```bash
# Ubuntu/Debian
sudo apt-get install fp-compiler

# macOS
brew install fpc

# Windows
# Download from https://www.freepascal.org/
```

## Next Steps

1. **Read Full Documentation**: See [INTEGRATION.md](./INTEGRATION.md)
2. **Run Tests**: `import { tests } from './pascal/integration-test.js'; tests.runAllTests()`
3. **Integrate with Orchestrator**: See [example.js](./example.js)
4. **Build from Source**: See [wasm/pascal/README.md](../../wasm/pascal/README.md)

## Resources

- [Pascal Bridge API](./README.md)
- [Integration Guide](./INTEGRATION.md)
- [Build Instructions](../../wasm/pascal/README.md)
- [Pascal Source Code](../../wasm/pascal/terminal.pas)

## Support

For issues or questions:
1. Check [INTEGRATION.md](./INTEGRATION.md) troubleshooting section
2. Review browser console for errors
3. Test with mock orchestrator
4. Check Pascal WASM build output
