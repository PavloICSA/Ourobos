"""
Test script for Bio Sensor Service
Tests sensor interface and API endpoints
"""

import sys
import time
import requests

def test_sensor_node():
    """Test BioSensorNode class"""
    print("=" * 60)
    print("Testing BioSensorNode")
    print("=" * 60)
    
    try:
        from bio_sensor_node import BioSensorNode
        
        # Create sensor node
        node = BioSensorNode()
        print("✓ BioSensorNode initialized")
        
        # Check health status
        status = node.get_health_status()
        print("\nSensor Health Status:")
        for sensor, available in status.items():
            print(f"  {sensor}: {'✓ Available' if available else '✗ Unavailable'}")
        
        # Read sensors
        print("\nReading sensors (3 samples)...")
        for i in range(3):
            readings = node.read_all()
            print(f"\nSample {i+1}:")
            print(f"  Light: {readings['light']}")
            print(f"  Temperature: {readings['temperature']}")
            print(f"  Acceleration: {readings['acceleration']}")
            print(f"  Timestamp: {readings['timestamp']}")
            time.sleep(1)
        
        print("\n✓ BioSensorNode tests passed")
        return True
        
    except Exception as e:
        print(f"\n✗ BioSensorNode tests failed: {e}")
        return False


def test_api_endpoints(base_url='http://localhost:5001'):
    """Test Flask API endpoints"""
    print("\n" + "=" * 60)
    print("Testing API Endpoints")
    print("=" * 60)
    
    success = True
    
    # Test health endpoint
    try:
        print(f"\nTesting GET {base_url}/api/sensors/health")
        response = requests.get(f"{base_url}/api/sensors/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed")
            print(f"  Status: {data.get('status')}")
            print(f"  Sensors: {data.get('sensors')}")
        else:
            print(f"✗ Health check failed: HTTP {response.status_code}")
            success = False
    except requests.exceptions.RequestException as e:
        print(f"✗ Health check failed: {e}")
        print("  (Is the API server running? Start with: python3 app.py)")
        success = False
    
    # Test readings endpoint
    try:
        print(f"\nTesting GET {base_url}/api/sensors/readings")
        response = requests.get(f"{base_url}/api/sensors/readings", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Readings endpoint passed")
            print(f"  Light: {data.get('light')}")
            print(f"  Temperature: {data.get('temperature')}")
            print(f"  Acceleration: {data.get('acceleration')}")
            print(f"  Timestamp: {data.get('timestamp')}")
        else:
            print(f"✗ Readings endpoint failed: HTTP {response.status_code}")
            success = False
    except requests.exceptions.RequestException as e:
        print(f"✗ Readings endpoint failed: {e}")
        success = False
    
    # Test info endpoint
    try:
        print(f"\nTesting GET {base_url}/api/sensors/info")
        response = requests.get(f"{base_url}/api/sensors/info", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Info endpoint passed")
            print(f"  Name: {data.get('name')}")
            print(f"  Version: {data.get('version')}")
        else:
            print(f"✗ Info endpoint failed: HTTP {response.status_code}")
            success = False
    except requests.exceptions.RequestException as e:
        print(f"✗ Info endpoint failed: {e}")
        success = False
    
    if success:
        print("\n✓ All API endpoint tests passed")
    else:
        print("\n✗ Some API endpoint tests failed")
    
    return success


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("OuroborOS-Chimera Bio Sensor Service Tests")
    print("=" * 60)
    
    # Test sensor node
    sensor_ok = test_sensor_node()
    
    # Test API endpoints
    api_ok = test_api_endpoints()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"BioSensorNode: {'✓ PASS' if sensor_ok else '✗ FAIL'}")
    print(f"API Endpoints: {'✓ PASS' if api_ok else '✗ FAIL'}")
    
    if sensor_ok and api_ok:
        print("\n✓ All tests passed!")
        return 0
    else:
        print("\n✗ Some tests failed")
        return 1


if __name__ == '__main__':
    sys.exit(main())
