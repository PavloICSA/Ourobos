# Bio Sensor Client

JavaScript client for accessing Raspberry Pi sensor data to influence organism evolution.

## Overview

The Bio Sensor system connects OuroborOS-Chimera to the physical world through environmental sensors. Light, temperature, and motion data from a Raspberry Pi influence mutation parameters, creating a truly embodied digital organism.

Interfaces with Raspberry Pi sensor nodes to collect:
- **Light levels** (TSL2561): 0-1000 lux normalized to 0-1
- **Temperature** (DHT22): 0-40°C normalized to 0-1
- **Acceleration** (MPU6050): 0-20 m/s² normalized to 0-1

## Quick Start

```javascript
import { BioSensorClient } from './biosensor/client.js';

// Create client (auto-detects real vs mock mode)
const client = new BioSensorClient('http://raspberrypi.local:5001');

// Get sensor readings
const readings = await client.getReadings();
console.log('Light:', readings.light);           // 0-1 normalized
console.log('Temperature:', readings.temperature); // 0-1 normalized
console.log('Acceleration:', readings.acceleration); // 0-1 normalized

// Check health
const isHealthy = await client.healthCheck();
console.log('API healthy:', isHealthy);
```

## Configuration

```javascript
import config from './config/index.js';

const client = new BioSensorClient(
  config.bioSensor.apiUrl,      // 'http://raspberrypi.local:5001'
  config.bioSensor.useMock,     // false (auto-fallback if unavailable)
  config.bioSensor.apiKey       // Optional authentication
);
```

## API Reference

### Methods

**`async getReadings()`**
Get current sensor readings. Automatically falls back to mock mode if API unavailable.

Returns:
```javascript
{
  light: 0.5,           // 0-1 normalized
  temperature: 0.6,     // 0-1 normalized
  acceleration: 0.3,    // 0-1 normalized
  timestamp: 1234567890.123
}
```

**`getMockReadings()`**
Generate mock sensor readings with smooth simulated curves.

**`async healthCheck()`**
Check if sensor API is healthy. Returns `true` if available.

**`async getHealthStatus()`**
Get detailed health status including individual sensor availability.

**`getLastReadings()`**
Get last cached readings without making new API call.

**`isMockMode()`**
Check if client is currently in mock mode.

**`enableMockMode()` / `enableRealMode()`**
Manually switch between real and mock modes.

## Features

- **Real Hardware Support**: TSL2561 light, DHT22 temperature, MPU6050 accelerometer
- **Automatic Fallback**: Seamlessly switches to mock mode if hardware unavailable
- **Mock Mode**: Smooth simulated curves for testing without hardware
- **Health Monitoring**: Check sensor availability and API status
- **CORS Enabled**: Direct browser access from any origin
- **Optional Authentication**: API key support for secure deployments
- **Normalized Values**: All readings scaled to 0-1 range for consistency

## Mock Mode

When hardware is unavailable, the client automatically generates realistic mock data:

- **Light**: Slow sine wave (10s period) simulating day/night
- **Temperature**: Slow cosine wave (15s period) with offset
- **Acceleration**: Fast sine wave (5s period) simulating movement

This allows full development and testing without Raspberry Pi hardware.

## Integration with Mutations

Sensor data influences organism evolution:

```javascript
// Get environmental data
const readings = await bioSensorClient.getReadings();

// Adjust mutation parameters based on environment
const mutationRate = baseMutationRate * 
  (1 + readings.light * 0.2) *        // Light increases mutation
  (1 + readings.temperature * 0.1) *  // Temperature affects stability
  (1 + readings.acceleration * 0.3);  // Motion triggers changes
```

## Raspberry Pi Setup

See `services/biosensor/README.md` for detailed hardware setup instructions.

Quick setup:
```bash
cd services/biosensor
chmod +x setup_sensors.sh
sudo ./setup_sensors.sh
sudo reboot
```

## Examples

See `example.js` for complete usage examples:
- Basic sensor reading
- Health checks
- Continuous monitoring
- Authenticated access
- Mock mode testing
- Mutation integration

Run examples:
```bash
node src/biosensor/example.js
```

## Troubleshooting

**Client always in mock mode:**
- Check Raspberry Pi is powered on and connected to network
- Verify API URL is correct
- Ensure biosensor service is running: `sudo systemctl status biosensor`

**Sensor readings are null:**
- Check sensor hardware connections (I2C, GPIO)
- Verify I2C is enabled: `sudo raspi-config`
- View service logs: `sudo journalctl -u biosensor -f`

## Related Documentation

- **Hardware Setup**: `services/biosensor/README.md`
- **API Documentation**: `services/biosensor/app.py`
- **Requirements**: Requirements 4.1-4.5 in design document
