# Bio Sensor Quick Start Guide

Get the bio sensor network running in 5 minutes.

## For Raspberry Pi Users

### 1. Copy Files
```bash
scp -r services/biosensor pi@raspberrypi.local:~/
```

### 2. Run Setup
```bash
ssh pi@raspberrypi.local
cd ~/biosensor
chmod +x setup_sensors.sh
sudo ./setup_sensors.sh
```

### 3. Reboot
```bash
sudo reboot
```

### 4. Verify
```bash
# After reboot
sudo systemctl status biosensor
curl http://localhost:5001/api/sensors/health
```

## For Development (No Hardware)

### 1. Install Dependencies
```bash
cd services/biosensor
pip3 install -r requirements.txt
```

### 2. Run Service
```bash
python3 app.py
```

Service will run in mock mode (sensors unavailable but API works).

### 3. Test
```bash
curl http://localhost:5001/api/sensors/health
curl http://localhost:5001/api/sensors/readings
```

## For JavaScript Client

### 1. Import Client
```javascript
import { BioSensorClient } from './biosensor/client.js';
```

### 2. Create Instance
```javascript
const client = new BioSensorClient('http://raspberrypi.local:5001');
```

### 3. Get Readings
```javascript
const readings = await client.getReadings();
console.log(readings.light, readings.temperature, readings.acceleration);
```

## Hardware Wiring

```
Raspberry Pi GPIO:

TSL2561 (Light):
  VCC  -> Pin 1  (3.3V)
  GND  -> Pin 6  (Ground)
  SDA  -> Pin 3  (GPIO 2)
  SCL  -> Pin 5  (GPIO 3)

DHT22 (Temperature):
  VCC  -> Pin 1  (3.3V)
  GND  -> Pin 6  (Ground)
  DATA -> Pin 7  (GPIO 4)

MPU6050 (Accelerometer):
  VCC  -> Pin 1  (3.3V)
  GND  -> Pin 6  (Ground)
  SDA  -> Pin 3  (GPIO 2)
  SCL  -> Pin 5  (GPIO 3)
```

## Troubleshooting

**Service won't start:**
```bash
sudo journalctl -u biosensor -f
```

**I2C not working:**
```bash
sudo raspi-config  # Enable I2C
sudo i2cdetect -y 1  # List devices
```

**Client always in mock mode:**
```bash
# Check service is running
sudo systemctl status biosensor

# Test from Pi
curl http://localhost:5001/api/sensors/health

# Check firewall
sudo ufw allow 5001
```

## API Endpoints

- `GET /api/sensors/readings` - Current sensor values
- `GET /api/sensors/health` - Sensor status
- `GET /api/sensors/info` - API information

## Configuration

### Environment Variables
```bash
export BIOSENSOR_API_KEY="your-secret-key"  # Optional
```

### JavaScript Config
```javascript
// .env file
VITE_BIOSENSOR_API=http://raspberrypi.local:5001
VITE_BIOSENSOR_MOCK=false
```

## Examples

See `src/biosensor/example.js` for complete examples.

## Full Documentation

- **Hardware Setup**: `services/biosensor/README.md`
- **Client API**: `src/biosensor/README.md`
- **Integration**: `src/biosensor/INTEGRATION.md`
