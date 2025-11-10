/**
 * Performance Dashboard UI Component
 * 
 * Displays real-time performance metrics in the terminal
 */

import { performanceMonitor } from './performance-monitor.js';

export class PerformanceDashboard {
  constructor(terminalElement) {
    this.terminal = terminalElement;
    this.updateInterval = null;
    this.refreshRate = 1000; // Update every second
  }

  /**
   * Start displaying performance metrics
   */
  start() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      this.render();
    }, this.refreshRate);

    // Initial render
    this.render();
  }

  /**
   * Stop displaying performance metrics
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Render performance metrics to terminal
   */
  render() {
    const summary = performanceMonitor.getSummary();
    const health = performanceMonitor.checkHealth();

    let output = '\n';
    output += '═══════════════════════════════════════════════════════════\n';
    output += '              PERFORMANCE METRICS                          \n';
    output += '═══════════════════════════════════════════════════════════\n\n';

    // Overall health
    const healthIcon = health.overall === 'healthy' ? '✓' : '⚠';
    const healthColor = health.overall === 'healthy' ? '\x1b[32m' : '\x1b[33m';
    output += `${healthColor}${healthIcon} System Health: ${health.overall.toUpperCase()}\x1b[0m\n\n`;

    // Ourocode metrics
    output += '┌─ OUROCODE COMPILATION ─────────────────────────────────┐\n';
    output += `│ Average Time:     ${this.padRight(summary.ourocode.avgCompileTime, 30)} │\n`;
    output += `│ Total Compilations: ${this.padRight(summary.ourocode.totalCompilations.toString(), 28)} │\n`;
    output += '└────────────────────────────────────────────────────────┘\n\n';

    // Blockchain metrics
    output += '┌─ BLOCKCHAIN TRANSACTIONS ──────────────────────────────┐\n';
    output += `│ Average Latency:  ${this.padRight(summary.blockchain.avgLatency, 30)} │\n`;
    output += `│ Total Transactions: ${this.padRight(summary.blockchain.totalTransactions.toString(), 28)} │\n`;
    output += `│ Failed:           ${this.padRight(summary.blockchain.failedTransactions.toString(), 30)} │\n`;
    output += '└────────────────────────────────────────────────────────┘\n\n';

    // Quantum metrics
    output += '┌─ QUANTUM ENTROPY ──────────────────────────────────────┐\n';
    output += `│ Average Response: ${this.padRight(summary.quantum.avgResponseTime, 30)} │\n`;
    output += `│ Total Requests:   ${this.padRight(summary.quantum.totalRequests.toString(), 30)} │\n`;
    output += `│ Cache Hit Rate:   ${this.padRight(summary.quantum.cacheHitRate, 30)} │\n`;
    output += '└────────────────────────────────────────────────────────┘\n\n';

    // Bio sensor metrics
    output += '┌─ BIO SENSORS ──────────────────────────────────────────┐\n';
    output += `│ Average Latency:  ${this.padRight(summary.biosensor.avgLatency, 30)} │\n`;
    output += `│ Total Polls:      ${this.padRight(summary.biosensor.totalPolls.toString(), 30)} │\n`;
    output += `│ Failed Polls:     ${this.padRight(summary.biosensor.failedPolls.toString(), 30)} │\n`;
    output += '└────────────────────────────────────────────────────────┘\n\n';

    // Visualization metrics
    const fpsColor = parseFloat(summary.visualization.currentFPS) >= 30 ? '\x1b[32m' : '\x1b[33m';
    output += '┌─ VISUALIZATION ────────────────────────────────────────┐\n';
    output += `│ Current FPS:      ${fpsColor}${this.padRight(summary.visualization.currentFPS, 30)}\x1b[0m │\n`;
    output += `│ Average FPS:      ${this.padRight(summary.visualization.avgFPS, 30)} │\n`;
    output += `│ Dropped Frames:   ${this.padRight(summary.visualization.droppedFrames.toString(), 30)} │\n`;
    output += '└────────────────────────────────────────────────────────┘\n\n';

    // Issues
    if (health.issues.length > 0) {
      output += '┌─ PERFORMANCE ISSUES ───────────────────────────────────┐\n';
      health.issues.forEach(issue => {
        const icon = issue.severity === 'warning' ? '⚠' : '✗';
        output += `│ ${icon} ${this.truncate(issue.message, 53)} │\n`;
      });
      output += '└────────────────────────────────────────────────────────┘\n\n';
    }

    output += 'Type "perf-reset" to reset metrics\n';
    output += 'Type "perf-export" to export metrics to file\n';

    // Update terminal (if terminal has a method to display)
    if (this.terminal && typeof this.terminal.write === 'function') {
      this.terminal.write(output);
    } else {
      console.log(output);
    }
  }

  /**
   * Pad string to right
   * @param {string} str - String to pad
   * @param {number} length - Target length
   * @returns {string} Padded string
   */
  padRight(str, length) {
    const s = String(str);
    return s + ' '.repeat(Math.max(0, length - s.length));
  }

  /**
   * Truncate string
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated string
   */
  truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get compact summary for terminal status line
   * @returns {string} Compact summary
   */
  getCompactSummary() {
    const summary = performanceMonitor.getSummary();
    return `FPS: ${summary.visualization.currentFPS} | ` +
           `Compile: ${summary.ourocode.avgCompileTime} | ` +
           `Blockchain: ${summary.blockchain.avgLatency}`;
  }

  /**
   * Set refresh rate
   * @param {number} ms - Refresh rate in milliseconds
   */
  setRefreshRate(ms) {
    this.refreshRate = ms;
    if (this.updateInterval) {
      this.stop();
      this.start();
    }
  }
}

/**
 * Create performance command handlers for terminal
 * @returns {Object} Command handlers
 */
export function createPerformanceCommands() {
  return {
    'perf-show': () => {
      const dashboard = new PerformanceDashboard();
      dashboard.render();
      return 'Performance metrics displayed';
    },

    'perf-summary': () => {
      const summary = performanceMonitor.getSummary();
      return JSON.stringify(summary, null, 2);
    },

    'perf-reset': () => {
      performanceMonitor.reset();
      return 'Performance metrics reset';
    },

    'perf-export': () => {
      const data = performanceMonitor.exportMetrics();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return 'Performance metrics exported';
    },

    'perf-health': () => {
      const health = performanceMonitor.checkHealth();
      let output = `System Health: ${health.overall}\n\n`;
      if (health.issues.length > 0) {
        output += 'Issues:\n';
        health.issues.forEach(issue => {
          output += `  [${issue.severity}] ${issue.category}: ${issue.message}\n`;
        });
      } else {
        output += 'No performance issues detected';
      }
      return output;
    },

    'perf-enable': () => {
      performanceMonitor.setEnabled(true);
      return 'Performance monitoring enabled';
    },

    'perf-disable': () => {
      performanceMonitor.setEnabled(false);
      return 'Performance monitoring disabled';
    }
  };
}
