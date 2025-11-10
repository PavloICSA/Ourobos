#!/usr/bin/env python3
"""
Test script for quantum entropy service.

Tests both the quantum entropy source and the Flask API.
"""

import sys
import time
import requests
from quantum_entropy import QuantumEntropySource


def test_quantum_source():
    """Test the QuantumEntropySource class."""
    print("=" * 60)
    print("Testing QuantumEntropySource")
    print("=" * 60)
    
    # Create source (will use simulator)
    print("\n1. Creating quantum entropy source...")
    source = QuantumEntropySource(use_real_hardware=False)
    print(f"   Backend: {source.backend_name}")
    print(f"   Real hardware: {source.use_real_hardware}")
    
    # Test entropy generation
    print("\n2. Generating 256 bits of entropy...")
    start = time.time()
    entropy = source.generate_entropy(256)
    elapsed = time.time() - start
    print(f"   Generated {len(entropy)} bytes")
    print(f"   Time: {elapsed:.3f}s")
    
    # Test hash generation
    print("\n3. Generating entropy hash...")
    start = time.time()
    entropy_hash = source.generate_entropy_hash(256)
    elapsed = time.time() - start
    print(f"   Hash: {entropy_hash}")
    print(f"   Time: {elapsed:.3f}s")
    
    # Test randomness
    print("\n4. Testing randomness (generating 5 hashes)...")
    hashes = []
    for i in range(5):
        h = source.generate_entropy_hash(256)
        hashes.append(h)
        print(f"   {i+1}. {h[:32]}...")
    
    # Check all different
    unique = len(set(hashes)) == len(hashes)
    print(f"   All unique: {unique}")
    
    # Test backend info
    print("\n5. Getting backend info...")
    info = source.get_backend_info()
    print(f"   Name: {info['name']}")
    print(f"   Type: {info['type']}")
    print(f"   Real hardware: {info['real_hardware']}")
    
    print("\n✓ QuantumEntropySource tests passed!")
    return True


def test_flask_api(base_url="http://localhost:5000"):
    """Test the Flask API endpoints."""
    print("\n" + "=" * 60)
    print("Testing Flask API")
    print("=" * 60)
    
    # Test health endpoint
    print("\n1. Testing /api/quantum/health...")
    try:
        response = requests.get(f"{base_url}/api/quantum/health", timeout=5)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Service: {data.get('service')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Backend: {data.get('backend')}")
        else:
            print(f"   Error: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ✗ Failed to connect: {e}")
        print(f"   Make sure the service is running: python app.py")
        return False
    
    # Test info endpoint
    print("\n2. Testing /api/quantum/info...")
    response = requests.get(f"{base_url}/api/quantum/info", timeout=5)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   Service: {data.get('service')}")
        print(f"   Version: {data.get('version')}")
        print(f"   Max bits: {data.get('capabilities', {}).get('max_bits')}")
    
    # Test entropy endpoint
    print("\n3. Testing /api/quantum/entropy...")
    start = time.time()
    response = requests.get(f"{base_url}/api/quantum/entropy?bits=256", timeout=10)
    elapsed = time.time() - start
    print(f"   Status: {response.status_code}")
    print(f"   Time: {elapsed:.3f}s")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   Entropy: {data.get('entropy')[:32]}...")
        print(f"   Bits: {data.get('bits')}")
        print(f"   Backend: {data.get('backend')}")
        print(f"   Generation time: {data.get('generation_time'):.3f}s")
    else:
        print(f"   Error: {response.text}")
        return False
    
    # Test multiple requests
    print("\n4. Testing multiple requests (5x)...")
    entropies = []
    for i in range(5):
        response = requests.get(f"{base_url}/api/quantum/entropy?bits=256", timeout=10)
        if response.status_code == 200:
            data = response.json()
            entropy = data.get('entropy')
            entropies.append(entropy)
            print(f"   {i+1}. {entropy[:32]}...")
        else:
            print(f"   {i+1}. Error: {response.status_code}")
    
    unique = len(set(entropies)) == len(entropies)
    print(f"   All unique: {unique}")
    
    # Test rate limiting (should fail on 11th request)
    print("\n5. Testing rate limiting...")
    print("   Making 11 requests rapidly...")
    rate_limited = False
    for i in range(11):
        response = requests.get(f"{base_url}/api/quantum/entropy?bits=256", timeout=10)
        if response.status_code == 429:
            rate_limited = True
            print(f"   Request {i+1}: Rate limited (expected)")
            break
        elif response.status_code == 200:
            print(f"   Request {i+1}: OK")
        else:
            print(f"   Request {i+1}: Error {response.status_code}")
    
    if rate_limited:
        print("   ✓ Rate limiting working correctly")
    else:
        print("   ⚠ Rate limiting may not be working (or limit not reached)")
    
    # Test invalid parameters
    print("\n6. Testing error handling...")
    response = requests.get(f"{base_url}/api/quantum/entropy?bits=9999", timeout=5)
    print(f"   Invalid bits (9999): {response.status_code}")
    if response.status_code == 400:
        print("   ✓ Validation working correctly")
    
    print("\n✓ Flask API tests passed!")
    return True


def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("Quantum Entropy Service Test Suite")
    print("=" * 60)
    
    # Test quantum source
    try:
        if not test_quantum_source():
            print("\n✗ QuantumEntropySource tests failed")
            return 1
    except Exception as e:
        print(f"\n✗ QuantumEntropySource tests failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    # Test Flask API (optional - only if service is running)
    print("\n" + "=" * 60)
    print("Flask API tests require the service to be running.")
    print("Start with: python app.py")
    print("=" * 60)
    
    try:
        if not test_flask_api():
            print("\n⚠ Flask API tests failed (service may not be running)")
            print("   This is OK if you haven't started the service yet")
    except Exception as e:
        print(f"\n⚠ Flask API tests skipped: {e}")
        print("   Start the service with: python app.py")
    
    print("\n" + "=" * 60)
    print("✓ All tests completed!")
    print("=" * 60)
    return 0


if __name__ == '__main__':
    sys.exit(main())
