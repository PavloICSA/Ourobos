/**
 * ChimeraVisualizer - Enhanced visualization for OuroborOS-Chimera
 * 
 * Provides comprehensive visualization of:
 * - Blockchain timeline with generation history
 * - Quantum entropy status and pool level
 * - Bio sensor readings in real-time
 * - Neural cluster topology as fractals
 * 
 * Requirements: 8.5, 9.1, 9.2, 9.3, 9.4, 3.1, 3.2, 3.3, 4.2, 4.3, 4.4, 7.2, 7.3
 */

export class ChimeraVisualizer {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
    
    // Set canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Layout configuration
    this.layout = {
      fractal: { x: 0, y: 0, width: width * 0.6, height: height * 0.6 },
      blockchain: { x: width * 0.6, y: 0, width: width * 0.4, height: height * 0.3 },
      quantum: { x: width * 0.6, y: height * 0.3, width: width * 0.4, height: height * 0.3 },
      sensors: { x: 0, y: height * 0.6, width: width * 0.6, height: height * 0.4 },
      clusters: { x: width * 0.6, y: height * 0.6, width: width * 0.4, height: height * 0.4 }
    };
    
    // State
    this.state = null;
    this.blockchainHistory = [];
    this.quantumStatus = null;
    this.sensorReadings = null;
    this.clusterDecisions = new Map();
    
    // Fractal parameters
    this.fractalParams = {
      centerX: -0.5,
      centerY: 0,
      zoom: 1.5,
      maxIterations: 100
    };
    
