# Quantum Entropy Integration Guide

This guide shows how to integrate the quantum entropy service into OuroborOS-Chimera.

## Quick Start

### 1. Start the Quantum Service

Using Docker Compose (recommended):

```bash
docker-compose up quantum
```

Or locally:

```bash
cd services/quantum
python app.py
```

### 2. Use in JavaScript

```javascript
import { QuantumEntropyClient } from './quantum/client.js';
import config from './config/index.js';

// Create client
const quantumClient = new QuantumEntropyClient(
  config.quantum.apiUrl,
  config.quantum.useMock
);

// Get quantum entropy
const entropy = await quantumClient.getEntropy(256);
console.log('Quantum entropy:', entropy);

// Check service health
const healthy = await quantumClient.healthCheck();
console.log('Service healthy:', healthy);
```

## Integration with Orchestrator

The quantum client is designed to integrate with the ChimeraOrchestrator:

```javascript
import { ChimeraOrchestrator } from './orchestrator/index.js';
import { QuantumEntropyClient } from './quantum/client.js';
import config from './config/index.js';

class ChimeraOrchestrator {
  constructor() {
    // Initialize quantum client
    this.quantumClient = new QuantumEntropyClient(
      config.quantum.apiUrl,
      config.quantum.useMock
    );
  }
  
  async executeMutation(proposalId) {
    // Get quantum entropy for mutation
    const quantumEntropy = await this.quantumClient.getEntropy(256);
    
    // Use entropy in mutation parameters
    const mutationParams = {
      entropy: quantumEntropy,
      // ... other params
    };
    
    // Execute mutation with quantum randomness
    await this.executeInRuntime(ourocodeModule, mutationParams);
  }
}
```

## Configuration

Configure in `src/config/index.js`:

```javascript
export default {
  quantum: {
    apiUrl: process.env.VITE_QUANTUM_API || 'http://localhost:5000',
    useMock: process.env.VITE_QUANTUM_MOCK === 'true'
  }
};
```

Environment variables:

```bash
# .env
VITE_QUANTUM_API=http://localhost:5000
VITE_QUANTUM_MOCK=false
```

## Features

### Entropy Pool

The client maintains a pool of pre-fetched entropy for low-latency access:

```javascript
// Get entropy (from pool if available, <10ms)
const entropy = await quantumClient.getEntropy(256);

// Check pool level
const level = quantumClient.getPoolLevel();
console.log(`Pool: ${level}/10 entries`);
```

### Automatic Fallback

If the quantum service is unavailable, the client automatically falls back to WebCrypto:

```javascript
// Service unavailable? No problem!
const entropy = await quantumClient.getEntropy(256);
// Returns classical entropy from WebCrypto

// Check if in mock mode
if (quantumClient.isMockMode()) {
  console.log('Using classical entropy fallback');
}
```

### Health Monitoring

Monitor service health and reconnect automatically:

```javascript
// Check health
const healthy = await quantumClient.healthCheck();

// Get detailed status
const status = quantumClient.getStatus();
console.log('Status:', status);
// {
//   healthy: true,
//   mockMode: false,
//   poolLevel: 8,
//   poolCapacity: 10,
//   isRefilling: false,
//   lastHealthCheck: 1699564800123
// }

// Reconnect if needed
if (!healthy) {
  const reconnected = await quantumClient.reconnect();
  console.log('Reconnected:', reconnected);
}
```

## Testing

Run the example:

```bash
npm run dev

# In browser console:
import example from './src/quantum/example.js';
await example();
```

Or test the service directly:

```bash
# Health check
curl http://localhost:5000/api/quantum/health

# Get entropy
curl http://localhost:5000/api/quantum/entropy?bits=256

# Get info
curl http://localhost:5000/api/quantum/info
```

## Performance

- **With pool:** <10ms (instant from cache)
- **Without pool:** 50-100ms (simulator) or 2-5s (real hardware)
- **Fallback:** <1ms (WebCrypto)

The entropy pool ensures mutations can proceed without waiting for quantum API calls.

## Error Handling

The client handles all errors gracefully:

```javascript
try {
  const entropy = await quantumClient.getEntropy(256);
  // Use entropy
} catch (error) {
  // This should never throw - client falls back automatically
  console.error('Unexpected error:', error);
}
```

## Best Practices

1. **Use the pool:** Let the client prefill and manage the entropy pool
2. **Check health periodically:** Monitor service availability
3. **Enable mock mode for development:** Faster iteration without quantum service
4. **Use real hardware for production:** Get true quantum randomness

## Troubleshooting

### Client always in mock mode

- Check if quantum service is running: `curl http://localhost:5000/api/quantum/health`
- Verify API URL in config
- Check Docker Compose logs: `docker-compose logs quantum`

### Pool not refilling

- Service may be rate limited (10 requests/minute)
- Check service health: `await quantumClient.healthCheck()`
- Try reconnecting: `await quantumClient.reconnect()`

### Slow entropy generation

- Pool should provide instant access (<10ms)
- If slow, pool may be empty - check `getPoolLevel()`
- Consider increasing pool size in client constructor

## Next Steps

- Integrate with blockchain mutations (Task 8.2)
- Use in organism evolution (Task 8.4)
- Add to visualization (Task 10.2)

## Related Files

- `services/quantum/app.py` - Flask API server
- `services/quantum/quantum_entropy.py` - Quantum circuit implementation
- `src/quantum/client.js` - JavaScript client
- `src/quantum/example.js` - Usage example
- `src/config/index.js` - Configuration
