/**
 * Environment Configuration for OuroborOS-Chimera
 * 
 * Manages environment-specific settings for development, staging, and production
 */

// Detect environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const mode = import.meta.env.MODE || 'development';

/**
 * Base configuration shared across all environments
 */
const baseConfig = {
  app: {
    name: 'OuroborOS-Chimera',
    version: '1.0.0',
    description: 'A polyglot digital organism with blockchain governance'
  },
  
  performance: {
    enableMonitoring: true,
    enableLogging: true,
    logLevel: 'info' // debug, info, warn, error
  },
  
  features: {
    enableBlockchain: true,
    enableQuantum: true,
    enableBioSensor: true,
    enableGoNeuralClusters: true,
    enableVisualization: true
  },
  
  wasm: {
    enableRust: true,
    enableFortran: true,
    enableGo: true,
    enablePascal: true
  }
};

/**
 * Development environment configuration
 */
const developmentConfig = {
  ...baseConfig,
  
  blockchain: {
    rpcUrl: 'http://localhost:8545',
    chainId: 1337,
    contractAddress: '', // Set after deployment
    useMock: false,
    enableLogging: true
  },
  
  quantum: {
    apiUrl: 'http://localhost:5000',
    useMock: false, // Use real service for demo
    enableCache: true,
    cacheSize: 10,
    timeout: 5000
  },
  
  biosensor: {
    apiUrl: 'http://localhost:5001',
    useMock: false, // Use real service for demo
    pollInterval: 1000,
    timeout: 2000
  },
  
  services: {
    enableHealthCheck: true,
    healthCheckInterval: 10000,
    autoReconnect: true,
    reconnectDelay: 5000
  },
  
  performance: {
    ...baseConfig.performance,
    enableMonitoring: true,
    enableLogging: true,
    logLevel: 'debug'
  },
  
  visualization: {
    targetFPS: 60,
    enableDebugOverlay: true,
    enablePerformanceStats: true
  }
};

/**
 * Production environment configuration
 */
const productionConfig = {
  ...baseConfig,
  
  blockchain: {
    rpcUrl: import.meta.env.VITE_BLOCKCHAIN_RPC || 'http://localhost:8545',
    chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '1337'),
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '',
    useMock: import.meta.env.VITE_BLOCKCHAIN_MOCK === 'true',
    enableLogging: false
  },
  
  quantum: {
    apiUrl: import.meta.env.VITE_QUANTUM_API || 'https://quantum-api.example.com',
    useMock: import.meta.env.VITE_QUANTUM_MOCK === 'true',
    enableCache: true,
    cacheSize: 20,
    timeout: 10000
  },
  
  biosensor: {
    apiUrl: import.meta.env.VITE_BIOSENSOR_API || 'https://biosensor-api.example.com',
    useMock: import.meta.env.VITE_BIOSENSOR_MOCK === 'true',
    pollInterval: 2000,
    timeout: 5000
  },
  
  services: {
    enableHealthCheck: true,
    healthCheckInterval: 30000,
    autoReconnect: true,
    reconnectDelay: 10000
  },
  
  performance: {
    ...baseConfig.performance,
    enableMonitoring: true,
    enableLogging: false,
    logLevel: 'error'
  },
  
  visualization: {
    targetFPS: 30,
    enableDebugOverlay: false,
    enablePerformanceStats: false
  }
};

/**
 * Staging environment configuration
 */
const stagingConfig = {
  ...productionConfig,
  
  performance: {
    ...productionConfig.performance,
    enableLogging: true,
    logLevel: 'info'
  },
  
  visualization: {
    ...productionConfig.visualization,
    enableDebugOverlay: true,
    enablePerformanceStats: true
  }
};

/**
 * Get configuration for current environment
 */
function getConfig() {
  switch (mode) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

// Export current configuration
export const config = getConfig();

// Export environment flags
export const env = {
  isDevelopment,
  isProduction,
  mode
};

/**
 * Update configuration at runtime
 * @param {Object} updates - Configuration updates
 */
export function updateConfig(updates) {
  Object.assign(config, updates);
}

/**
 * Get configuration value by path
 * @param {string} path - Dot-separated path (e.g., 'blockchain.rpcUrl')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Configuration value
 */
export function getConfigValue(path, defaultValue = undefined) {
  const keys = path.split('.');
  let value = config;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Validate configuration
 * @returns {Object} Validation result
 */
export function validateConfig() {
  const errors = [];
  const warnings = [];

  // Check blockchain configuration
  if (config.features.enableBlockchain && !config.blockchain.useMock) {
    if (!config.blockchain.rpcUrl) {
      errors.push('Blockchain RPC URL is required when blockchain is enabled');
    }
    if (!config.blockchain.contractAddress && isProduction) {
      warnings.push('Contract address not set in production');
    }
  }

  // Check quantum configuration
  if (config.features.enableQuantum && !config.quantum.useMock) {
    if (!config.quantum.apiUrl) {
      errors.push('Quantum API URL is required when quantum is enabled');
    }
  }

  // Check bio sensor configuration
  if (config.features.enableBioSensor && !config.biosensor.useMock) {
    if (!config.biosensor.apiUrl) {
      errors.push('Bio sensor API URL is required when bio sensor is enabled');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Log configuration (safe for production - no sensitive data)
 */
export function logConfig() {
  console.log('OuroborOS-Chimera Configuration:');
  console.log('  Environment:', mode);
  console.log('  Features:');
  console.log('    Blockchain:', config.features.enableBlockchain ? 'enabled' : 'disabled');
  console.log('    Quantum:', config.features.enableQuantum ? 'enabled' : 'disabled');
  console.log('    Bio Sensor:', config.features.enableBioSensor ? 'enabled' : 'disabled');
  console.log('    Neural Clusters:', config.features.enableGoNeuralClusters ? 'enabled' : 'disabled');
  console.log('  Mock Mode:');
  console.log('    Blockchain:', config.blockchain.useMock ? 'yes' : 'no');
  console.log('    Quantum:', config.quantum.useMock ? 'yes' : 'no');
  console.log('    Bio Sensor:', config.biosensor.useMock ? 'yes' : 'no');
  
  const validation = validateConfig();
  if (validation.warnings.length > 0) {
    console.warn('Configuration warnings:', validation.warnings);
  }
  if (!validation.valid) {
    console.error('Configuration errors:', validation.errors);
  }
}

// Auto-validate on load in development
if (isDevelopment) {
  const validation = validateConfig();
  if (!validation.valid) {
    console.error('Configuration validation failed:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('Configuration warnings:', validation.warnings);
  }
}
