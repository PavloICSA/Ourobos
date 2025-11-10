#!/usr/bin/env python3
"""
Simplified Flask API Server for Bio Sensor Service (Mock Mode)
For hackathon demo - generates mock sensor readings
"""

import os
import time
import random
from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for browser requests
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": False
    }
})


def generate_mock_readings():
    """Generate mock sensor readings"""
    return {
        'temperature': round(20 + random.uniform(-5, 5), 2),
        'humidity': round(50 + random.uniform(-20, 20), 2),
        'light': round(500 + random.uniform(-200, 200), 2),
        'motion': random.choice([True, False]),
        'timestamp': time.time()
    }


@app.route('/api/sensors/readings', methods=['GET'])
@app.route('/api/biosensor/readings', methods=['GET'])
def get_readings():
    """Get current sensor readings"""
    try:
        readings = generate_mock_readings()
        
        return jsonify({
            'sensors': readings,
            'node_id': 'mock_sensor_node_1',
            'status': 'active',
            'timestamp': time.time()
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/sensors/health', methods=['GET'])
@app.route('/api/biosensor/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'biosensor',
        'node_id': 'mock_sensor_node_1',
        'sensors_active': 4,
        'timestamp': time.time()
    })


@app.route('/api/sensors/info', methods=['GET'])
@app.route('/api/biosensor/info', methods=['GET'])
def get_info():
    """Get service information"""
    return jsonify({
        'service': 'OuroborOS Bio Sensor Service (Mock)',
        'version': '1.0.0-demo',
        'node_id': 'mock_sensor_node_1',
        'sensors': {
            'temperature': {'unit': 'celsius', 'range': [15, 25]},
            'humidity': {'unit': 'percent', 'range': [30, 70]},
            'light': {'unit': 'lux', 'range': [300, 700]},
            'motion': {'unit': 'boolean', 'range': [False, True]}
        }
    })


if __name__ == '__main__':
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 5001))
    
    print(f"Starting Bio Sensor Service (Mock Mode) on {host}:{port}")
    print("Generating mock sensor readings for demo")
    
    app.run(host=host, port=port, debug=True)
