"""
OuroborOS-Chimera Bio Sensor Node
Raspberry Pi sensor interface for physical world feedback
"""

import time
import json
import sys

# Sensor availability flags
LIGHT_AVAILABLE = False
TEMP_AVAILABLE = False
ACCEL_AVAILABLE = False

# Try to import sensor libraries
try:
    import board
    import busio
    I2C_AVAILABLE = True
except ImportError:
    I2C_AVAILABLE = False
    print("Warning: board/busio not available (not on Raspberry Pi?)")

if I2C_AVAILABLE:
    try:
        import adafruit_tsl2561
        LIGHT_AVAILABLE = True
    except ImportError:
        print("Warning: adafruit_tsl2561 not available")
    
    try:
        import adafruit_dht
        TEMP_AVAILABLE = True
    except ImportError:
        print("Warning: adafruit_dht not available")
    
    try:
        import adafruit_mpu6050
        ACCEL_AVAILABLE = True
    except ImportError:
        print("Warning: adafruit_mpu6050 not available")


class BioSensorNode:
    """
    Raspberry Pi sensor interface for collecting environmental data.
    Supports TSL2561 light sensor, DHT22 temperature sensor, and MPU6050 accelerometer.
    """
    
    def __init__(self):
        """Initialize I2C bus and all available sensors"""
        self.light_sensor = None
        self.temp_sensor = None
        self.accel_sensor = None
        
        if not I2C_AVAILABLE:
            print("I2C not available - running in mock mode")
            return
        
        try:
            # Initialize I2C bus
            self.i2c = busio.I2C(board.SCL, board.SDA)
            print("I2C bus initialized")
        except Exception as e:
            print(f"Failed to initialize I2C: {e}")
            return
        
        # Initialize light sensor (TSL2561)
        if LIGHT_AVAILABLE:
            try:
                self.light_sensor = adafruit_tsl2561.TSL2561(self.i2c)
                print("Light sensor (TSL2561) initialized")
            except Exception as e:
                print(f"Failed to initialize light sensor: {e}")
        
        # Initialize temperature sensor (DHT22)
        if TEMP_AVAILABLE:
            try:
                self.temp_sensor = adafruit_dht.DHT22(board.D4)
                print("Temperature sensor (DHT22) initialized")
            except Exception as e:
                print(f"Failed to initialize temperature sensor: {e}")
        
        # Initialize accelerometer (MPU6050)
        if ACCEL_AVAILABLE:
            try:
                self.accel_sensor = adafruit_mpu6050.MPU6050(self.i2c)
                print("Accelerometer (MPU6050) initialized")
            except Exception as e:
                print(f"Failed to initialize accelerometer: {e}")
    
    def read_light(self):
        """
        Read light level in lux, normalized to 0-1 range.
        Returns None if sensor unavailable or read fails.
        """
        if not self.light_sensor:
            return None
        
        try:
            lux = self.light_sensor.lux
            if lux is None:
                return None
            
            # Normalize: 0 lux = 0, 1000 lux = 1
            # Cap at 1.0 for very bright conditions
            normalized = min(lux / 1000.0, 1.0)
            return max(0.0, normalized)
        except Exception as e:
            print(f"Error reading light sensor: {e}")
            return None
    
    def read_temperature(self):
        """
        Read temperature in Celsius, normalized to 0-1 range.
        Returns None if sensor unavailable or read fails.
        """
        if not self.temp_sensor:
            return None
        
        try:
            temp = self.temp_sensor.temperature
            if temp is None:
                return None
            
            # Normalize: 0°C = 0, 40°C = 1
            # This range covers typical indoor/outdoor temperatures
            normalized = temp / 40.0
            return max(0.0, min(normalized, 1.0))
        except Exception as e:
            print(f"Error reading temperature sensor: {e}")
            return None
    
    def read_acceleration(self):
        """
        Read acceleration magnitude, normalized to 0-1 range.
        Returns None if sensor unavailable or read fails.
        """
        if not self.accel_sensor:
            return None
        
        try:
            accel = self.accel_sensor.acceleration
            if accel is None:
                return None
            
            # Calculate magnitude: sqrt(x^2 + y^2 + z^2)
            magnitude = (accel[0]**2 + accel[1]**2 + accel[2]**2)**0.5
            
            # Normalize: 0 m/s² = 0, 20 m/s² = 1
            # 20 m/s² is about 2g, covers most motion scenarios
            normalized = magnitude / 20.0
            return max(0.0, min(normalized, 1.0))
        except Exception as e:
            print(f"Error reading accelerometer: {e}")
            return None
    
    def read_all(self):
        """
        Read all sensors and return normalized values with timestamp.
        Returns dict with sensor readings (None for unavailable sensors).
        """
        return {
            'light': self.read_light(),
            'temperature': self.read_temperature(),
            'acceleration': self.read_acceleration(),
            'timestamp': time.time()
        }
    
    def get_health_status(self):
        """
        Return sensor availability status.
        Returns dict indicating which sensors are available.
        """
        return {
            'light': self.light_sensor is not None,
            'temperature': self.temp_sensor is not None,
            'acceleration': self.accel_sensor is not None,
            'i2c': I2C_AVAILABLE
        }


# Test function for standalone execution
def test_sensors():
    """Test sensor readings"""
    print("Initializing Bio Sensor Node...")
    node = BioSensorNode()
    
    print("\nSensor Health Status:")
    status = node.get_health_status()
    for sensor, available in status.items():
        print(f"  {sensor}: {'✓' if available else '✗'}")
    
    print("\nReading sensors (5 samples)...")
    for i in range(5):
        readings = node.read_all()
        print(f"\nSample {i+1}:")
        print(f"  Light: {readings['light']}")
        print(f"  Temperature: {readings['temperature']}")
        print(f"  Acceleration: {readings['acceleration']}")
        print(f"  Timestamp: {readings['timestamp']}")
        time.sleep(1)


if __name__ == '__main__':
    test_sensors()
