# Quantum Entropy Client

JavaScript client for the quantum entropy service.

## Overview

Manages quantum entropy generation with:
- Entropy pool for low-latency access
- Automatic fallback to classical entropy
- Health monitoring
- Caching and prefetching

## Usage

```javascript
import { QuantumEntropyClient } from './quantum/client.js';
import config from './config/index.js';

const client = new QuantumEntropyClient(
  config.quantum.apiUrl,
  config.quantum.useMock
);

// Get quantum entropy (from pool if available)
const entropy = await client.getEntropy(256);

// Check service health
const healthy = await client.healthCheck();

// Get pool status
const poolLevel = client.getPoolLevel();
```

## Components

- `client.js` - Main quantum client
- `pool.js` - Entropy pool manager
- `mock.js` - Classical entropy fallback

## Features

- **Entropy Pool**: Pre-fetches quantum entropy for instant access
- **Auto-Refill**: Maintains pool level automatically
- **Graceful Fallback**: Uses WebCrypto when quantum unavailable
- **Health Monitoring**: Tracks service availability

## Requirements

- Quantum service running (or mock mode enabled)
- Fetch API support
