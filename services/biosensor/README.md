# Bio Sensor Network Service

Python Flask API service for Raspberry Pi sensor integration with OuroborOS-Chimera.

## Overview

This service runs on a Raspberry Pi and provides a REST API for accessing environmental sensor data. It collects readings from light, temperature, and accelerometer sensors, normalizes them to 0-1 range, and exposes them via HTTP for the browser-based organism to consume.

All readings are normalized to 0-1 range for consistent organism input:
- **Light sensor** (TSL2561): 0-1000 lux → 0-1
- **Temperature sensor** (DHT22): 0-40°C → 0-1
- **Accelerometer** (MPU6050): 0-20 m/s² → 0-1

## Hardware Requirements

### Required Components

- **Raspberry Pi 4** (or 3B+, Zero W)
- **TSL2561 Light Sensor** (I2C interface)
- **DHT22 Temperature/Humidity Sensor** (GPIO interface)
- **MPU6050 Accelerometer/Gyroscope** (I2C interface)
- **Breadboard and jumper wires**
- **Power supply** (5V 2.5A minimum)

### Wiring Diagram

```
Raspberry Pi GPIO Pinout:

TSL2561 (Light Sensor):
  VCC  -> Pin 1  (3.3V)
  GND  -> Pin 6  (Ground)
  SDA  -> Pin 3  (GPIO 2 / SDA)
  SCL  -> Pin 5  (GPIO 3 / SCL)

DHT22 (Temperature Sensor):
  VCC  -> Pin 1  (3.3V)
  GND  -> Pin 6  (Ground)
  DATA -> Pin 7  (GPIO 4)

MPU6050 (Accelerometer):
  VCC  -> Pin 1  (3.3V)
  GND  -> Pin 6  (Ground)
  SDA  -> Pin 3  (GPIO 2 / SDA)
  SCL  -> Pin 5  (GPIO 3 / SCL)

Note: Multiple I2C devices share the same SDA/SCL pins
```

## Quick Setup

### Automated Setup (Recommended)

```bash
# Copy files to Raspberry Pi
scp -r services/biosensor pi@raspberrypi.local:~/

# SSH into Raspberry Pi
ssh pi@raspberrypi.local

# Run setup script
cd ~/biosensor
chmod +x setup_sensors.sh
sudo ./setup_sensors.sh

# Reboot to enable I2C
sudo reboot

# After reboot, check service status
sudo systemctl status biosensor
```

### Manual Setup

```bash
# 1. Update system
sudo apt-get update
sudo apt-get upgrade -y

# 2. Install Python dependencies
sudo apt-get install -y python3 python3-pip python3-dev
sudo pip3 install -r requirements.txt

# 3. Enable I2C interface
sudo raspi-config
# Navigate to: Interface Options -> I2C -> Enable

# 4. Test sensors
python3 bio_sensor_node.py

# 5. Run API service
python3 app.py
```

## API Endpoints

### GET /api/sensors/readings

Get current sensor readings (normalized to 0-1 range).

**Response:**
```json
{
  "light": 0.5,
  "temperature": 0.6,
  "acceleration": 0.3,
  "timestamp": 1234567890.123
}
```

**Notes:**
- Values may be `null` if sensor is unavailable
- All values normalized to 0-1 range
- Timestamp is Unix time in seconds

### GET /api/sensors/health

Check sensor availability and API health.

**Response:**
```json
{
  "status": "ok",
  "sensors": {
    "light": true,
    "temperature": false,
    "acceleration": true,
    "i2c": true
  },
  "timestamp": 1234567890.123
}
```

### GET /api/sensors/info

Get API information and sensor specifications.

**Response:**
```json
{
  "name": "OuroborOS-Chimera Bio Sensor API",
  "version": "1.0.0",
  "sensors": {
    "light": "TSL2561 (0-1000 lux normalized to 0-1)",
    "temperature": "DHT22 (0-40°C normalized to 0-1)",
    "acceleration": "MPU6050 (0-20 m/s² normalized to 0-1)"
  },
  "authentication": "optional"
}
```

## Configuration

### Environment Variables

**BIOSENSOR_API_KEY** (optional)
Set an API key to require authentication:

```bash
# Set in environment
export BIOSENSOR_API_KEY="your-secret-key-here"

# Or edit systemd service
sudo nano /etc/systemd/system/biosensor.service
# Add: Environment="BIOSENSOR_API_KEY=your-key"
sudo systemctl daemon-reload
sudo systemctl restart biosensor
```

When set, clients must include the key in request headers:
```
X-API-Key: your-secret-key-here
```

### Port Configuration

Default port is 5001. To change, edit `app.py`:

