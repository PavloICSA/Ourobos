/**
 * Quantum Entropy Client Example
 * 
 * Demonstrates how to use the QuantumEntropyClient.
 */

import { QuantumEntropyClient } from './client.js';
import config from '../config/index.js';

async function main() {
  console.log('=== Quantum Entropy Client Example ===\n');
  
  // Create client
  const client = new QuantumEntropyClient(
    config.quantum.apiUrl,
    config.quantum.useMock
  );
  
  console.log('Client created');
  console.log('API URL:', config.quantum.apiUrl);
  console.log('Mock mode:', config.quantum.useMock);
  console.log();
  
  // Check health
  console.log('Checking service health...');
  const healthy = await client.healthCheck();
  console.log('Service healthy:', healthy);
  console.log();
  
  // Get service info
  console.log('Getting service info...');
  const info = await client.getInfo();
  if (info) {
    console.log('Service:', info.service);
    console.log('Version:', info.version);
    console.log('Backend:', info.backend?.name);
    console.log('Backend type:', info.backend?.type);
  }
  console.log();
  
  // Get entropy
  console.log('Generating quantum entropy...');
  const start = Date.now();
  const entropy = await client.getEntropy(256);
  const elapsed = Date.now() - start;
  
  console.log('Entropy:', entropy);
  console.log('Time taken:', elapsed, 'ms');
  console.log('From pool:', elapsed < 50); // Pool access is very fast
  console.log();
  
  // Get more entropy to show pool usage
  console.log('Getting more entropy (should be from pool)...');
  const entropy2 = await client.getEntropy(256);
  console.log('Entropy:', entropy2);
  console.log('Different from first:', entropy !== entropy2);
  console.log();
  
  // Check pool status
  const status = client.getStatus();
  console.log('Client status:');
  console.log('  Healthy:', status.healthy);
  console.log('  Mock mode:', status.mockMode);
  console.log('  Pool level:', status.poolLevel, '/', status.poolCapacity);
  console.log('  Is refilling:', status.isRefilling);
  console.log();
  
  // Generate multiple entropy values
  console.log('Generating 5 entropy values...');
  for (let i = 0; i < 5; i++) {
    const e = await client.getEntropy(256);
    console.log(`  ${i + 1}. ${e.substring(0, 16)}...`);
  }
  console.log();
  
  // Final pool status
  const finalStatus = client.getStatus();
  console.log('Final pool level:', finalStatus.poolLevel, '/', finalStatus.poolCapacity);
  
  console.log('\n=== Example Complete ===');
}

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default main;
