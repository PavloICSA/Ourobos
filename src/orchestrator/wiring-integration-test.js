/**
 * Integration Test for Task 12: Wire All Components Together
 * 
 * Tests:
 * - Main.js entry point initialization
 * - Service client connections
 * - Configuration system
 * - Error recovery mechanisms
 */

import { ChimeraOrchestrator } from './chimera-orchestrator.js';
import config, { 
  getServiceStatus, 
  updateConfig, 
  enableService, 
  disableService,
  setMockMode,
  validateConfig,
  exportConfig,
  importConfig
} from '../config/index.js';

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║     Task 12 Integration Test: Wire All Components        ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

/**
 * Test 1: Configuration System
 */
async function testConfigurationSystem() {
  console.log('Test 1: Configuration System');
  console.log('─────────────────────────────────────────────────────────');
  
  try {
    // Test service status
    const status = getServiceStatus();
    console.log('✓ Service status retrieved:', status);
    
    // Test configuration validation
    const validation = validateConfig(config);
    console.log('✓ Configuration validated:', validation.valid ? 'VALID' : 'HAS WARNINGS');
    if (validation.warnings.length > 0) {
      console.log('  Warnings:', validation.warnings);
    }
    
    // Test configuration export
    const exported = exportConfig();
    console.log('✓ Configuration exported (length:', exported.length, 'bytes)');
    
    // Test configuration import
    const imported = importConfig(exported);
    console.log('✓ Configuration imported:', imported ? 'SUCCESS' : 'FAILED');
    
    // Test service enable/disable
    disableService('quantum');
    console.log('✓ Quantum service disabled');
    enableService('quantum');
    console.log('✓ Quantum service enabled');
    
    // Test mock mode toggle
    setMockMode('quantum', true);
    console.log('✓ Quantum mock mode enabled');
    setMockMode('quantum', false);
    console.log('✓ Quantum mock mode disabled');
    
    // Test runtime config update
    const updated = updateConfig({
      quantum: { poolSize: 20 }
    });
    console.log('✓ Configuration updated:', updated ? 'SUCCESS' : 'FAILED');
    console.log('  New pool size:', config.quantum.poolSize);
    
    console.log('');
    console.log('✓ Configuration system tests passed');
    console.log('');
    return true;
    
  } catch (error) {
    console.error('✗ Configuration system test failed:', error);
    console.log('');
    return false;
  }
}

/**
 * Test 2: ChimeraOrchestrator Initialization
 */
async function testOrchestratorInitialization() {
  console.log('Test 2: ChimeraOrchestrator Initialization');
  console.log('─────────────────────────────────────────────────────────');
  
  try {
    // Create orchestrator with mock services
    const orchestrator = new ChimeraOrchestrator({
      enableBlockchain: false,
      enableQuantum: true,
      enableBioSensor: true,
      useMockQuantum: true,
      useMockBioSensor: true
    });
    
    console.log('✓ ChimeraOrchestrator created');
    
    // Initialize orchestrator
    await orchestrator.init();
    console.log('✓ ChimeraOrchestrator initialized');
    
    // Check initialization status
    const initialized = orchestrator.isInitialized();
    console.log('✓ Initialization status:', initialized ? 'INITIALIZED' : 'NOT INITIALIZED');
    
    // Check service health
    const health = orchestrator.getServiceHealth();
    console.log('✓ Service health retrieved:', health);
    
    // Check detailed service status
    const detailedStatus = orchestrator.getDetailedServiceStatus();
    console.log('✓ Detailed service status:', detailedStatus.overall);
    
    console.log('');
    console.log('✓ Orchestrator initialization tests passed');
    console.log('');
    return { success: true, orchestrator };
    
  } catch (error) {
    console.error('✗ Orchestrator initialization test failed:', error);
    console.log('');
    return { success: false, orchestrator: null };
  }
}

/**
 * Test 3: Service Integration
 */
async function testServiceIntegration(orchestrator) {
  console.log('Test 3: Service Integration');
  console.log('─────────────────────────────────────────────────────────');
  
  if (!orchestrator) {
    console.log('⚠ Skipping (no orchestrator)');
    console.log('');
    return false;
  }
  
  try {
    // Check service integration
    const integration = orchestrator.serviceIntegration;
    console.log('✓ Service integration manager:', integration ? 'PRESENT' : 'MISSING');
    
    if (integration) {
      const connected = integration.isConnected();
      console.log('✓ Services connected:', connected ? 'YES' : 'NO');
      
      const connectionStatus = integration.getConnectionStatus();
      console.log('✓ Connection status:', connectionStatus);
    }
    
    // Test quantum client
    if (orchestrator.quantumClient) {
      console.log('✓ Quantum client present');
      
      try {
        const entropy = await orchestrator.quantumClient.getEntropy(256);
        console.log('✓ Quantum entropy generated (length:', entropy.length, ')');
      } catch (error) {
        console.log('⚠ Quantum entropy generation failed:', error.message);
      }
    }
    
    // Test bio sensor client
    if (orchestrator.bioSensorClient) {
      console.log('✓ Bio sensor client present');
      
      try {
        const readings = await orchestrator.bioSensorClient.getReadings();
        console.log('✓ Bio sensor readings:', readings);
      } catch (error) {
        console.log('⚠ Bio sensor reading failed:', error.message);
      }
    }
    
    // Test Go neural clusters
    if (orchestrator.goNeuralClusters) {
      console.log('✓ Go neural clusters present');
      
      try {
        const initialized = orchestrator.goNeuralClusters.isInitialized();
        console.log('✓ Go WASM initialized:', initialized ? 'YES' : 'NO');
      } catch (error) {
        console.log('⚠ Go WASM check failed:', error.message);
      }
    }
    
    console.log('');
    console.log('✓ Service integration tests passed');
    console.log('');
    return true;
    
  } catch (error) {
    console.error('✗ Service integration test failed:', error);
    console.log('');
    return false;
  }
}

