/**
 * OuroborOS-Chimera Bio Sensor Client
 * JavaScript client for accessing Raspberry Pi sensor data
 */

/**
 * Sensor readings interface
 * @typedef {Object} SensorReadings
 * @property {number|null} light - Light level (0-1 normalized)
 * @property {number|null} temperature - Temperature (0-1 normalized)
 * @property {number|null} acceleration - Acceleration magnitude (0-1 normalized)
 * @property {number} timestamp - Unix timestamp of reading
 */

/**
 * Bio Sensor Client
 * Connects to Raspberry Pi sensor API with automatic fallback to mock mode
 */
export class BioSensorClient {
  /**
   * Create a new bio sensor client
   * @param {string} apiUrl - Base URL of sensor API (default: http://raspberrypi.local:5001)
   * @param {boolean} useMock - Force mock mode (default: false)
   * @param {string|null} apiKey - Optional API key for authentication
   */
  constructor(apiUrl = 'http://raspberrypi.local:5001', useMock = false, apiKey = null) {
    this.apiUrl = apiUrl;
    this.useMock = useMock;
    this.apiKey = apiKey;
    this.lastReadings = null;
    this.mockTime = Date.now() / 1000;
    
    console.log(`BioSensorClient initialized (${useMock ? 'MOCK' : 'REAL'} mode)`);
  }
  
  /**
   * Get current sensor readings
   * Automatically falls back to mock mode if API unavailable
   * @returns {Promise<SensorReadings>}
   */
  async getReadings() {
    if (this.useMock) {
      return this.getMockReadings();
    }
    
    try {
      const response = await this.fetchWithTimeout(
        `${this.apiUrl}/api/sensors/readings`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        },
        5000 // 5 second timeout
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const readings = await response.json();
      this.lastReadings = readings;
      return readings;
    } catch (error) {
      console.warn('Bio sensor API unavailable, falling back to mock mode:', error.message);
      this.useMock = true;
      return this.getMockReadings();
    }
  }
  
  /**
   * Generate mock sensor readings with smooth simulated curves
   * Useful for testing and when hardware is unavailable
   * @returns {SensorReadings}
   */
  getMockReadings() {
    // Use smooth sine/cosine curves for realistic variation
    const time = Date.now() / 1000;
    
    // Light: varies slowly over ~100 seconds (simulates day/night cycle)
    const light = 0.5 + 0.3 * Math.sin(time / 10);
    
    // Temperature: varies slowly over ~150 seconds with offset
    const temperature = 0.6 + 0.2 * Math.cos(time / 15);
    
    // Acceleration: varies quickly over ~50 seconds (simulates movement)
    const acceleration = 0.3 + 0.1 * Math.sin(time / 5);
    
    return {
      light: Math.max(0, Math.min(1, light)),
      temperature: Math.max(0, Math.min(1, temperature)),
      acceleration: Math.max(0, Math.min(1, acceleration)),
      timestamp: time
    };
  }
  
  /**
   * Check sensor API health
   * @returns {Promise<boolean>} True if API is healthy
   */
  async healthCheck() {
    if (this.useMock) {
      return false; // Mock mode means real API is unavailable
    }
    
    try {
      const response = await this.fetchWithTimeout(
        `${this.apiUrl}/api/sensors/health`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        },
        3000 // 3 second timeout
      );
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.warn('Health check failed:', error.message);
      return false;
    }
  }
  
  /**
   * Get sensor health status details
   * @returns {Promise<Object|null>} Health status object or null if unavailable
   */
  async getHealthStatus() {
    if (this.useMock) {
      return {
        status: 'mock',
        sensors: {
          light: false,
          temperature: false,
          acceleration: false,
          i2c: false
        },
        timestamp: Date.now() / 1000
      };
    }
    
    try {
      const response = await this.fetchWithTimeout(
        `${this.apiUrl}/api/sensors/health`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        },
        3000
      );
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Get last cached readings (doesn't make new API call)
   * @returns {SensorReadings|null}
   */
  getLastReadings() {
    return this.lastReadings;
  }
  
  /**
   * Check if client is in mock mode
   * @returns {boolean}
   */
  isMockMode() {
    return this.useMock;
  }
  
  /**
   * Force switch to mock mode
   */
  enableMockMode() {
    this.useMock = true;
    console.log('Bio sensor client switched to MOCK mode');
  }
  
  /**
   * Try to switch back to real mode
   * Will automatically fall back to mock if API unavailable
   */
  enableRealMode() {
    this.useMock = false;
    console.log('Bio sensor client attempting REAL mode');
  }
  
  /**
   * Get request headers including optional API key
   * @private
   * @returns {Object}
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    
    return headers;
  }
  
  /**
   * Fetch with timeout
   * @private
   * @param {string} url
   * @param {Object} options
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Response>}
   */
  async fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}

export default BioSensorClient;
