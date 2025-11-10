/**
 * OuroborOS-Chimera Configuration System
 * Manages all service URLs, feature flags, and environment variables
 * 
 * Features:
 * - Environment variable support via Vite
 * - Runtime configuration updates
 * - Mock mode toggles for all services
 * - Service enable/disable flags
 * - Configuration validation
 * - Configuration export/import
 */

/**
 * Default configuration
 */
const defaultConfig = {
  // Blockchain configuration
  blockchain: {
    rpcUrl: 'http://localhost:8545',
    contractAddress: '',
    chainId: 1337,
    enabled: true,
    votingPeriod: 60, // seconds
    quorum: 50 // percentage
  },

  // Quantum entropy service
  quantum: {
    apiUrl: 'http://localhost:5000',
    useMock: false,
    enabled: true,
    poolSize: 10,
    defaultBits: 256,
    refillInterval: 30000 // ms
  },

  // Bio sensor network
  bioSensor: {
    apiUrl: 'http://raspberrypi.local:5001',
    useMock: false,
    enabled: true,
    pollInterval: 1000, // ms
    apiKey: ''
  },

  // WASM modules
  wasm: {
    rustPath: '/wasm/rust/rust_orchestrator_bg.wasm',
    fortranPath: '/wasm/fortran/numeric_engine.wasm',
    goPath: '/wasm/go/neural_cluster.wasm',
    pascalPath: '/wasm/pascal/terminal.wasm',
    enabled: {
      rust: true,
      fortran: true,
      go: true,
      pascal: true
    }
  },

  // Meta-compiler settings
  compiler: {
    maxInstructions: 100000,
    maxMemory: 10 * 1024 * 1024, // 10MB
    timeout: 1000, // ms
    supportedLanguages: ['algol', 'lisp', 'pascal', 'rust', 'go', 'fortran'],
    validateOurocode: true
  },

  // Service health monitoring
  monitoring: {
    healthCheckInterval: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // ms
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000 // ms
  },

  // Visualization settings
  visualization: {
    enabled: true,
    fps: 30,
    fractalIterations: 100,
    showBlockchainTimeline: true,
    showQuantumEntropy: true,
    showBioSensors: true,
    showNeuralClusters: true
  },

  // Development mode
  dev: {
    mockAll: false,
    verbose: false,
    debugMode: false,
    skipWasmLoad: false
  }
};

/**
 * Load configuration from environment variables
 */
function loadFromEnvironment() {
  const envConfig = { ...defaultConfig };
  
  // Blockchain
  if (import.meta.env.VITE_BLOCKCHAIN_RPC) {
    envConfig.blockchain.rpcUrl = import.meta.env.VITE_BLOCKCHAIN_RPC;
  }
  if (import.meta.env.VITE_CONTRACT_ADDRESS) {
    envConfig.blockchain.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  }
  if (import.meta.env.VITE_CHAIN_ID) {
    envConfig.blockchain.chainId = parseInt(import.meta.env.VITE_CHAIN_ID);
  }
  if (import.meta.env.VITE_ENABLE_BLOCKCHAIN !== undefined) {
    envConfig.blockchain.enabled = import.meta.env.VITE_ENABLE_BLOCKCHAIN !== 'false';
  }
  
  // Quantum
  if (import.meta.env.VITE_QUANTUM_API) {
    envConfig.quantum.apiUrl = import.meta.env.VITE_QUANTUM_API;
  }
  if (import.meta.env.VITE_QUANTUM_MOCK !== undefined) {
    envConfig.quantum.useMock = import.meta.env.VITE_QUANTUM_MOCK === 'true';
  }
  if (import.meta.env.VITE_ENABLE_QUANTUM !== undefined) {
    envConfig.quantum.enabled = import.meta.env.VITE_ENABLE_QUANTUM !== 'false';
  }
  
  // Bio Sensor
  if (import.meta.env.VITE_BIOSENSOR_API) {
    envConfig.bioSensor.apiUrl = import.meta.env.VITE_BIOSENSOR_API;
  }
  if (import.meta.env.VITE_BIOSENSOR_MOCK !== undefined) {
    envConfig.bioSensor.useMock = import.meta.env.VITE_BIOSENSOR_MOCK === 'true';
  }
  if (import.meta.env.VITE_ENABLE_BIOSENSOR !== undefined) {
    envConfig.bioSensor.enabled = import.meta.env.VITE_ENABLE_BIOSENSOR !== 'false';
  }
  if (import.meta.env.VITE_BIOSENSOR_API_KEY) {
    envConfig.bioSensor.apiKey = import.meta.env.VITE_BIOSENSOR_API_KEY;
  }
  
  // Development
  if (import.meta.env.VITE_MOCK_ALL !== undefined) {
    envConfig.dev.mockAll = import.meta.env.VITE_MOCK_ALL === 'true';
  }
  if (import.meta.env.VITE_VERBOSE !== undefined) {
    envConfig.dev.verbose = import.meta.env.VITE_VERBOSE === 'true';
  }
  if (import.meta.env.VITE_DEBUG !== undefined) {
    envConfig.dev.debugMode = import.meta.env.VITE_DEBUG === 'true';
  }
  
  // Apply mock all override
  if (envConfig.dev.mockAll) {
    envConfig.quantum.useMock = true;
    envConfig.bioSensor.useMock = true;
  }
  
  return envConfig;
}