```python
app.run(host='0.0.0.0', port=5001)  # Change port here
```

## Service Management

The setup script creates a systemd service for automatic startup.

### Service Commands

```bash
# Start service
sudo systemctl start biosensor

# Stop service
sudo systemctl stop biosensor

# Restart service
sudo systemctl restart biosensor

# Check status
sudo systemctl status biosensor

# View logs
sudo journalctl -u biosensor -f

# Enable auto-start on boot
sudo systemctl enable biosensor

# Disable auto-start
sudo systemctl disable biosensor
```

## Testing

### Test Sensor Hardware

```bash
# Run sensor test
python3 bio_sensor_node.py

# Should output sensor readings every second
# Check for any error messages
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:5001/api/sensors/health

# Get readings
curl http://localhost:5001/api/sensors/readings

# Get info
curl http://localhost:5001/api/sensors/info

# Test from another machine
curl http://raspberrypi.local:5001/api/sensors/health
```

### Test with Authentication

```bash
# Set API key
export BIOSENSOR_API_KEY="test-key"
python3 app.py

# Test without key (should fail)
curl http://localhost:5001/api/sensors/readings

# Test with key (should succeed)
curl -H "X-API-Key: test-key" http://localhost:5001/api/sensors/readings
```

## Troubleshooting

### I2C Devices Not Detected

```bash
# Check if I2C is enabled
sudo raspi-config
# Interface Options -> I2C -> Ensure enabled

# List I2C devices
sudo i2cdetect -y 1

# Should show addresses:
# 0x29 or 0x39 - TSL2561 light sensor
# 0x68 - MPU6050 accelerometer
```

### Sensor Import Errors

```bash
# Reinstall sensor libraries
sudo pip3 install --upgrade adafruit-blinka
sudo pip3 install --upgrade adafruit-circuitpython-tsl2561
sudo pip3 install --upgrade adafruit-circuitpython-dht
sudo pip3 install --upgrade adafruit-circuitpython-mpu6050
```

### DHT22 Read Errors

DHT22 sensors can be temperamental:
- Ensure proper wiring (VCC, GND, DATA)
- Add 10kΩ pull-up resistor between DATA and VCC
- Try different GPIO pin if issues persist
- Sensor requires 2 second delay between reads

### Service Won't Start

```bash
# Check service logs
sudo journalctl -u biosensor -n 50

# Check Python errors
python3 /home/pi/ouroboros-biosensor/app.py

# Verify file permissions
ls -la /home/pi/ouroboros-biosensor/
```

### Network Access Issues

```bash
# Check firewall (if enabled)
sudo ufw allow 5001

# Find Raspberry Pi IP address
hostname -I

# Test from Pi itself
curl http://localhost:5001/api/sensors/health

# Test from another machine
curl http://[PI_IP_ADDRESS]:5001/api/sensors/health
```

## Development

### Running Without Hardware

The service gracefully handles missing sensors and will return `null` for unavailable readings. This allows development and testing without physical hardware.

```bash
# Run on any machine (not just Raspberry Pi)
python3 app.py

# Sensors will show as unavailable but API will work
curl http://localhost:5001/api/sensors/health
```

### Docker Development

```bash
# Build container
docker build -t biosensor-api .

# Run container
docker run -p 5001:5001 biosensor-api

# Note: Hardware sensors won't work in Docker
# Use for API development only
```

## Files

- **bio_sensor_node.py** - Sensor interface class
- **app.py** - Flask API server
- **requirements.txt** - Python dependencies
- **setup_sensors.sh** - Automated setup script
- **Dockerfile** - Docker container (for development)

## Sensor Specifications

### TSL2561 Light Sensor
- **Interface**: I2C (address 0x29 or 0x39)
- **Range**: 0.1 - 40,000 lux
- **Normalized**: 0-1000 lux → 0-1
- **Update Rate**: ~100ms

### DHT22 Temperature/Humidity Sensor
- **Interface**: GPIO (single-wire)
- **Temperature Range**: -40 to 80°C
- **Normalized**: 0-40°C → 0-1
- **Update Rate**: 2 seconds minimum
- **Accuracy**: ±0.5°C

### MPU6050 Accelerometer/Gyroscope
- **Interface**: I2C (address 0x68)
- **Acceleration Range**: ±2g to ±16g
- **Normalized**: 0-20 m/s² → 0-1
- **Update Rate**: ~100ms
- **Accuracy**: High precision MEMS

## Related Documentation

- **JavaScript Client**: `src/biosensor/README.md`
- **Client Examples**: `src/biosensor/example.js`
- **Requirements**: Requirements 4.1-4.5 in design document