    // Animation
    this.animationFrame = null;
    this.lastRenderTime = 0;
  }

  /**
   * Update visualization with new state
   * @param {Object} state - Chimera organism state
   */
  updateState(state) {
    this.state = state;
    
    // Update fractal parameters based on state
    if (state.population) {
      this.fractalParams.zoom = 1.5 + (state.population / 200);
    }
    if (state.mutationRate) {
      this.fractalParams.maxIterations = Math.floor(50 + state.mutationRate * 500);
    }
  }
  
  /**
   * Add blockchain generation to history
   * @param {Object} generation - Generation data
   */
  addBlockchainGeneration(generation) {
    this.blockchainHistory.push({
      generation: generation.generation,
      hash: generation.hash,
      blockNumber: generation.blockNumber,
      timestamp: generation.timestamp || Date.now(),
      verified: generation.verified || false
    });
    
    // Keep only last 10 generations
    if (this.blockchainHistory.length > 10) {
      this.blockchainHistory.shift();
    }
  }
  
  /**
   * Update quantum entropy status
   * @param {Object} status - Quantum status
   */
  updateQuantumStatus(status) {
    this.quantumStatus = {
      backend: status.backend || 'unknown',
      poolLevel: status.poolLevel || 0,
      entropyUsed: status.entropyUsed || 0,
      lastGenerated: status.lastGenerated || null,
      healthy: status.healthy !== false
    };
  }
  
  /**
   * Update bio sensor readings
   * @param {Object} readings - Sensor readings
   */
  updateSensorReadings(readings) {
    this.sensorReadings = {
      light: readings.light ?? 0.5,
      temperature: readings.temperature ?? 0.5,
      acceleration: readings.acceleration ?? 0.5,
      timestamp: readings.timestamp || Date.now(),
      mode: readings.mode || 'mock',
      healthy: readings.healthy !== false
    };
  }
  
  /**
   * Update neural cluster decisions
   * @param {string} clusterId - Cluster ID
   * @param {Object} decision - Decision object
   */
  updateClusterDecision(clusterId, decision) {
    this.clusterDecisions.set(clusterId, {
      action: decision.action,
      confidence: decision.confidence,
      timestamp: decision.timestamp || Date.now()
    });
  }

  /**
   * Render all visualization panels
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Render each panel
    this.renderFractal();
    this.renderBlockchainTimeline();
    this.renderQuantumStatus();
    this.renderSensorReadings();
    this.renderClusterStatus();
    
    // Draw panel borders
    this.drawPanelBorders();
  }
  
  /**
   * Draw borders around panels
   * @private
   */
  drawPanelBorders() {
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1;
    
    for (const panel of Object.values(this.layout)) {
      this.ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
    }
  }
  
  /**
   * Render Mandelbrot fractal with neural topology
   * Requirements: 7.2, 7.3, 9.1, 9.2, 9.3, 9.4
   */
  renderFractal() {
    const panel = this.layout.fractal;
    const imageData = this.ctx.createImageData(panel.width, panel.height);
    
    for (let px = 0; px < panel.width; px++) {
      for (let py = 0; py < panel.height; py++) {
        // Map pixel to complex plane
        const x0 = this.fractalParams.centerX + (px / panel.width - 0.5) / this.fractalParams.zoom;
        const y0 = this.fractalParams.centerY + (py / panel.height - 0.5) / this.fractalParams.zoom;
        
        // Mandelbrot iteration
        let x = 0, y = 0;
        let iteration = 0;
        
        while (x*x + y*y <= 4 && iteration < this.fractalParams.maxIterations) {
          const xtemp = x*x - y*y + x0;
          y = 2*x*y + y0;
          x = xtemp;
          iteration++;
        }
        
        // Color based on iteration count and cluster activity
        const idx = (py * panel.width + px) * 4;
        
        if (iteration === this.fractalParams.maxIterations) {
          // Inside set - color by cluster activity
          const clusterActivity = this.getClusterActivityAt(px / panel.width, py / panel.height);
          imageData.data[idx] = 0;
          imageData.data[idx + 1] = Math.floor(clusterActivity * 255);
          imageData.data[idx + 2] = 0;
        } else {
          // Outside set - gradient
          const ratio = iteration / this.fractalParams.maxIterations;
          imageData.data[idx] = 0;
          imageData.data[idx + 1] = Math.floor(ratio * 255);
          imageData.data[idx + 2] = Math.floor((1 - ratio) * 128);
        }
        imageData.data[idx + 3] = 255; // Alpha
      }
    }
    
    this.ctx.putImageData(imageData, panel.x, panel.y);
    
    // Draw label
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('NEURAL TOPOLOGY', panel.x + 5, panel.y + 15);
  }
  
  /**
   * Get cluster activity level at normalized coordinates
   * @private
   */
  getClusterActivityAt(nx, ny) {
    if (this.clusterDecisions.size === 0) return 0.5;
    
    let totalConfidence = 0;
    for (const decision of this.clusterDecisions.values()) {
      totalConfidence += decision.confidence || 0.5;
    }
    
    return totalConfidence / this.clusterDecisions.size;
  }

  /**
   * Render blockchain timeline
   * Requirements: 8.5, 9.1, 9.2, 9.3, 9.4
   */
  renderBlockchainTimeline() {
    const panel = this.layout.blockchain;
    
    // Background
    this.ctx.fillStyle = '#001100';
    this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    
    // Title
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('BLOCKCHAIN TIMELINE', panel.x + 5, panel.y + 15);
    
    // Current generation
    if (this.state) {
      this.ctx.font = '11px monospace';
      this.ctx.fillText(`Generation: ${this.state.blockchainGeneration || 0}`, 
        panel.x + 5, panel.y + 35);
      
      // Last genome hash
      if (this.state.lastGenomeHash) {
        const shortHash = this.state.lastGenomeHash.substring(0, 16) + '...';
        this.ctx.fillText(`Hash: ${shortHash}`, panel.x + 5, panel.y + 50);
      }
      
      // Pending proposal
      if (this.state.pendingProposalId) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText(`Proposal #${this.state.pendingProposalId} VOTING`, 
          panel.x + 5, panel.y + 65);
      }
    }
    
    // History timeline
    if (this.blockchainHistory.length > 0) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = '10px monospace';
      
      const startY = panel.y + 85;
      const lineHeight = 15;
      
      this.ctx.fillText('Recent Generations:', panel.x + 5, startY);
      
      // Show last 5 generations
      const recent = this.blockchainHistory.slice(-5);
      recent.forEach((gen, idx) => {
        const y = startY + (idx + 1) * lineHeight;
        const shortHash = gen.hash.substring(0, 12) + '...';
        const verified = gen.verified ? '✓' : '?';
        
        this.ctx.fillStyle = gen.verified ? '#00ff00' : '#888888';
        this.ctx.fillText(`${verified} Gen ${gen.generation}: ${shortHash}`, 
          panel.x + 5, y);
      });
    }
    
    // Transaction confirmations indicator
    if (this.state && this.state.lastBlockNumber) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(`Block: #${this.state.lastBlockNumber}`, 
        panel.x + 5, panel.y + panel.height - 10);
    }
  }

  /**
   * Render quantum entropy status
   * Requirements: 3.1, 3.2, 3.3
   */
  renderQuantumStatus() {
    const panel = this.layout.quantum;
    
    // Background
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    
    // Title
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('QUANTUM ENTROPY', panel.x + 5, panel.y + 15);
    
    if (this.quantumStatus) {
      this.ctx.font = '11px monospace';
      
      // Backend status
      const backendColor = this.quantumStatus.backend === 'hardware' ? '#00ff00' : 
                          this.quantumStatus.backend === 'simulator' ? '#ffff00' : '#ff8800';
      this.ctx.fillStyle = backendColor;
      this.ctx.fillText(`Backend: ${this.quantumStatus.backend.toUpperCase()}`, 
        panel.x + 5, panel.y + 35);
      
      // Health indicator
      const healthStatus = this.quantumStatus.healthy ? 'ONLINE' : 'OFFLINE';
      const healthColor = this.quantumStatus.healthy ? '#00ff00' : '#ff0000';
      this.ctx.fillStyle = healthColor;
      this.ctx.fillText(`Status: ${healthStatus}`, panel.x + 5, panel.y + 50);
      
      // Entropy pool level
      this.ctx.fillStyle = '#00ffff';
      this.ctx.fillText('Entropy Pool:', panel.x + 5, panel.y + 70);
      
      // Draw pool level bar
      const barX = panel.x + 10;
      const barY = panel.y + 75;
      const barWidth = panel.width - 20;
      const barHeight = 20;
      
      // Background bar
      this.ctx.fillStyle = '#003333';
      this.ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Fill level
      const fillWidth = barWidth * (this.quantumStatus.poolLevel / 10);
      this.ctx.fillStyle = '#00ffff';
      this.ctx.fillRect(barX, barY, fillWidth, barHeight);
      
      // Border
      this.ctx.strokeStyle = '#00ffff';
      this.ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // Level text
      this.ctx.fillStyle = '#00ffff';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(`${this.quantumStatus.poolLevel}/10`, 
        barX + barWidth / 2 - 15, barY + 14);
      
      // Entropy usage
      if (this.quantumStatus.entropyUsed > 0) {
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`Used: ${this.quantumStatus.entropyUsed} bits`, 
          panel.x + 5, panel.y + 110);
      }
      
      // Last generated timestamp
      if (this.quantumStatus.lastGenerated) {
        const elapsed = Math.floor((Date.now() - this.quantumStatus.lastGenerated) / 1000);
        this.ctx.fillText(`Last: ${elapsed}s ago`, panel.x + 5, panel.y + 125);
      }
    } else {
      // No quantum status available
      this.ctx.fillStyle = '#888888';
      this.ctx.font = '11px monospace';
      this.ctx.fillText('No quantum data', panel.x + 5, panel.y + 35);
    }
  }

  /**
   * Render bio sensor readings
   * Requirements: 4.2, 4.3, 4.4
   */
  renderSensorReadings() {
    const panel = this.layout.sensors;
    
    // Background
    this.ctx.fillStyle = '#001100';
    this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    
    // Title
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('BIO SENSORS', panel.x + 5, panel.y + 15);
    
    if (this.sensorReadings) {
      // Mode indicator
      const modeColor = this.sensorReadings.mode === 'real' ? '#00ff00' : '#ff8800';
      this.ctx.fillStyle = modeColor;
      this.ctx.font = '11px monospace';
      this.ctx.fillText(`Mode: ${this.sensorReadings.mode.toUpperCase()}`, 
        panel.x + 5, panel.y + 35);
      
      // Health status
      const healthStatus = this.sensorReadings.healthy ? 'ONLINE' : 'OFFLINE';
      const healthColor = this.sensorReadings.healthy ? '#00ff00' : '#ff0000';
      this.ctx.fillStyle = healthColor;
      this.ctx.fillText(`Status: ${healthStatus}`, panel.x + 5, panel.y + 50);
      
      // Sensor readings with bars
      const sensors = [
        { name: 'Light', value: this.sensorReadings.light, color: '#ffff00' },
        { name: 'Temperature', value: this.sensorReadings.temperature, color: '#ff8800' },
        { name: 'Acceleration', value: this.sensorReadings.acceleration, color: '#00ffff' }
      ];
      
      const barStartY = panel.y + 70;
      const barSpacing = 35;
      const barWidth = panel.width - 120;
      const barHeight = 20;
      
      sensors.forEach((sensor, idx) => {
        const y = barStartY + idx * barSpacing;
        
        // Label
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '11px monospace';
        this.ctx.fillText(sensor.name + ':', panel.x + 5, y + 15);
        
        // Bar background
        const barX = panel.x + 110;
        this.ctx.fillStyle = '#003300';
        this.ctx.fillRect(barX, y, barWidth, barHeight);
        
        // Bar fill
        const fillWidth = barWidth * sensor.value;
        this.ctx.fillStyle = sensor.color;
        this.ctx.fillRect(barX, y, fillWidth, barHeight);
        
        // Border
        this.ctx.strokeStyle = sensor.color;
        this.ctx.strokeRect(barX, y, barWidth, barHeight);
        
        // Value text
        this.ctx.fillStyle = sensor.color;
        this.ctx.font = '10px monospace';
        const valueText = (sensor.value * 100).toFixed(0) + '%';
        this.ctx.fillText(valueText, barX + barWidth + 5, y + 14);
      });
      
      // Timestamp
      if (this.sensorReadings.timestamp) {
        const elapsed = Math.floor((Date.now() - this.sensorReadings.timestamp) / 1000);
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`Updated: ${elapsed}s ago`, 
          panel.x + 5, panel.y + panel.height - 10);
      }
      
      // Influence indicator
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = '10px monospace';
      const avgInfluence = (this.sensorReadings.light + 
                           this.sensorReadings.temperature + 
                           this.sensorReadings.acceleration) / 3;
      this.ctx.fillText(`Avg Influence: ${(avgInfluence * 100).toFixed(1)}%`, 
        panel.x + 5, panel.y + panel.height - 25);
    } else {
      // No sensor data
      this.ctx.fillStyle = '#888888';
      this.ctx.font = '11px monospace';
      this.ctx.fillText('No sensor data', panel.x + 5, panel.y + 35);
    }
  }

  /**
   * Render neural cluster status
   * Requirements: 7.2, 7.3
   */
  renderClusterStatus() {
    const panel = this.layout.clusters;
    
    // Background
    this.ctx.fillStyle = '#110011';
    this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    
    // Title
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('NEURAL CLUSTERS', panel.x + 5, panel.y + 15);
    
    if (this.clusterDecisions.size > 0) {
      this.ctx.font = '11px monospace';
      
      // Active clusters count
      this.ctx.fillStyle = '#ff00ff';
      this.ctx.fillText(`Active: ${this.clusterDecisions.size}`, 
        panel.x + 5, panel.y + 35);
      
      // List cluster decisions
      let y = panel.y + 55;
      const lineHeight = 30;
      
      for (const [clusterId, decision] of this.clusterDecisions.entries()) {
        // Cluster ID
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillText(`Cluster: ${clusterId}`, panel.x + 5, y);
        
        // Action
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`Action: ${decision.action}`, panel.x + 10, y + 15);
        
        // Confidence bar
        const barX = panel.x + 10;
        const barY = y + 18;
        const barWidth = panel.width - 20;
        const barHeight = 8;
        
        // Background
        this.ctx.fillStyle = '#330033';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Fill
        const fillWidth = barWidth * decision.confidence;
        const confidenceColor = decision.confidence > 0.7 ? '#00ff00' : 
                               decision.confidence > 0.4 ? '#ffff00' : '#ff8800';
        this.ctx.fillStyle = confidenceColor;
        this.ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Confidence value
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillText(`${(decision.confidence * 100).toFixed(0)}%`, 
          barX + barWidth + 5, barY + 7);
        
        y += lineHeight;
        this.ctx.font = '11px monospace';
        
        // Stop if we run out of space
        if (y > panel.y + panel.height - 20) break;
      }
    } else {
      // No cluster data
      this.ctx.fillStyle = '#888888';
      this.ctx.font = '11px monospace';
      this.ctx.fillText('No cluster data', panel.x + 5, panel.y + 35);
    }
  }
  
  /**
   * Start animation loop
   */
  startAnimation() {
    const animate = (timestamp) => {
      // Throttle to ~30 FPS
      if (timestamp - this.lastRenderTime >= 33) {
        this.render();
        this.lastRenderTime = timestamp;
      }
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  /**
   * Stop animation loop
   */
  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Update fractal zoom (for interactive controls)
   * @param {number} delta - Zoom delta
   */
  zoom(delta) {
    this.fractalParams.zoom *= (1 + delta);
    this.fractalParams.zoom = Math.max(0.1, Math.min(10, this.fractalParams.zoom));
  }
  
  /**
   * Pan fractal view
   * @param {number} dx - X delta
   * @param {number} dy - Y delta
   */
  pan(dx, dy) {
    this.fractalParams.centerX += dx / this.fractalParams.zoom;
    this.fractalParams.centerY += dy / this.fractalParams.zoom;
  }
  
  /**
   * Reset fractal view
   */
  resetView() {
    this.fractalParams.centerX = -0.5;
    this.fractalParams.centerY = 0;
    this.fractalParams.zoom = 1.5;
  }
  
  /**
   * Clear all data
   */
  clear() {
    this.state = null;
    this.blockchainHistory = [];
    this.quantumStatus = null;
    this.sensorReadings = null;
    this.clusterDecisions.clear();
    
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
