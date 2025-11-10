# Bio Sensor Integration Guide

This guide explains how to integrate the bio sensor client into the OuroborOS-Chimera orchestrator.

## Overview

The bio sensor system provides environmental feedback to influence organism mutations. Sensor readings (light, temperature, acceleration) are normalized to 0-1 range and used to adjust mutation parameters.

## Integration Steps

### 1. Import the Client

```javascript
import { BioSensorClient } from './biosensor/client.js';
import config from './config/index.js';
```

### 2. Initialize in Orchestrator

```javascript
class ChimeraOrchestrator {
  constructor() {
    // Initialize bio sensor client
    this.bioSensorClient = new BioSensorClient(
      config.bioSensor.apiUrl,
      config.bioSensor.useMock,
      config.bioSensor.apiKey
    );
  }
  
  async init() {
    // Check sensor health on startup
    const isHealthy = await this.bioSensorClient.healthCheck();
    console.log(`Bio sensors: ${isHealthy ? 'CONNECTED' : 'MOCK MODE'}`);
  }
}
```

### 3. Use in Mutation Flow

```javascript
async executeMutation(proposalId) {
  // ... blockchain execution ...
  
  // Get environmental data
  const sensorReadings = await this.bioSensorClient.getReadings();
  
  // Use sensor data to influence mutation
  const mutationParams = {
    entropy: quantumEntropy,
    environmentalInfluence: {
      light: sensorReadings.light ?? 0.5,
      temperature: sensorReadings.temperature ?? 0.5,
      motion: sensorReadings.acceleration ?? 0.5
    }
  };
  
  // Adjust mutation rate based on environment
  const adjustedRate = this.calculateAdjustedRate(mutationParams);
  
  // Execute mutation with environmental influence
  await this.executeInRuntime(ourocodeModule, mutationParams);
}
```

### 4. Calculate Environmental Influence

```javascript
calculateAdjustedRate(params) {
  const baseRate = 0.05;
  const env = params.environmentalInfluence;
  
  // Light increases mutation rate (more energy)
  const lightFactor = 1 + (env.light * 0.2);
  
  // Temperature affects stability (optimal around 0.5)
  const tempFactor = 1 + (Math.abs(env.temperature - 0.5) * 0.1);
  
  // Motion triggers changes (more activity)
  const motionFactor = 1 + (env.motion * 0.3);
  
  return baseRate * lightFactor * tempFactor * motionFactor;
}
```

### 5. Add to Visualization

```javascript
updateVisualization() {
  const readings = this.bioSensorClient.getLastReadings();
  
  if (readings) {
    // Display sensor values in UI
    this.terminal.writeLine(`Light: ${readings.light?.toFixed(3) ?? 'N/A'}`);
    this.terminal.writeLine(`Temp:  ${readings.temperature?.toFixed(3) ?? 'N/A'}`);
    this.terminal.writeLine(`Accel: ${readings.acceleration?.toFixed(3) ?? 'N/A'}`);
    
    // Use sensor data to influence fractal colors
    this.visualizer.setColorInfluence({
      hue: readings.light * 360,
      saturation: readings.temperature * 100,
      brightness: readings.acceleration * 100
    });
  }
}
```

### 6. Continuous Monitoring

```javascript
startSensorMonitoring() {
  // Poll sensors at configured interval
  this.sensorInterval = setInterval(async () => {
    const readings = await this.bioSensorClient.getReadings();
    
    // Update organism state with environmental data
    this.updateEnvironmentalState(readings);
    
    // Trigger visualization update
    this.updateVisualization();
  }, config.bioSensor.pollInterval);
}

stopSensorMonitoring() {
  if (this.sensorInterval) {
    clearInterval(this.sensorInterval);
    this.sensorInterval = null;
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file:

```bash
# Bio Sensor Configuration
VITE_BIOSENSOR_API=http://raspberrypi.local:5001
VITE_BIOSENSOR_MOCK=false
VITE_ENABLE_BIOSENSOR=true
VITE_BIOSENSOR_API_KEY=your-secret-key
```

### Config Object

The config is automatically loaded from environment variables:

```javascript
import config from './config/index.js';

console.log(config.bioSensor);
// {
//   apiUrl: 'http://raspberrypi.local:5001',
//   useMock: false,
//   enabled: true,
//   pollInterval: 1000
// }
```

## Error Handling

### Automatic Fallback

The client automatically falls back to mock mode if the API is unavailable:

```javascript
const readings = await client.getReadings();
// Returns mock data if API fails, no error thrown

