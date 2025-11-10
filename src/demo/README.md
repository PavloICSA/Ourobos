# Demo Organism Module

This module provides demonstration workflows for OuroborOS-Chimera, showcasing the complete mutation cycle with all integrated components.

## Purpose

The demo organism demonstrates:
- **Blockchain governance**: Proposal submission and voting
- **Quantum entropy**: True randomness from quantum circuits
- **Bio sensor integration**: Environmental influence on mutations
- **Meta-compiler**: ALGOL to Ourocode compilation
- **Neural clusters**: Concurrent decision-making
- **Visualization**: Real-time state updates

## Components

### demo-organism.js

Defines the initial organism state and mutation sequence:

- **DEMO_INITIAL_STATE**: Starting state for demo organism
- **DEMO_ALGOL_RULES**: Simple ALGOL rules for mutations
- **DEMO_MUTATION_SEQUENCE**: Ordered sequence of 5 demo mutations

### demo-workflow.js

Implements the guided demo flow:

- **DemoWorkflow**: Main demo orchestration class
- Automated proposal → vote → execute cycle
- Step-by-step progression with explanations
- Service status monitoring
- Progress tracking

### demo-script.js

Automated testing script:

- Runs complete mutation cycle
- Verifies all services are called
- Validates state updates
- Measures performance metrics

## Demo Mutation Sequence

The demo includes 5 mutations that showcase different aspects:

1. **Population Control** - Adjusts mutation rate based on population
2. **Energy Management** - Controls growth based on energy levels
3. **Sensor Adaptation** - Responds to environmental sensors
4. **Homeostasis** - Maintains balanced organism state
5. **Quantum Evolution** - Uses quantum entropy for evolution

## Usage

### Running the Demo

```javascript
import { DemoWorkflow } from './demo/demo-workflow.js';
import ChimeraOrchestrator from './orchestrator/chimera-orchestrator.js';

// Initialize orchestrator
const orchestrator = new ChimeraOrchestrator();
await orchestrator.init();

// Create and start demo
const demo = new DemoWorkflow(orchestrator);
await demo.start();
```

### Manual Step Execution

```javascript
// Execute specific demo step
await demo.executeStep(1); // Run step 1

// Check progress
const progress = demo.getProgress();
console.log(`Completed ${progress.currentStep}/${progress.totalSteps}`);
```

### Automated Testing

```javascript
import { runDemoScript } from './demo/demo-script.js';

// Run full automated test
const results = await runDemoScript(orchestrator);
console.log('Demo completed in', results.duration, 'ms');
```

## Demo Features

### Startup Message

The demo displays an introductory message explaining:
- What OuroborOS-Chimera is
- The seven technology layers
- What to expect during the demo
- How to interact with the system

### Step-by-Step Progression

Each mutation step includes:
- Clear description of what's happening
- Expected outcome
- Service status indicators
- Real-time progress updates

### Service Monitoring

The demo shows:
- Blockchain connection status
- Quantum entropy generation
- Bio sensor readings
- Neural cluster decisions
- Visualization updates

### Automated Voting

For demo purposes, voting is automated:
- Proposals auto-vote "yes" after 5 seconds
- Simulates DAO consensus
- Allows rapid demonstration

## Configuration

Demo timing can be adjusted:

```javascript
const demo = new DemoWorkflow(orchestrator, {
  votingDelay: 5000,      // 5 seconds (vs 60 in production)
  stepDelay: 2000,        // 2 seconds between steps
  autoVote: true,         // Automatic voting
  showDetails: true       // Show detailed logs
});
```

## Requirements

Implements requirements:
- **17.1**: Demo workflow with mutation cycle
- **17.2**: Display quantum entropy generation
- **17.3**: Show bio sensor influence
- **17.4**: Visualize blockchain confirmation
- **17.5**: Complete cycle in under 2 minutes

## Performance Targets

- **Full demo cycle**: < 60 seconds (5 mutations × ~10 seconds each)
- **Single mutation**: < 10 seconds
- **Blockchain proposal**: < 500ms (local network)
- **Quantum entropy**: < 2s (< 10ms cached)
- **Bio sensor reading**: < 100ms
- **Visualization update**: 30fps

## Testing

The demo includes automated tests:

```bash
# Run demo integration test
npm run test:demo

# Run full demo script
npm run demo
```

## Troubleshooting

### Services Unavailable

If services are unavailable, the demo will:
- Use mock blockchain (in-memory ledger)
- Use classical entropy (WebCrypto fallback)
- Use simulated sensors (smooth curves)
- Continue with degraded functionality

### Slow Performance

If demo is slow:
- Check blockchain connection (use local Hardhat)
- Verify quantum service is running
- Ensure bio sensor node is accessible
- Check browser console for errors

## Example Output

```
=== OuroborOS-Chimera Demo ===

Welcome to the Chimera demonstration!

This demo will showcase:
✓ Blockchain governance (Ethereum smart contracts)
✓ Quantum entropy (Qiskit quantum circuits)
✓ Bio sensors (Raspberry Pi environmental data)
✓ Meta-compiler (ALGOL → Ourocode)
✓ Neural clusters (Go concurrent decision-making)

Service Status:
✓ Blockchain: Connected (Hardhat local)
✓ Quantum: Online (simulator mode)
✓ Bio Sensors: Mock mode
✓ Go WASM: Loaded

Starting demo sequence...

--- Step 1/5: Population Control ---
Description: Adjust mutation rate based on population size
Code: ALGOL rule (8 lines)

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

[Continue to step 2...]
```

## See Also

- [Chimera Orchestrator](../orchestrator/CHIMERA-ORCHESTRATOR.md)
- [Blockchain Integration](../blockchain/INTEGRATION.md)
- [Quantum Service](../quantum/INTEGRATION.md)
- [Bio Sensors](../biosensor/INTEGRATION.md)
