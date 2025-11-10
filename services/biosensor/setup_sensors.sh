#!/bin/bash
# OuroborOS-Chimera Bio Sensor Setup Script
# Configures Raspberry Pi with sensors and Flask API service

set -e  # Exit on error

echo "=========================================="
echo "OuroborOS-Chimera Bio Sensor Setup"
echo "=========================================="
echo ""

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "Warning: This script is designed for Raspberry Pi"
    echo "Continuing anyway, but hardware sensors may not work..."
    echo ""
fi

# Update system
echo "Step 1: Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y
echo "✓ System updated"
echo ""

# Install Python and pip
echo "Step 2: Installing Python dependencies..."
sudo apt-get install -y python3 python3-pip python3-dev
echo "✓ Python installed"
echo ""

# Install Flask and sensor libraries
echo "Step 3: Installing Python packages..."
sudo pip3 install --upgrade pip
sudo pip3 install flask flask-cors
sudo pip3 install adafruit-circuitpython-tsl2561
sudo pip3 install adafruit-circuitpython-dht
sudo pip3 install adafruit-circuitpython-mpu6050
sudo pip3 install adafruit-blinka
echo "✓ Python packages installed"
echo ""

# Enable I2C interface
echo "Step 4: Enabling I2C interface..."
sudo raspi-config nonint do_i2c 0
echo "✓ I2C enabled"
echo ""

# Create application directory
echo "Step 5: Setting up application directory..."
APP_DIR="/home/pi/ouroboros-biosensor"
sudo mkdir -p "$APP_DIR"
sudo chown pi:pi "$APP_DIR"

# Copy application files (if they exist in current directory)
if [ -f "bio_sensor_node.py" ]; then
    cp bio_sensor_node.py "$APP_DIR/"
    echo "✓ Copied bio_sensor_node.py"
fi

if [ -f "app.py" ]; then
    cp app.py "$APP_DIR/"
    echo "✓ Copied app.py"
fi

if [ ! -f "$APP_DIR/app.py" ]; then
    echo "Warning: app.py not found in $APP_DIR"
    echo "Please copy bio_sensor_node.py and app.py to $APP_DIR"
fi
echo ""

# Create systemd service
echo "Step 6: Creating systemd service..."
sudo tee /etc/systemd/system/biosensor.service > /dev/null << EOF
[Unit]
Description=OuroborOS-Chimera Bio Sensor API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/python3 $APP_DIR/app.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Optional: Set API key for authentication
# Environment="BIOSENSOR_API_KEY=your-secret-key-here"

[Install]
WantedBy=multi-user.target
EOF
echo "✓ Systemd service created"
echo ""

# Reload systemd
echo "Step 7: Reloading systemd..."
sudo systemctl daemon-reload
echo "✓ Systemd reloaded"
echo ""

# Enable service (start on boot)
echo "Step 8: Enabling service..."
sudo systemctl enable biosensor.service
echo "✓ Service enabled (will start on boot)"
echo ""

# Get IP address
IP_ADDR=$(hostname -I | awk '{print $1}')

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Bio Sensor API Configuration:"
echo "  Service: biosensor.service"
echo "  Directory: $APP_DIR"
echo "  Port: 5001"
echo ""
echo "Network Access:"
echo "  Local: http://localhost:5001"
echo "  Network: http://$IP_ADDR:5001"
echo "  Hostname: http://$(hostname).local:5001"
echo ""
echo "Service Commands:"
echo "  Start:   sudo systemctl start biosensor"
echo "  Stop:    sudo systemctl stop biosensor"
echo "  Restart: sudo systemctl restart biosensor"
echo "  Status:  sudo systemctl status biosensor"
echo "  Logs:    sudo journalctl -u biosensor -f"
echo ""
echo "Test Endpoints:"
echo "  Health:   curl http://localhost:5001/api/sensors/health"
echo "  Readings: curl http://localhost:5001/api/sensors/readings"
echo "  Info:     curl http://localhost:5001/api/sensors/info"
echo ""
echo "Next Steps:"
echo "  1. Reboot to ensure I2C is enabled: sudo reboot"
echo "  2. After reboot, start service: sudo systemctl start biosensor"
echo "  3. Check status: sudo systemctl status biosensor"
echo "  4. Test API: curl http://localhost:5001/api/sensors/health"
echo ""
echo "Hardware Setup:"
echo "  - Connect TSL2561 light sensor to I2C (SDA/SCL)"
echo "  - Connect DHT22 temp sensor to GPIO4 (pin 7)"
echo "  - Connect MPU6050 accelerometer to I2C (SDA/SCL)"
echo "  - Ensure proper power (3.3V) and ground connections"
echo ""
echo "Optional: Set API key for authentication"
echo "  Edit: sudo nano /etc/systemd/system/biosensor.service"
echo "  Uncomment and set: Environment=\"BIOSENSOR_API_KEY=your-key\""
echo "  Then: sudo systemctl daemon-reload && sudo systemctl restart biosensor"
echo ""
echo "=========================================="