if (client.isMockMode()) {
  console.warn('Using mock sensor data');
}
```

### Manual Error Handling

```javascript
try {
  const readings = await client.getReadings();
  // Use readings...
} catch (error) {
  console.error('Sensor error:', error);
  // Fallback logic...
}
```

### Health Monitoring

```javascript
async checkSensorHealth() {
  const isHealthy = await this.bioSensorClient.healthCheck();
  
  if (!isHealthy) {
    console.warn('Bio sensors unavailable, using mock mode');
    this.bioSensorClient.enableMockMode();
  }
}

// Check health periodically
setInterval(() => this.checkSensorHealth(), 30000);
```

## Testing

### Test with Mock Mode

```javascript
// Force mock mode for testing
const client = new BioSensorClient('http://raspberrypi.local:5001', true);

const readings = await client.getReadings();
console.log('Mock readings:', readings);
// Always returns simulated data
```

### Test with Real Hardware

```bash
# 1. Start Raspberry Pi service
ssh pi@raspberrypi.local
sudo systemctl start biosensor

# 2. Test from browser
const client = new BioSensorClient('http://raspberrypi.local:5001');
const readings = await client.getReadings();
console.log('Real readings:', readings);
```

## Example: Complete Integration

```javascript
import { BioSensorClient } from './biosensor/client.js';
import config from './config/index.js';

class ChimeraOrchestrator {
  constructor() {
    this.bioSensorClient = new BioSensorClient(
      config.bioSensor.apiUrl,
      config.bioSensor.useMock
    );
    this.sensorInterval = null;
  }
  
  async init() {
    // Check sensor health
    const isHealthy = await this.bioSensorClient.healthCheck();
    console.log(`Bio sensors: ${isHealthy ? 'CONNECTED' : 'MOCK MODE'}`);
    
    // Start monitoring
    if (config.bioSensor.enabled) {
      this.startSensorMonitoring();
    }
  }
  
  async executeMutation(proposalId) {
    // Get sensor readings
    const readings = await this.bioSensorClient.getReadings();
    
    // Calculate environmental influence
    const mutationRate = this.calculateAdjustedRate({
      baseRate: 0.05,
      environmentalInfluence: {
        light: readings.light ?? 0.5,
        temperature: readings.temperature ?? 0.5,
        motion: readings.acceleration ?? 0.5
      }
    });
    
    console.log(`Mutation rate: ${mutationRate.toFixed(4)}`);
    console.log(`  Light influence: ${readings.light?.toFixed(3)}`);
    console.log(`  Temp influence: ${readings.temperature?.toFixed(3)}`);
    console.log(`  Motion influence: ${readings.acceleration?.toFixed(3)}`);
    
    // Execute mutation with environmental parameters
    await this.executeWithEnvironment(mutationRate, readings);
  }
  
  calculateAdjustedRate(params) {
    const { baseRate, environmentalInfluence } = params;
    const env = environmentalInfluence;
    
    return baseRate * 
      (1 + env.light * 0.2) *
      (1 + Math.abs(env.temperature - 0.5) * 0.1) *
      (1 + env.motion * 0.3);
  }
  
  startSensorMonitoring() {
    this.sensorInterval = setInterval(async () => {
      const readings = await this.bioSensorClient.getReadings();
      this.updateVisualization(readings);
    }, config.bioSensor.pollInterval);
  }
  
  updateVisualization(readings) {
    // Update terminal display
    this.terminal.writeLine(`ENV: L=${readings.light?.toFixed(2)} ` +
                           `T=${readings.temperature?.toFixed(2)} ` +
                           `A=${readings.acceleration?.toFixed(2)}`);
    
    // Update fractal colors based on environment
    this.visualizer.setEnvironmentalColors(readings);
  }
  
  cleanup() {
    if (this.sensorInterval) {
      clearInterval(this.sensorInterval);
    }
  }
}

export default ChimeraOrchestrator;
```

## Troubleshooting

### Client Always in Mock Mode

1. Check Raspberry Pi is powered on and connected
2. Verify API URL: `curl http://raspberrypi.local:5001/api/sensors/health`
3. Check service status: `ssh pi@raspberrypi.local sudo systemctl status biosensor`
4. View logs: `ssh pi@raspberrypi.local sudo journalctl -u biosensor -f`

### Sensor Readings are Null

1. Check hardware connections (I2C, GPIO)
2. Verify I2C enabled: `sudo raspi-config`
3. Test sensors: `python3 bio_sensor_node.py`
4. Check sensor libraries: `pip3 list | grep adafruit`

### CORS Errors

The Flask API has CORS enabled by default. If you still see CORS errors:

1. Check browser console for specific error
2. Verify API is accessible: `curl http://raspberrypi.local:5001/api/sensors/health`
3. Check firewall: `sudo ufw status`

## Related Documentation

- **Client API**: `src/biosensor/README.md`
- **Hardware Setup**: `services/biosensor/README.md`
- **Examples**: `src/biosensor/example.js`
- **Requirements**: Requirements 4.1-4.5 in design document
