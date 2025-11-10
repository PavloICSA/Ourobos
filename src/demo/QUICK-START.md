# Demo Quick Start Guide

Get started with the OuroborOS-Chimera demonstration in minutes.

## Prerequisites

1. **Node.js 18+** installed
2. **All services running** (optional, demo works with mocks):
   - Hardhat blockchain: `cd contracts && npx hardhat node`
   - Quantum service: `cd services/quantum && python app.py`
   - Bio sensor service: `cd services/biosensor && python app.py`

## Quick Start

### 1. Run the Full Demo

```bash
# From project root
node src/demo/example.js 1
```

This runs the complete guided demo with all 5 mutations.

### 2. Run Automated Test

```bash
# Run the automated test script
node src/demo/example.js 3
```

This runs the demo quickly and validates all components.

### 3. Run Performance Benchmarks

```bash
# Benchmark all components
node src/demo/example.js 4
```

This measures performance of each component.

## Using in Your Code

### Basic Usage

```javascript
import ChimeraOrchestrator from './orchestrator/chimera-orchestrator.js';
import { DemoWorkflow } from './demo/demo-workflow.js';

// Initialize
const orchestrator = new ChimeraOrchestrator();
await orchestrator.init();

// Run demo
const demo = new DemoWorkflow(orchestrator);
await demo.start();
```

### With Options

```javascript
const demo = new DemoWorkflow(orchestrator, {
  votingDelay: 5000,      // 5 second voting period
  stepDelay: 2000,        // 2 seconds between steps
  autoVote: true,         // Auto-vote yes
  showDetails: true,      // Show detailed logs
  autoAdvance: true       // Auto-advance steps
});

await demo.start();
```

### Manual Step Control

```javascript
const demo = new DemoWorkflow(orchestrator, {
  autoAdvance: false
});

// Execute steps one at a time
await demo.executeStep(1);
await demo.executeStep(2);
// ... etc
```

### With Event Listeners

```javascript
demo.on('stepComplete', (data) => {
  console.log(`Step ${data.step} done in ${data.duration}ms`);
});

demo.on('complete', (data) => {
  console.log(`Demo finished! Duration: ${data.duration}ms`);
});

await demo.start();
```

## Demo Mutations

The demo includes 5 mutations:

1. **Population Control** - Adjusts mutation rate based on population
2. **Energy Management** - Controls growth based on energy
3. **Sensor Adaptation** - Responds to environmental sensors
4. **Homeostasis** - Maintains balanced state
5. **Quantum Evolution** - Uses quantum entropy

Each mutation demonstrates different aspects of the system.

## Expected Output

```
=== OuroborOS-Chimera Demo ===

Welcome to the Chimera demonstration!

Service Status:
✓ Blockchain: Connected (Hardhat local)
✓ Quantum: Online (simulator mode)
○ Bio Sensors: Mock mode
✓ Go WASM: Loaded

Starting demo sequence...

--- Step 1/5: Population Control ---
Description: Adjust mutation rate based on population size

[1] Proposing mutation...
    ✓ Compiled to Ourocode
    ✓ Validated syntax
    ✓ Generated hashes
    ✓ Submitted to blockchain (proposal #1)

[2] Voting period (5s)...
    ✓ Auto-vote: YES
    ✓ Proposal approved (100% yes)

[3] Executing mutation...
    ✓ Quantum entropy: 3f7a9b2c...
    ✓ Sensor readings: light=0.52, temp=0.61, accel=0.31
    ✓ Ourocode executed
    ✓ Neural clusters updated
    ✓ Blockchain confirmed (generation #1)
    ✓ Visualization updated

Result: mutation_rate = 0.1 (population < 100)
Progress: 1/5 complete (20%)

[Continue...]
```

## Performance Targets

- **Full demo**: < 60 seconds (5 mutations)
- **Single mutation**: < 10 seconds
- **Blockchain proposal**: < 500ms
- **Quantum entropy**: < 2s (< 10ms cached)
- **Bio sensor reading**: < 100ms

## Troubleshooting

### Services Not Available

If services are unavailable, the demo automatically falls back to mock mode:

- **Blockchain**: Uses in-memory ledger
- **Quantum**: Uses WebCrypto (classical entropy)
- **Bio Sensors**: Uses simulated smooth curves

The demo will still run and demonstrate the workflow.

### Slow Performance

If the demo is slow:

1. Check that Hardhat is running locally (not remote)
2. Verify quantum service is accessible
3. Check browser console for errors
4. Try running with mock services only

### Errors

If you encounter errors:

1. Check that all dependencies are installed: `npm install`
2. Verify WASM modules are built: `npm run build:wasm`
3. Check service logs for issues
4. Try running with `showDetails: true` for more info

## Integration Testing

Run the full integration test suite:

```bash
node src/demo/integration-test.js
```

This runs 6 comprehensive tests:

1. Demo organism validation
2. Demo workflow creation
3. Single step execution
4. Full demo script
5. Real services (if available)
6. Performance benchmarks

## Next Steps

- Read [README.md](./README.md) for detailed documentation
- Check [example.js](./example.js) for 10 usage examples
- Review [demo-organism.js](./demo-organism.js) to customize mutations
- Explore [demo-workflow.js](./demo-workflow.js) to understand the flow
- See [demo-script.js](./demo-script.js) for automated testing

## Common Use Cases

### 1. Quick Demo for Presentation

```javascript
// Fast demo with minimal output
const demo = new DemoWorkflow(orchestrator, {
  votingDelay: 1000,
  stepDelay: 500,
  showDetails: false,
  autoAdvance: true
});
await demo.start();
```

### 2. Interactive Demo

```javascript
// Manual control for live demonstration
const demo = new DemoWorkflow(orchestrator, {
  autoAdvance: false,
  showDetails: true
});

// Execute steps on demand
await demo.executeStep(1);
// [explain what happened]
await demo.executeStep(2);
// [explain next step]
```

### 3. Automated Testing

```javascript
// Run full test suite
const result = await runDemoScript(orchestrator, {
  showDetails: false
});

if (result.success) {
  console.log('All tests passed!');
} else {
  console.error('Tests failed:', result.errors);
}
```

### 4. Performance Testing

```javascript
// Benchmark all components
const benchmarks = await runPerformanceBenchmarks(orchestrator);

for (const [name, result] of Object.entries(benchmarks)) {
  console.log(`${name}: ${result.actual}ms ${result.pass ? '✓' : '✗'}`);
}
```

## Support

For issues or questions:

1. Check the [README.md](./README.md) documentation
2. Review the [example.js](./example.js) file
3. Run integration tests to verify setup
4. Check service logs for errors

## See Also

- [Chimera Orchestrator](../orchestrator/CHIMERA-ORCHESTRATOR.md)
- [Blockchain Integration](../blockchain/INTEGRATION.md)
- [Quantum Service](../quantum/INTEGRATION.md)
- [Bio Sensors](../biosensor/INTEGRATION.md)
- [Meta-Compiler](../metacompiler/README.md)
