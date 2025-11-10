/**
 * Performance Monitoring System for OuroborOS-Chimera
 * 
 * Tracks performance metrics across all system components:
 * - Ourocode compilation time
 * - Blockchain transaction latency
 * - Quantum API response time
 * - Bio sensor polling latency
 * - Visualization frame rate
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      ourocode: {
        compilations: [],
        avgCompileTime: 0,
        maxCompileTime: 0,
        minCompileTime: Infinity
      },
      blockchain: {
        transactions: [],
        avgLatency: 0,
        maxLatency: 0,
        minLatency: Infinity,
        failedTransactions: 0
      },
      quantum: {
        requests: [],
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        cacheHits: 0,
        cacheMisses: 0
      },
      biosensor: {
        polls: [],
        avgLatency: 0,
        maxLatency: 0,
        minLatency: Infinity,
        failedPolls: 0
      },
      visualization: {
        frames: [],
        currentFPS: 0,
        avgFPS: 0,
        minFPS: Infinity,
        maxFPS: 0,
        droppedFrames: 0
      },
      system: {
        memoryUsage: [],
        cpuUsage: []
      }
    };

    this.timers = new Map();
    this.enabled = true;
    this.maxHistorySize = 100; // Keep last 100 measurements
    
    // FPS tracking
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.fpsInterval = null;
  }

  /**
   * Enable or disable monitoring
   * @param {boolean} enabled - Whether monitoring is enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && this.fpsInterval) {
      clearInterval(this.fpsInterval);
      this.fpsInterval = null;
    }
  }

  /**
   * Start timing an operation
   * @param {string} category - Category (ourocode, blockchain, quantum, biosensor)
   * @param {string} operationId - Unique operation identifier
   */
  startTimer(category, operationId) {
    if (!this.enabled) return;
    
    const timerId = `${category}:${operationId}`;
    this.timers.set(timerId, {
      startTime: performance.now(),
      category,
      operationId
    });
  }

  /**
   * End timing an operation and record metric
   * @param {string} category - Category
   * @param {string} operationId - Unique operation identifier
   * @param {Object} metadata - Additional metadata
   * @returns {number} Duration in milliseconds
   */
  endTimer(category, operationId, metadata = {}) {
    if (!this.enabled) return 0;

    const timerId = `${category}:${operationId}`;
    const timer = this.timers.get(timerId);
    
    if (!timer) {
      console.warn(`Timer not found: ${timerId}`);
      return 0;
    }

    const duration = performance.now() - timer.startTime;
    this.timers.delete(timerId);

    // Record metric
    this.recordMetric(category, duration, metadata);

    return duration;
  }

  /**
   * Record a metric
   * @param {string} category - Category
   * @param {number} value - Metric value
   * @param {Object} metadata - Additional metadata
   */
  recordMetric(category, value, metadata = {}) {
    if (!this.enabled) return;

    const metric = this.metrics[category];
    if (!metric) {
      console.warn(`Unknown metric category: ${category}`);
      return;
    }

    // Add to history
    const record = {
      value,
      timestamp: Date.now(),
      ...metadata
    };

    // Determine which array to use based on category
    let historyArray;
    switch (category) {
      case 'ourocode':
        historyArray = metric.compilations;
        break;
      case 'blockchain':
        historyArray = metric.transactions;
        break;
      case 'quantum':
        historyArray = metric.requests;
        break;
      case 'biosensor':
        historyArray = metric.polls;
        break;
      case 'visualization':
        historyArray = metric.frames;
        break;
      default:
        return;
    }

    historyArray.push(record);

    // Limit history size
    if (historyArray.length > this.maxHistorySize) {
      historyArray.shift();
    }

    // Update statistics
    this.updateStatistics(category);
  }

  /**
   * Update statistics for a category
   * @param {string} category - Category
   */
  updateStatistics(category) {
    const metric = this.metrics[category];
    let historyArray;

    switch (category) {
      case 'ourocode':
        historyArray = metric.compilations;
        break;
      case 'blockchain':
        historyArray = metric.transactions;
        break;
      case 'quantum':
        historyArray = metric.requests;
        break;
      case 'biosensor':
        historyArray = metric.polls;
        break;
      case 'visualization':
        historyArray = metric.frames;
        break;
      default:
        return;
    }

    if (historyArray.length === 0) return;

    const values = historyArray.map(r => r.value);
    const sum = values.reduce((a, b) => a + b, 0);
    
    // Update avg, min, max based on category
    if (category === 'ourocode') {
      metric.avgCompileTime = sum / values.length;
      metric.maxCompileTime = Math.max(...values);
      metric.minCompileTime = Math.min(...values);
    } else if (category === 'blockchain') {
      metric.avgLatency = sum / values.length;
      metric.maxLatency = Math.max(...values);
      metric.minLatency = Math.min(...values);
    } else if (category === 'quantum') {
      metric.avgResponseTime = sum / values.length;
      metric.maxResponseTime = Math.max(...values);
      metric.minResponseTime = Math.min(...values);
    } else if (category === 'biosensor') {
      metric.avgLatency = sum / values.length;
      metric.maxLatency = Math.max(...values);
      metric.minLatency = Math.min(...values);
    } else if (category === 'visualization') {
      metric.avgFPS = sum / values.length;
      metric.maxFPS = Math.max(...values);
      metric.minFPS = Math.min(...values);
    }
  }

  /**
   * Track Ourocode compilation
   * @param {string} language - Source language
   * @param {number} duration - Compilation time in ms
   * @param {boolean} success - Whether compilation succeeded
   */
  trackOurocodeCompilation(language, duration, success = true) {
    this.recordMetric('ourocode', duration, { language, success });
  }

  /**
   * Track blockchain transaction
   * @param {string} type - Transaction type (propose, vote, execute)
   * @param {number} duration - Transaction time in ms
   * @param {boolean} success - Whether transaction succeeded
   */
  trackBlockchainTransaction(type, duration, success = true) {
    this.recordMetric('blockchain', duration, { type, success });
    if (!success) {
      this.metrics.blockchain.failedTransactions++;
    }
  }

  /**
   * Track quantum API request
   * @param {number} duration - Response time in ms
   * @param {boolean} fromCache - Whether result was from cache
   * @param {boolean} success - Whether request succeeded
   */
  trackQuantumRequest(duration, fromCache = false, success = true) {
    this.recordMetric('quantum', duration, { fromCache, success });
    if (fromCache) {
      this.metrics.quantum.cacheHits++;
    } else {
      this.metrics.quantum.cacheMisses++;
    }
  }

  /**
   * Track bio sensor poll
   * @param {number} duration - Poll time in ms
   * @param {boolean} success - Whether poll succeeded
   */
  trackBioSensorPoll(duration, success = true) {
    this.recordMetric('biosensor', duration, { success });
    if (!success) {
      this.metrics.biosensor.failedPolls++;
    }
  }

  /**
   * Start FPS monitoring
   */
  startFPSMonitoring() {
    if (this.fpsInterval) return;

    this.frameCount = 0;
    this.lastFrameTime = performance.now();

    // Calculate FPS every second
    this.fpsInterval = setInterval(() => {
      const currentTime = performance.now();
      const elapsed = (currentTime - this.lastFrameTime) / 1000;
      const fps = this.frameCount / elapsed;

      this.metrics.visualization.currentFPS = fps;
      this.recordMetric('visualization', fps);

      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }, 1000);
  }

  /**
   * Stop FPS monitoring
   */
  stopFPSMonitoring() {
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval);
      this.fpsInterval = null;
    }
  }

  /**
   * Record a frame render
   */
  recordFrame() {
    if (!this.enabled) return;
    this.frameCount++;
  }

  /**
   * Record a dropped frame
   */
  recordDroppedFrame() {
    if (!this.enabled) return;
    this.metrics.visualization.droppedFrames++;
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage() {
    if (!this.enabled) return;
    
    if (performance.memory) {
      const usage = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };

      this.metrics.system.memoryUsage.push(usage);

      // Limit history
      if (this.metrics.system.memoryUsage.length > this.maxHistorySize) {
        this.metrics.system.memoryUsage.shift();
      }
    }
  }

  /**
   * Get all metrics
   * @returns {Object} All metrics
   */
  getMetrics() {
    return JSON.parse(JSON.stringify(this.metrics));
  }

  /**
   * Get metrics for a specific category
   * @param {string} category - Category name
   * @returns {Object} Category metrics
   */
  getCategoryMetrics(category) {
    return JSON.parse(JSON.stringify(this.metrics[category] || {}));
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    return {
      ourocode: {
        avgCompileTime: this.metrics.ourocode.avgCompileTime.toFixed(2) + 'ms',
        totalCompilations: this.metrics.ourocode.compilations.length
      },
      blockchain: {
        avgLatency: this.metrics.blockchain.avgLatency.toFixed(2) + 'ms',
        totalTransactions: this.metrics.blockchain.transactions.length,
        failedTransactions: this.metrics.blockchain.failedTransactions
      },
      quantum: {
        avgResponseTime: this.metrics.quantum.avgResponseTime.toFixed(2) + 'ms',
        totalRequests: this.metrics.quantum.requests.length,
        cacheHitRate: this.getQuantumCacheHitRate().toFixed(1) + '%'
      },
      biosensor: {
        avgLatency: this.metrics.biosensor.avgLatency.toFixed(2) + 'ms',
        totalPolls: this.metrics.biosensor.polls.length,
        failedPolls: this.metrics.biosensor.failedPolls
      },
      visualization: {
        currentFPS: this.metrics.visualization.currentFPS.toFixed(1),
        avgFPS: this.metrics.visualization.avgFPS.toFixed(1),
        droppedFrames: this.metrics.visualization.droppedFrames
      }
    };
  }

  /**
   * Get quantum cache hit rate
   * @returns {number} Cache hit rate percentage
   */
  getQuantumCacheHitRate() {
    const total = this.metrics.quantum.cacheHits + this.metrics.quantum.cacheMisses;
    if (total === 0) return 0;
    return (this.metrics.quantum.cacheHits / total) * 100;
  }

  /**
   * Check if performance is within acceptable thresholds
   * @returns {Object} Health check results
   */
  checkHealth() {
    const health = {
      overall: 'healthy',
      issues: []
    };

    // Check Ourocode compilation time (target: <10ms)
    if (this.metrics.ourocode.avgCompileTime > 10) {
      health.issues.push({
        category: 'ourocode',
        severity: 'warning',
        message: `Average compilation time ${this.metrics.ourocode.avgCompileTime.toFixed(2)}ms exceeds 10ms target`
      });
    }

    // Check blockchain latency (target: <500ms on local)
    if (this.metrics.blockchain.avgLatency > 500) {
      health.issues.push({
        category: 'blockchain',
        severity: 'warning',
        message: `Average blockchain latency ${this.metrics.blockchain.avgLatency.toFixed(2)}ms exceeds 500ms target`
      });
    }

    // Check quantum response time (target: <2s uncached, <10ms cached)
    if (this.metrics.quantum.avgResponseTime > 2000) {
      health.issues.push({
        category: 'quantum',
        severity: 'warning',
        message: `Average quantum response time ${this.metrics.quantum.avgResponseTime.toFixed(2)}ms exceeds 2000ms target`
      });
    }

    // Check bio sensor latency (target: <100ms)
    if (this.metrics.biosensor.avgLatency > 100) {
      health.issues.push({
        category: 'biosensor',
        severity: 'warning',
        message: `Average bio sensor latency ${this.metrics.biosensor.avgLatency.toFixed(2)}ms exceeds 100ms target`
      });
    }

    // Check FPS (target: 30fps)
    if (this.metrics.visualization.currentFPS < 30 && this.metrics.visualization.frames.length > 10) {
      health.issues.push({
        category: 'visualization',
        severity: 'warning',
        message: `Current FPS ${this.metrics.visualization.currentFPS.toFixed(1)} below 30fps target`
      });
    }

    if (health.issues.length > 0) {
      health.overall = 'degraded';
    }

    return health;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      ourocode: {
        compilations: [],
        avgCompileTime: 0,
        maxCompileTime: 0,
        minCompileTime: Infinity
      },
      blockchain: {
        transactions: [],
        avgLatency: 0,
        maxLatency: 0,
        minLatency: Infinity,
        failedTransactions: 0
      },
      quantum: {
        requests: [],
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        cacheHits: 0,
        cacheMisses: 0
      },
      biosensor: {
        polls: [],
        avgLatency: 0,
        maxLatency: 0,
        minLatency: Infinity,
        failedPolls: 0
      },
      visualization: {
        frames: [],
        currentFPS: 0,
        avgFPS: 0,
        minFPS: Infinity,
        maxFPS: 0,
        droppedFrames: 0
      },
      system: {
        memoryUsage: [],
        cpuUsage: []
      }
    };
    this.timers.clear();
  }

  /**
   * Export metrics to JSON
   * @returns {string} JSON string of metrics
   */
  exportMetrics() {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getSummary(),
      health: this.checkHealth(),
      timestamp: Date.now()
    }, null, 2);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export class for testing
export { PerformanceMonitor };
