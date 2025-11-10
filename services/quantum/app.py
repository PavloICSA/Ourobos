#!/usr/bin/env python3
"""
Flask API Server for Quantum Entropy Service

Provides REST API endpoints for quantum entropy generation.
"""

import os
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from quantum_entropy import get_entropy_source


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

# Configure rate limiting (10 requests per minute)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["10 per minute"],
    storage_uri="memory://"
)


@app.route('/api/quantum/entropy', methods=['GET'])
@limiter.limit("10 per minute")
def get_entropy():
    """
    Generate quantum entropy.
    
    Query Parameters:
        bits (int): Number of random bits to generate (default: 256)
    
    Returns:
        JSON response with entropy hash and metadata
    """
    try:
        # Get number of bits from query parameter
        num_bits = int(request.args.get('bits', 256))
        
        # Validate input
        if num_bits < 1 or num_bits > 4096:
            return jsonify({
                'error': 'Invalid bits parameter',
                'message': 'bits must be between 1 and 4096'
            }), 400
        
        # Get entropy source
        source = get_entropy_source()
        
        # Generate entropy
        start_time = time.time()
        entropy_hash = source.generate_entropy_hash(num_bits)
        elapsed = time.time() - start_time
        
        # Get backend info
        backend_info = source.get_backend_info()
        
        return jsonify({
            'entropy': entropy_hash,
            'bits': num_bits,
            'backend': backend_info['name'],
            'backend_type': backend_info['type'],
            'real_hardware': backend_info['real_hardware'],
            'timestamp': time.time(),
            'generation_time': elapsed
        })
    
    except ValueError as e:
        return jsonify({
            'error': 'Invalid parameter',
            'message': str(e)
        }), 400
    
    except Exception as e:
        app.logger.error(f"Error generating entropy: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to generate quantum entropy'
        }), 500


@app.route('/api/quantum/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response with service status and backend information
    """
    try:
        source = get_entropy_source()
        backend_info = source.get_backend_info()
        
        return jsonify({
            'status': 'ok',
            'service': 'quantum-entropy',
            'backend': backend_info['name'],
            'backend_type': backend_info['type'],
            'real_hardware': backend_info['real_hardware'],
            'timestamp': time.time()
        })
    
    except Exception as e:
        app.logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'error',
            'service': 'quantum-entropy',
            'message': str(e),
            'timestamp': time.time()
        }), 500


@app.route('/api/quantum/info', methods=['GET'])
def get_info():
    """
    Get detailed information about the quantum service.
    
    Returns:
        JSON response with service capabilities and configuration
    """
    try:
        source = get_entropy_source()
        backend_info = source.get_backend_info()
        
        return jsonify({
            'service': 'OuroborOS Quantum Entropy Service',
            'version': '1.0.0',
            'backend': backend_info,
            'capabilities': {
                'max_bits': 4096,
                'min_bits': 1,
                'rate_limit': '10 requests per minute'
            },
            'endpoints': {
                '/api/quantum/entropy': 'Generate quantum entropy',
                '/api/quantum/health': 'Health check',
                '/api/quantum/info': 'Service information'
            }
        })
    
    except Exception as e:
        app.logger.error(f"Info request failed: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded errors."""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please wait before trying again.',
        'retry_after': '60 seconds'
    }), 429


@app.errorhandler(404)
def not_found_handler(e):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Not found',
        'message': 'The requested endpoint does not exist'
    }), 404


@app.errorhandler(500)
def internal_error_handler(e):
    """Handle internal server errors."""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500


if __name__ == '__main__':
    # Get configuration from environment
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Starting Quantum Entropy Service on {host}:{port}")
    print(f"Debug mode: {debug}")
    
    # Initialize entropy source on startup
    source = get_entropy_source()
    print(f"Using backend: {source.backend_name}")
    
    # Run Flask app
    app.run(host=host, port=port, debug=debug)
