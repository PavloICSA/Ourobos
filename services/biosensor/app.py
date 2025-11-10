"""
OuroborOS-Chimera Bio Sensor API
Flask REST API for accessing Raspberry Pi sensor data
"""

import os
import time
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS
from bio_sensor_node import BioSensorNode

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for browser requests

# Initialize sensor node
sensor_node = BioSensorNode()

# API key for authentication (optional, set via environment variable)
API_KEY = os.environ.get('BIOSENSOR_API_KEY', None)


def require_api_key(f):
    """
    Decorator to require API key authentication.
    Only enforced if BIOSENSOR_API_KEY environment variable is set.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Skip authentication if no API key configured
        if API_KEY is None:
            return f(*args, **kwargs)
        
        # Check for API key in header
        key = request.headers.get('X-API-Key')
        if key != API_KEY:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Invalid or missing API key'
            }), 401
        
        return f(*args, **kwargs)
    return decorated


@app.route('/api/sensors/readings', methods=['GET'])
@require_api_key
def get_readings():
    """
    Get current sensor readings.
    
    Returns:
        JSON object with normalized sensor values (0-1 range):
        {
            "light": 0.5,
            "temperature": 0.6,
            "acceleration": 0.3,
            "timestamp": 1234567890.123
        }
    
    Note: Sensor values may be null if sensor is unavailable or read fails.
    """
    try:
        readings = sensor_node.read_all()
        return jsonify(readings), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to read sensors',
            'message': str(e)
        }), 500


@app.route('/api/sensors/health', methods=['GET'])
def health_check():
    """
    Check sensor availability and API health.
    
    Returns:
        JSON object with health status:
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
    """
    try:
        status = sensor_node.get_health_status()
        return jsonify({
            'status': 'ok',
            'sensors': status,
            'timestamp': time.time()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': time.time()
        }), 500


@app.route('/api/sensors/info', methods=['GET'])
def get_info():
    """
    Get API information and sensor specifications.
    
    Returns:
        JSON object with API info:
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
    """
    return jsonify({
        'name': 'OuroborOS-Chimera Bio Sensor API',
        'version': '1.0.0',
        'sensors': {
            'light': 'TSL2561 (0-1000 lux normalized to 0-1)',
            'temperature': 'DHT22 (0-40°C normalized to 0-1)',
            'acceleration': 'MPU6050 (0-20 m/s² normalized to 0-1)'
        },
        'authentication': 'required' if API_KEY else 'optional',
        'endpoints': {
            '/api/sensors/readings': 'GET - Current sensor readings',
            '/api/sensors/health': 'GET - Sensor health status',
            '/api/sensors/info': 'GET - API information'
        }
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not found',
        'message': 'The requested endpoint does not exist'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500


if __name__ == '__main__':
    # Print startup information
    print("=" * 60)
    print("OuroborOS-Chimera Bio Sensor API")
    print("=" * 60)
    
    # Check sensor status
    status = sensor_node.get_health_status()
    print("\nSensor Status:")
    for sensor, available in status.items():
        print(f"  {sensor}: {'✓ Available' if available else '✗ Unavailable'}")
    
    # Check authentication
    if API_KEY:
        print(f"\nAuthentication: ENABLED (API key required)")
    else:
        print(f"\nAuthentication: DISABLED (set BIOSENSOR_API_KEY to enable)")
    
    print("\nStarting server on http://0.0.0.0:5001")
    print("=" * 60)
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=False  # Set to True for development
    )