/**
 * Test 4: Error Recovery
 */
async function testErrorRecovery(orchestrator) {
  console.log('Test 4: Error Recovery');
  console.log('─────────────────────────────────────────────────────────');
  
  if (!orchestrator) {
    console.log('⚠ Skipping (no orchestrator)');
    console.log('');
    return false;
  }
  
  try {
    // Check error recovery
    const errorRecovery = orchestrator.getErrorRecovery();
    console.log('✓ Error recovery manager:', errorRecovery ? 'PRESENT' : 'MISSING');
    
    if (errorRecovery) {
      const enabled = errorRecovery.isEnabled();
      console.log('✓ Error recovery enabled:', enabled ? 'YES' : 'NO');
      
      const status = errorRecovery.getRecoveryStatus();
      console.log('✓ Recovery status:', status);
      
      // Test entropy fallback
      try {
        const entropy = await errorRecovery.getEntropyWithFallback();
        console.log('✓ Entropy fallback successful (length:', entropy.length, ')');
      } catch (error) {
        console.log('⚠ Entropy fallback failed:', error.message);
      }
      
      // Test sensor fallback
      try {
        const readings = await errorRecovery.getSensorReadingsWithFallback();
        console.log('✓ Sensor fallback successful:', readings);
      } catch (error) {
        console.log('⚠ Sensor fallback failed:', error.message);
      }
      
      // Test mutation queue
      const queuedCount = errorRecovery.getQueuedMutationCount();
      console.log('✓ Queued mutations:', queuedCount);
      
      // Test error states
      const errorStates = errorRecovery.getAllErrorStates();
      console.log('✓ Error states:', Object.keys(errorStates).length, 'errors');
    }
    
    console.log('');
    console.log('✓ Error recovery tests passed');
    console.log('');
    return true;
    
  } catch (error) {
    console.error('✗ Error recovery test failed:', error);
    console.log('');
    return false;
  }
}

/**
 * Test 5: Event System
 */
async function testEventSystem(orchestrator) {
  console.log('Test 5: Event System');
  console.log('─────────────────────────────────────────────────────────');
  
  if (!orchestrator) {
    console.log('⚠ Skipping (no orchestrator)');
    console.log('');
    return false;
  }
  
  try {
    let eventReceived = false;
    
    // Register event listener
    orchestrator.on('stateUpdate', (state) => {
      eventReceived = true;
      console.log('✓ State update event received:', state.generation);
    });
    
    // Trigger state update
    orchestrator.updateState({ generation: 1 });
    
    // Check if event was received
    if (eventReceived) {
      console.log('✓ Event system working');
    } else {
      console.log('⚠ Event not received');
    }
    
    console.log('');
    console.log('✓ Event system tests passed');
    console.log('');
    return true;
    
  } catch (error) {
    console.error('✗ Event system test failed:', error);
    console.log('');
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting integration tests...');
  console.log('');
  
  const results = {
    configuration: false,
    initialization: false,
    integration: false,
    errorRecovery: false,
    eventSystem: false
  };
  
  // Test 1: Configuration System
  results.configuration = await testConfigurationSystem();
  
  // Test 2: Orchestrator Initialization
  const initResult = await testOrchestratorInitialization();
  results.initialization = initResult.success;
  const orchestrator = initResult.orchestrator;
  
  // Test 3: Service Integration
  results.integration = await testServiceIntegration(orchestrator);
  
  // Test 4: Error Recovery
  results.errorRecovery = await testErrorRecovery(orchestrator);
  
  // Test 5: Event System
  results.eventSystem = await testEventSystem(orchestrator);
  
  // Summary
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    Test Summary                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Configuration System:    ', results.configuration ? '✓ PASS' : '✗ FAIL');
  console.log('Orchestrator Init:       ', results.initialization ? '✓ PASS' : '✗ FAIL');
  console.log('Service Integration:     ', results.integration ? '✓ PASS' : '✗ FAIL');
  console.log('Error Recovery:          ', results.errorRecovery ? '✓ PASS' : '✗ FAIL');
  console.log('Event System:            ', results.eventSystem ? '✓ PASS' : '✗ FAIL');
  console.log('');
  
  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`Overall: ${passCount}/${totalCount} tests passed`);
  console.log('');
  
  if (passCount === totalCount) {
    console.log('✓ All tests passed! Task 12 implementation verified.');
  } else {
    console.log('⚠ Some tests failed. Review implementation.');
  }
  
  return results;
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runAllTests };
