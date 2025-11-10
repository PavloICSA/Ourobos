# Quantum Entropy Service

Python Flask service that generates true random numbers using Qiskit quantum circuits.

## Overview

This service provides quantum-generated entropy for organism mutations using:
- IBM Quantum hardware (when available via API token)
- Qiskit quantum simulator (automatic fallback)
- Hadamard gates for superposition
- Measurement-based randomness extraction

## Architecture

```
┌─────────────────────────────────────┐
│     Flask API Server (app.py)       │
│  - /api/quantum/entropy             │
│  - /api/quantum/health              │
│  - /api/quantum/info                │
│  - CORS enabled                     │
│  - Rate limiting (10/min)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  QuantumEntropySource               │
│  (quantum_entropy.py)               │
│  - Circuit generation               │
│  - Hadamard gates                   │
│  - Measurement & bit extraction     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Qiskit Backend              │
│  - IBM Quantum (real hardware)      │
│  - qasm_simulator (fallback)        │
└─────────────────────────────────────┘
```

## API Endpoints

### GET /api/quantum/entropy

Generate quantum entropy using quantum circuits.

**Query Parameters:**
- `bits` (optional): Number of random bits to generate (default: 256, max: 4096)

**Response:**
```json
{
  "entropy": "a3f5b2c1d4e6f7a8...",
  "bits": 256,
  "backend": "qasm_simulator",
  "backend_type": "simulator",
  "real_hardware": false,
  "timestamp": 1699564800.123,
  "generation_time": 0.045
}
```

**Error Responses:**
- `400`: Invalid bits parameter
- `429`: Rate limit exceeded
- `500`: Internal server error

### GET /api/quantum/health

Health check endpoint to verify service availability.

**Response:**
```json
{
  "status": "ok",
  "service": "quantum-entropy",
  "backend": "qasm_simulator",
  "backend_type": "simulator",
  "real_hardware": false,
  "timestamp": 1699564800.123
}
```

### GET /api/quantum/info

Get detailed service information and capabilities.

**Response:**
```json
{
  "service": "OuroborOS Quantum Entropy Service",
  "version": "1.0.0",
  "backend": {
    "name": "qasm_simulator",
    "type": "simulator",
    "real_hardware": false
  },
  "capabilities": {
    "max_bits": 4096,
    "min_bits": 1,
    "rate_limit": "10 requests per minute"
  },
  "endpoints": {
    "/api/quantum/entropy": "Generate quantum entropy",
    "/api/quantum/health": "Health check",
    "/api/quantum/info": "Service information"
  }
}
```

## Setup

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- (Optional) IBM Quantum account for real hardware access

### Local Development

#### Linux/Mac

```bash
cd services/quantum

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

Or use the start script:

```bash
chmod +x start.sh
./start.sh
```

#### Windows

```cmd
cd services\quantum

REM Create virtual environment
python -m venv venv
venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

REM Run the service
python app.py
```

Or use the start script:

```cmd
start.cmd
```

The service will start on `http://localhost:5000`

### Docker

Build and run using Docker:

```bash
# Build image
docker build -t ouroboros-quantum services/quantum

# Run container
docker run -p 5000:5000 \
  -e QISKIT_API_TOKEN=your_token_here \
  ouroboros-quantum
```

### Docker Compose

Run as part of the full OuroborOS-Chimera stack:

```bash
# Start all services
docker-compose up

# Start only quantum service
docker-compose up quantum

# Run in background
docker-compose up -d quantum
```

## Configuration

Configure the service using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `QISKIT_API_TOKEN` | IBM Quantum API token (optional) | None |
| `FLASK_ENV` | Flask environment (development/production) | production |
| `FLASK_HOST` | Host to bind to | 0.0.0.0 |
| `FLASK_PORT` | Port to listen on | 5000 |

### Getting IBM Quantum API Token

1. Create account at https://quantum-computing.ibm.com/
2. Go to Account Settings
3. Copy your API token
4. Set as environment variable:

```bash
export QISKIT_API_TOKEN="your_token_here"
```

**Note:** Without an API token, the service will use the quantum simulator, which still provides cryptographically secure randomness but not from real quantum hardware.

## Rate Limiting

The service implements rate limiting to prevent abuse:

- **Limit:** 10 requests per minute per IP address
- **Storage:** In-memory (resets on restart)
- **Response:** HTTP 429 when exceeded

## Testing

Test the quantum entropy source directly:

```bash
cd services/quantum
python quantum_entropy.py
```

Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/api/quantum/health

# Get entropy
curl http://localhost:5000/api/quantum/entropy?bits=256

# Get service info
curl http://localhost:5000/api/quantum/info
```

## How It Works

### Quantum Circuit

The service creates a quantum circuit with 5 qubits:

1. **Initialization:** All qubits start in |0⟩ state
2. **Superposition:** Apply Hadamard gate to each qubit: H|0⟩ = (|0⟩ + |1⟩)/√2
3. **Measurement:** Measure all qubits, collapsing superposition to 0 or 1
4. **Extraction:** Collect measurement results as random bits
5. **Conversion:** Convert bits to bytes and hash with SHA-256

### Entropy Quality

- **Quantum simulator:** Uses quantum algorithms but runs classically
- **Real hardware:** True quantum randomness from quantum superposition
- **Fallback:** WebCrypto API provides cryptographically secure randomness

## Troubleshooting

### Service won't start

- Check Python version: `python --version` (need 3.9+)
- Verify dependencies: `pip list | grep qiskit`
- Check port availability: `lsof -i :5000` (Linux/Mac)

### Rate limit errors

- Wait 60 seconds between request bursts
- Use entropy pool in JavaScript client for better performance

### Quantum hardware connection fails

- Verify API token is correct
- Check IBM Quantum service status
- Service will automatically fall back to simulator

## Requirements

See `requirements.txt` for full dependency list:

- qiskit >= 0.45.0
- qiskit-ibmq-provider >= 0.20.0
- flask >= 3.0.0
- flask-cors >= 4.0.0
- flask-limiter >= 3.5.0

## Security

- CORS enabled for browser access
- Rate limiting prevents abuse
- No authentication required (add if deploying publicly)
- Input validation on all parameters
- Error messages don't leak sensitive information

## Performance

- **Simulator:** ~50-100ms per request
- **Real hardware:** 2-5 seconds per request (queue time)
- **Recommended:** Use JavaScript client with entropy pool for <10ms access

## License

Part of OuroborOS-Chimera project.
