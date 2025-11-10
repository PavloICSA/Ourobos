/**
 * OuroborOS-Chimera Bio Sensor Client - Example Usage
 */

import { BioSensorClient } from './client.js';

// Example 1: Basic usage with automatic fallback
async function basicExample() {
  console.log('=== Basic Bio Sensor Example ===\n');
  
  // Create client (will try real API, fall back to mock if unavailable)
  const client = new BioSensorClient('http://raspberrypi.local:5001');
  
  // Get sensor readings
  const readings = await client.getReadings();
  console.log('Sensor Readings:');
  console.log(`  Light: ${readings.light?.toFixed(3) ?? 'N/A'}`);
  console.log(`  Temperature: ${readings.temperature?.toFixed(3) ?? 'N/A'}`);
  console.log(`  Acceleration: ${readings.acceleration?.toFixed(3) ?? 'N/A'}`);
  console.log(`  Timestamp: ${new Date(readings.timestamp * 1000).toISOString()}`);
  console.log(`  Mode: ${client.isMockMode() ? 'MOCK' : 'REAL'}\n`);
}

// Example 2: Health check and status
async function healthCheckExample() {
  console.log('=== Health Check Example ===\n');
  
  const client = new BioSensorClient('http://raspberrypi.local:5001');
  
  // Check if API is healthy
  const isHealthy = await client.healthCheck();
  console.log(`API Health: ${isHealthy ? '✓ Healthy' : '✗ Unavailable'}`);
  
  // Get detailed health status
  const status = await client.getHealthStatus();
  if (status) {
    console.log('\nSensor Status:');
    console.log(`  Light: ${status.sensors.light ? '✓' : '✗'}`);
    console.log(`  Temperature: ${status.sensors.temperature ? '✓' : '✗'}`);
    console.log(`  Acceleration: ${status.sensors.acceleration ? '✓' : '✗'}`);
    console.log(`  I2C: ${status.sensors.i2c ? '✓' : '✗'}`);
  }
  console.log('');
}

// Example 3: Continuous monitoring
async function continuousMonitoringExample() {
  console.log('=== Continuous Monitoring Example ===\n');
  
  const client = new BioSensorClient('http://raspberrypi.local:5001');
  
  console.log('Reading sensors every 2 seconds (press Ctrl+C to stop)...\n');
  
  let count = 0;
  const interval = setInterval(async () => {
    count++;
    const readings = await client.getReadings();
    
    console.log(`Reading #${count}:`);
    console.log(`  Light: ${readings.light?.toFixed(3) ?? 'N/A'} | ` +
                `Temp: ${readings.temperature?.toFixed(3) ?? 'N/A'} | ` +
                `Accel: ${readings.acceleration?.toFixed(3) ?? 'N/A'}`);
    
    // Stop after 10 readings for demo
    if (count >= 10) {
      clearInterval(interval);
      console.log('\nMonitoring complete.\n');
    }
  }, 2000);
}

// Example 4: Using with API key authentication
async function authenticatedExample() {
  console.log('=== Authenticated Access Example ===\n');
  
  // Create client with API key
  const apiKey = process.env.BIOSENSOR_API_KEY || 'your-api-key-here';
  const client = new BioSensorClient(
    'http://raspberrypi.local:5001',
    false,
    apiKey
  );
  
  try {
    const readings = await client.getReadings();
    console.log('✓ Authenticated successfully');
    console.log(`Light: ${readings.light?.toFixed(3) ?? 'N/A'}\n`);
  } catch (error) {
    console.log('✗ Authentication failed:', error.message, '\n');
  }
}

// Example 5: Mock mode for testing
async function mockModeExample() {
  console.log('=== Mock Mode Example ===\n');
  
  // Force mock mode (useful for testing without hardware)
  const client = new BioSensorClient('http://raspberrypi.local:5001', true);
  
  console.log('Using mock mode (simulated sensors)...\n');
  
  for (let i = 0; i < 5; i++) {
    const readings = await client.getReadings();
    console.log(`Mock Reading #${i + 1}:`);
    console.log(`  Light: ${readings.light.toFixed(3)}`);
    console.log(`  Temperature: ${readings.temperature.toFixed(3)}`);
    console.log(`  Acceleration: ${readings.acceleration.toFixed(3)}`);
    
    // Wait a bit to see variation in mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('');
}

// Example 6: Integration with organism mutation
async function mutationIntegrationExample() {
  console.log('=== Mutation Integration Example ===\n');
  
  const client = new BioSensorClient('http://raspberrypi.local:5001');
  
  // Get sensor readings to influence mutation
  const readings = await client.getReadings();
  
  // Use sensor data to modify mutation parameters
  const mutationParams = {
    baseRate: 0.05,
    lightInfluence: readings.light ?? 0.5,
    tempInfluence: readings.temperature ?? 0.5,
    motionInfluence: readings.acceleration ?? 0.5
  };
  
  // Calculate adjusted mutation rate based on environment
  const adjustedRate = mutationParams.baseRate * 
    (1 + mutationParams.lightInfluence * 0.2) *
    (1 + mutationParams.tempInfluence * 0.1) *
    (1 + mutationParams.motionInfluence * 0.3);
  
  console.log('Mutation Parameters:');
  console.log(`  Base Rate: ${mutationParams.baseRate}`);
  console.log(`  Light Influence: ${mutationParams.lightInfluence.toFixed(3)}`);
  console.log(`  Temp Influence: ${mutationParams.tempInfluence.toFixed(3)}`);
  console.log(`  Motion Influence: ${mutationParams.motionInfluence.toFixed(3)}`);
  console.log(`  Adjusted Rate: ${adjustedRate.toFixed(4)}`);
  console.log('');
}

// Run examples
async function runExamples() {
  try {
    await basicExample();
    await healthCheckExample();
    await mockModeExample();
    await authenticatedExample();
    await mutationIntegrationExample();
    // await continuousMonitoringExample(); // Uncomment to run
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export {
  basicExample,
  healthCheckExample,
  continuousMonitoringExample,
  authenticatedExample,
  mockModeExample,
  mutationIntegrationExample
};
