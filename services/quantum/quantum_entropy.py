#!/usr/bin/env python3
"""
Quantum Entropy Source for OuroborOS-Chimera

Generates true random numbers using Qiskit quantum circuits.
Uses Hadamard gates to create superposition and measurement for randomness.
"""

import os
import time
import hashlib
from typing import Optional

from qiskit import QuantumCircuit, execute, Aer
from qiskit.providers.ibmq import IBMQ, least_busy


class QuantumEntropySource:
    """
    Quantum entropy generator using Qiskit.
    
    Supports both real IBM Quantum hardware and simulation fallback.
    """
    
    def __init__(self, use_real_hardware: bool = False, api_token: Optional[str] = None):
        """
        Initialize quantum entropy source.
        
        Args:
            use_real_hardware: Whether to use real quantum hardware
            api_token: IBM Quantum API token (required for real hardware)
        """
        self.use_real_hardware = use_real_hardware
        self.backend_name = "qasm_simulator"
        
        if use_real_hardware and api_token:
            try:
                # Save and load IBM Quantum account
                IBMQ.save_account(api_token, overwrite=True)
                IBMQ.load_account()
                
                # Get provider and find least busy backend
                provider = IBMQ.get_provider(hub='ibm-q')
                self.backend = least_busy(
                    provider.backends(
                        filters=lambda x: x.configuration().n_qubits >= 5 and
                                        not x.configuration().simulator and
                                        x.status().operational
                    )
                )
                self.backend_name = self.backend.name()
                print(f"Using real quantum hardware: {self.backend_name}")
            except Exception as e:
                print(f"Failed to connect to quantum hardware: {e}")
                print("Falling back to simulator")
                self.backend = Aer.get_backend('qasm_simulator')
                self.backend_name = "qasm_simulator"
                self.use_real_hardware = False
        else:
            # Use simulator
            self.backend = Aer.get_backend('qasm_simulator')
            self.backend_name = "qasm_simulator"
            print(f"Using quantum simulator: {self.backend_name}")
    
    def generate_entropy(self, num_bits: int = 256) -> bytes:
        """
        Generate quantum random bits using superposition.
        
        Args:
            num_bits: Number of random bits to generate
            
        Returns:
            Random bytes generated from quantum measurements
        """
        # Limit qubits based on backend capabilities
        # Most IBM quantum computers have 5-127 qubits
        # We'll use 5 qubits for compatibility
        num_qubits = min(5, num_bits)
        
        # Calculate how many shots we need
        # Each shot gives us num_qubits bits
        shots = (num_bits // num_qubits) + 1
        
        # Create quantum circuit
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        # Put all qubits in superposition using Hadamard gates
        # H|0⟩ = (|0⟩ + |1⟩)/√2
        for i in range(num_qubits):
            qc.h(i)
        
        # Measure all qubits
        qc.measure(range(num_qubits), range(num_qubits))
        
        # Execute circuit
        job = execute(qc, self.backend, shots=shots)
        result = job.result()
        counts = result.get_counts(qc)
        
        # Extract random bits from measurement results
        bits = []
        for bitstring, count in counts.items():
            # Each bitstring is a measurement result
            for _ in range(count):
                # Convert bitstring to individual bits
                bits.extend([int(b) for b in bitstring])
                if len(bits) >= num_bits:
                    break
            if len(bits) >= num_bits:
                break
        
        # Trim to exact number of bits requested
        bits = bits[:num_bits]
        
        # Convert bits to bytes
        byte_array = bytearray()
        for i in range(0, len(bits), 8):
            byte = 0
            for j in range(8):
                if i + j < len(bits):
                    byte |= (bits[i + j] << (7 - j))
            byte_array.append(byte)
        
        return bytes(byte_array)
    
    def generate_entropy_hash(self, num_bits: int = 256) -> str:
        """
        Generate entropy and return as hex hash.
        
        Args:
            num_bits: Number of random bits to generate
            
        Returns:
            SHA-256 hash of quantum entropy as hex string
        """
        entropy = self.generate_entropy(num_bits)
        return hashlib.sha256(entropy).hexdigest()
    
    def get_backend_info(self) -> dict:
        """
        Get information about the current backend.
        
        Returns:
            Dictionary with backend information
        """
        return {
            'name': self.backend_name,
            'real_hardware': self.use_real_hardware,
            'type': 'quantum' if self.use_real_hardware else 'simulator'
        }


# Module-level instance for Flask app
_entropy_source: Optional[QuantumEntropySource] = None


def get_entropy_source() -> QuantumEntropySource:
    """Get or create the global entropy source instance."""
    global _entropy_source
    if _entropy_source is None:
        # Check for API token in environment
        api_token = os.environ.get('QISKIT_API_TOKEN')
        use_real_hardware = api_token is not None
        
        _entropy_source = QuantumEntropySource(
            use_real_hardware=use_real_hardware,
            api_token=api_token
        )
    
    return _entropy_source


if __name__ == '__main__':
    # Test the quantum entropy source
    print("Testing Quantum Entropy Source...")
    
    source = get_entropy_source()
    print(f"Backend: {source.backend_name}")
    
    # Generate some entropy
    print("\nGenerating 256 bits of quantum entropy...")
    start = time.time()
    entropy_hash = source.generate_entropy_hash(256)
    elapsed = time.time() - start
    
    print(f"Entropy hash: {entropy_hash}")
    print(f"Time taken: {elapsed:.3f}s")
    
    # Generate again to show randomness
    print("\nGenerating again...")
    entropy_hash2 = source.generate_entropy_hash(256)
    print(f"Entropy hash: {entropy_hash2}")
    print(f"Different from first: {entropy_hash != entropy_hash2}")