/**
 * Active configuration
 */
export const config = loadFromEnvironment();

/**
 * Get service status summary
 */
export function getServiceStatus() {
  return {
    blockchain: config.blockchain.enabled,
    quantum: config.quantum.enabled,
    bioSensor: config.bioSensor.enabled,
    mockMode: config.dev.mockAll,
    quantumMock: config.quantum.useMock,
    bioSensorMock: config.bioSensor.useMock
  };
}

/**
 * Update configuration at runtime
 * @param {Object} updates - Configuration updates
 * @returns {boolean} Success status
 */
export function updateConfig(updates) {
  try {
    Object.keys(updates).forEach(key => {
      if (config[key]) {
        config[key] = { ...config[key], ...updates[key] };
      }
    });
    
    // Validate updated configuration
    const validation = validateConfig(config);
    if (!validation.valid) {
      console.warn('Configuration validation warnings:', validation.warnings);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update configuration:', error);
    return false;
  }
}

/**
 * Enable a service
 * @param {string} service - Service name (blockchain, quantum, bioSensor)
 */
export function enableService(service) {
  if (config[service]) {
    config[service].enabled = true;
    console.log(`Service ${service} enabled`);
  }
}

/**
 * Disable a service
 * @param {string} service - Service name (blockchain, quantum, bioSensor)
 */
export function disableService(service) {
  if (config[service]) {
    config[service].enabled = false;
    console.log(`Service ${service} disabled`);
  }
}

/**
 * Toggle mock mode for a service
 * @param {string} service - Service name (quantum, bioSensor)
 * @param {boolean} useMock - Use mock mode
 */
export function setMockMode(service, useMock) {
  if (config[service] && 'useMock' in config[service]) {
    config[service].useMock = useMock;
    console.log(`Service ${service} mock mode: ${useMock ? 'ON' : 'OFF'}`);
  }
}

/**
 * Toggle mock all mode
 * @param {boolean} mockAll - Mock all services
 */
export function setMockAll(mockAll) {
  config.dev.mockAll = mockAll;
  config.quantum.useMock = mockAll;
  config.bioSensor.useMock = mockAll;
  console.log(`Mock all mode: ${mockAll ? 'ON' : 'OFF'}`);
}

/**
 * Validate configuration
 * @param {Object} cfg - Configuration to validate
 * @returns {Object} Validation result
 */
export function validateConfig(cfg) {
  const warnings = [];
  
  // Check blockchain configuration
  if (cfg.blockchain.enabled && !cfg.blockchain.contractAddress) {
    warnings.push('Blockchain enabled but no contract address specified');
  }
  
  // Check quantum configuration
  if (cfg.quantum.enabled && !cfg.quantum.apiUrl) {
    warnings.push('Quantum service enabled but no API URL specified');
  }
  
  // Check bio sensor configuration
  if (cfg.bioSensor.enabled && !cfg.bioSensor.apiUrl) {
    warnings.push('Bio sensor enabled but no API URL specified');
  }
  
  // Check WASM paths
  const wasmPaths = ['rustPath', 'fortranPath', 'goPath', 'pascalPath'];
  wasmPaths.forEach(path => {
    if (!cfg.wasm[path]) {
      warnings.push(`WASM path ${path} not specified`);
    }
  });
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Export configuration as JSON
 * @returns {string} JSON configuration
 */
export function exportConfig() {
  return JSON.stringify(config, null, 2);
}

/**
 * Import configuration from JSON
 * @param {string} jsonConfig - JSON configuration string
 * @returns {boolean} Success status
 */
export function importConfig(jsonConfig) {
  try {
    const imported = JSON.parse(jsonConfig);
    
    // Validate imported configuration
    const validation = validateConfig(imported);
    if (!validation.valid) {
      console.warn('Imported configuration has warnings:', validation.warnings);
    }
    
    // Merge with current configuration
    Object.keys(imported).forEach(key => {
      if (config[key]) {
        config[key] = { ...config[key], ...imported[key] };
      }
    });
    
    console.log('Configuration imported successfully');
    return true;
    
  } catch (error) {
    console.error('Failed to import configuration:', error);
    return false;
  }
}

/**
 * Reset configuration to defaults
 */
export function resetConfig() {
  Object.keys(defaultConfig).forEach(key => {
    config[key] = { ...defaultConfig[key] };
  });
  console.log('Configuration reset to defaults');
}

/**
 * Get configuration value by path
 * @param {string} path - Dot-separated path (e.g., 'blockchain.rpcUrl')
 * @returns {any} Configuration value
 */
export function getConfigValue(path) {
  const parts = path.split('.');
  let value = config;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Set configuration value by path
 * @param {string} path - Dot-separated path (e.g., 'blockchain.rpcUrl')
 * @param {any} value - Value to set
 * @returns {boolean} Success status
 */
export function setConfigValue(path, value) {
  try {
    const parts = path.split('.');
    const lastPart = parts.pop();
    let target = config;
    
    for (const part of parts) {
      if (target && typeof target === 'object' && part in target) {
        target = target[part];
      } else {
        return false;
      }
    }
    
    if (target && typeof target === 'object' && lastPart) {
      target[lastPart] = value;
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Failed to set configuration value:', error);
    return false;
  }
}

/**
 * Print configuration summary
 */
export function printConfigSummary() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║              Configuration Summary                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Services:');
  console.log(`  Blockchain:  ${config.blockchain.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  Quantum:     ${config.quantum.enabled ? 'Enabled' : 'Disabled'} ${config.quantum.useMock ? '(mock)' : ''}`);
  console.log(`  Bio Sensor:  ${config.bioSensor.enabled ? 'Enabled' : 'Disabled'} ${config.bioSensor.useMock ? '(mock)' : ''}`);
  console.log('');
  console.log('WASM Modules:');
  console.log(`  Rust:        ${config.wasm.enabled.rust ? 'Enabled' : 'Disabled'}`);
  console.log(`  Fortran:     ${config.wasm.enabled.fortran ? 'Enabled' : 'Disabled'}`);
  console.log(`  Go:          ${config.wasm.enabled.go ? 'Enabled' : 'Disabled'}`);
  console.log(`  Pascal:      ${config.wasm.enabled.pascal ? 'Enabled' : 'Disabled'}`);
  console.log('');
  console.log('Development:');
  console.log(`  Mock All:    ${config.dev.mockAll ? 'ON' : 'OFF'}`);
  console.log(`  Verbose:     ${config.dev.verbose ? 'ON' : 'OFF'}`);
  console.log(`  Debug:       ${config.dev.debugMode ? 'ON' : 'OFF'}`);
  console.log('');
}

export default config;
