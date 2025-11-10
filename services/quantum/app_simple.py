#!/usr/bin/env python3
"""
Simplified Flask API Server for Quantum Entropy Service (Mock Mode)
For hackathon demo - uses pseudo-random instead of real quantum
"""

import os
import time
import hashlib
import secrets
from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for browser requests
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})


def generate_mock_entropy(num_bits):
    """Generate mock quantum entropy using cryptographically secure random"""
    num_bytes = (num_bits + 7) // 8
    random_bytes = secrets.token_bytes(num_bytes)
    entropy_hash = hashlib.sha256(random_bytes).hexdigest()
    return entropy_hash


@app.route('/api/quantum/entropy', methods=['GET'])
def get_entropy():
    """Generate quantum entropy (mock mode)"""
    try:
        num_bits = int(request.args.get('bits', 256))
        
        if num_bits < 1 or num_bits > 4096:
            return jsonify({
                'error': 'Invalid bits parameter',
                'message': 'bits must be between 1 and 4096'
            }), 400
        
        start_time = time.time()
        entropy_hash = generate_mock_entropy(num_bits)
        elapsed = time.time() - start_time
        
        return jsonify({
            'entropy': entropy_hash,
            'bits': num_bits,
            'backend': 'mock_quantum_simulator',
            'backend_type': 'simulator',
            'real_hardware': False,
            'timestamp': time.time(),
            'generation_time': elapsed
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/quantum/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'quantum-entropy',
        'backend': 'mock_quantum_simulator',
        'backend_type': 'simulator',
        'real_hardware': False,
        'timestamp': time.time()
    })


@app.route('/api/quantum/info', methods=['GET'])
def get_info():
    """Get service information"""
    return jsonify({
        'service': 'OuroborOS Quantum Entropy Service (Mock)',
        'version': '1.0.0-demo',
        'backend': {
            'name': 'mock_quantum_simulator',
            'type': 'simulator',
            'real_hardware': False
        },
        'capabilities': {
            'max_bits': 4096,
            'min_bits': 1
        }
    })


if __name__ == '__main__':
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 5000))
    
    print(f"Starting Quantum Entropy Service (Mock Mode) on {host}:{port}")
    print("Using cryptographically secure pseudo-random for demo")
    
    app.run(host=host, port=port, debug=True)
