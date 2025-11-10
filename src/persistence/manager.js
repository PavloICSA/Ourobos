/**
 * PersistenceManager - Enhanced persistence with blockchain proof
 * 
 * Manages saving, loading, and exporting ChimeraGenomeSnapshots with:
 * - Blockchain proof storage
 * - Quantum provenance tracking
 * - Bio sensor snapshots
 * - Ourocode module persistence
 * 
 * Requirements: 14.1, 14.2, 14.3
 */

import { ChimeraGenomeSnapshot } from '../chimera/data-models.js';

export class PersistenceManager {
  constructor() {
    this.storageKey = 'ouroboros-chimera-snapshots';
    this.currentSnapshotKey = 'ouroboros-chimera-current';
  }
  
  /**
   * Save a snapshot to localStorage
   * Includes blockchain proof, quantum provenance, sensor data, and Ourocode modules
   * 
   * @param {string} name - Snapshot name
   * @param {ChimeraGenomeSnapshot} snapshot - Snapshot to save
   * @returns {boolean} Success status
   */
  save(name, snapshot) {
    try {
      // Ensure snapshot has a name
      if (!snapshot.name || snapshot.name === 'Untitled Snapshot') {
        snapshot.name = name;
      }
      
      // Get existing snapshots
      const snapshots = this.listSnapshots();
      
      // Add or update snapshot
      snapshots[name] = {
        timestamp: snapshot.timestamp,
        generation: snapshot.metadata.generation,
        hasBlockchainProof: snapshot.hasBlockchainProof(),
        hasQuantumProvenance: snapshot.hasQuantumProvenance(),
        version: snapshot.version
      };
      
      // Save snapshot list
      localStorage.setItem(this.storageKey, JSON.stringify(snapshots));
      
      // Save full snapshot data
      const snapshotKey = this.getSnapshotKey(name);
      localStorage.setItem(snapshotKey, snapshot.exportToOBG());
      
      console.log(`Snapshot saved: ${name}`);
      console.log(`  Generation: ${snapshot.metadata.generation}`);
      console.log(`  Blockchain proof: ${snapshot.hasBlockchainProof() ? 'Yes' : 'No'}`);
      console.log(`  Quantum provenance: ${snapshot.hasQuantumProvenance() ? 'Yes' : 'No'}`);
      console.log(`  Ourocode modules: ${snapshot.ourocodeModules.length}`);
      
      return true;
    } catch (error) {
      console.error('Failed to save snapshot:', error);
      return false;
    }
  }
  
  /**
   * Load a snapshot from localStorage
   * 
   * @param {string} name - Snapshot name
   * @returns {ChimeraGenomeSnapshot|null} Loaded snapshot or null
   */
  load(name) {
    try {
      const snapshotKey = this.getSnapshotKey(name);
      const obgData = localStorage.getItem(snapshotKey);
      
      if (!obgData) {
        console.error(`Snapshot not found: ${name}`);
        return null;
      }
      
      const snapshot = ChimeraGenomeSnapshot.importFromOBG(obgData);
      
      console.log(`Snapshot loaded: ${name}`);
      console.log(`  Version: ${snapshot.version}`);
      console.log(`  Generation: ${snapshot.metadata.generation}`);
      console.log(`  Blockchain proof: ${snapshot.hasBlockchainProof() ? 'Yes' : 'No'}`);
      
      return snapshot;
    } catch (error) {
      console.error('Failed to load snapshot:', error);
      return null;
    }
  }
  
  /**
   * Export snapshot to .obg file (download)
   * 
   * @param {ChimeraGenomeSnapshot} snapshot - Snapshot to export
   * @param {string} filename - Optional filename (defaults to snapshot name)
   */
  export(snapshot, filename = null) {
    try {
      const obgData = snapshot.exportToOBG();
      const name = filename || `${snapshot.name.replace(/\s+/g, '_')}.obg`;
      
      // Create blob and download
      const blob = new Blob([obgData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      
      URL.revokeObjectURL(url);
      
      console.log(`Snapshot exported: ${name}`);
      console.log(`  Size: ${(obgData.length / 1024).toFixed(2)} KB`);
      
      return true;
    } catch (error) {
      console.error('Failed to export snapshot:', error);
      return false;
    }
  }
  
  /**
   * Import snapshot from .obg file
   * 
   * @param {string} obgData - OBG file content
   * @returns {ChimeraGenomeSnapshot|null} Imported snapshot or null
   */
  import(obgData) {
    try {
      const snapshot = ChimeraGenomeSnapshot.importFromOBG(obgData);
      
      console.log(`Snapshot imported: ${snapshot.name}`);
      console.log(`  Version: ${snapshot.version}`);
      console.log(`  Generation: ${snapshot.metadata.generation}`);
      
      // Check for version compatibility
      if (snapshot.version === '1.0') {
        console.warn('Imported v1.0 snapshot - some chimera features may be missing');
      }
      
      return snapshot;
    } catch (error) {
      console.error('Failed to import snapshot:', error);
      return null;
    }
  }
  
  /**
   * List all saved snapshots
   * 
   * @returns {Object} Map of snapshot names to metadata
   */
  listSnapshots() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to list snapshots:', error);
      return {};
    }
  }
  
  /**
   * Delete a snapshot
   * 
   * @param {string} name - Snapshot name
   * @returns {boolean} Success status
   */
  delete(name) {
    try {
      // Remove from list
      const snapshots = this.listSnapshots();
      delete snapshots[name];
      localStorage.setItem(this.storageKey, JSON.stringify(snapshots));
      
      // Remove snapshot data
      const snapshotKey = this.getSnapshotKey(name);
      localStorage.removeItem(snapshotKey);
      
      console.log(`Snapshot deleted: ${name}`);
      return true;
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
      return false;
    }
  }
  
  /**
   * Save current organism state as auto-save
   * 
   * @param {ChimeraGenomeSnapshot} snapshot - Current snapshot
   */
  autoSave(snapshot) {
    try {
      localStorage.setItem(this.currentSnapshotKey, snapshot.exportToOBG());
      console.log('Auto-save completed');
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    }
  }
  
  /**
   * Load auto-saved state
   * 
   * @returns {ChimeraGenomeSnapshot|null} Auto-saved snapshot or null
   */
  loadAutoSave() {
    try {
      const obgData = localStorage.getItem(this.currentSnapshotKey);
      if (!obgData) {
        return null;
      }
      
      const snapshot = ChimeraGenomeSnapshot.importFromOBG(obgData);
      console.log('Auto-save loaded');
      return snapshot;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }
  
  /**
   * Clear all snapshots (use with caution)
   */
  clearAll() {
    try {
      const snapshots = this.listSnapshots();
      
      // Remove all snapshot data
      Object.keys(snapshots).forEach(name => {
        const snapshotKey = this.getSnapshotKey(name);
        localStorage.removeItem(snapshotKey);
      });
      
      // Clear snapshot list
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.currentSnapshotKey);
      
      console.log('All snapshots cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear snapshots:', error);
      return false;
    }
  }
  
  /**
   * Get storage key for a snapshot
   * 
   * @param {string} name - Snapshot name
   * @returns {string} Storage key
   */
  getSnapshotKey(name) {
    return `${this.storageKey}-${name}`;
  }
  
  /**
   * Get storage usage statistics
   * 
   * @returns {Object} Storage stats
   */
  getStorageStats() {
    try {
      const snapshots = this.listSnapshots();
      const count = Object.keys(snapshots).length;
      
      let totalSize = 0;
      Object.keys(snapshots).forEach(name => {
        const snapshotKey = this.getSnapshotKey(name);
        const data = localStorage.getItem(snapshotKey);
        if (data) {
          totalSize += data.length;
        }
      });
      
      return {
        count,
        totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { count: 0, totalSize: 0 };
    }
  }
  
  /**
   * Verify blockchain proof for a snapshot
   * Queries blockchain to confirm genome hash matches on-chain record
   * 
   * Requirements: 14.3, 14.4, 14.5
   * 
   * @param {ChimeraGenomeSnapshot} snapshot - Snapshot to verify
   * @param {BlockchainBridge} blockchainBridge - Connected blockchain bridge
   * @returns {Promise<Object>} Verification result
   */
  async verifyBlockchainProof(snapshot, blockchainBridge) {
    try {
      // Check if snapshot has blockchain proof
      if (!snapshot.hasBlockchainProof()) {
        return {
          verified: false,
          status: 'no_proof',
          message: 'Snapshot does not contain blockchain proof'
        };
      }
      
      // Check if blockchain bridge is connected
      if (!blockchainBridge || !blockchainBridge.connected) {
        return {
          verified: false,
          status: 'not_connected',
          message: 'Blockchain not connected - cannot verify'
        };
      }
      
      const proof = snapshot.blockchainProof;
      
      // Query blockchain for genome history at the recorded generation
      let onChainRecord;
      try {
        // Try to get the generation from metadata
        const generation = snapshot.metadata.generation;
        onChainRecord = await blockchainBridge.getGenomeHistory(generation);
      } catch (error) {
        return {
          verified: false,
          status: 'not_found',
          message: `Genome record not found on blockchain for generation ${snapshot.metadata.generation}`,
          error: error.message
        };
      }
      
      // Compare hashes
      const hashMatch = onChainRecord.hash === proof.genomeHash;
      const blockMatch = onChainRecord.blockNumber === proof.blockNumber;
      
      if (hashMatch && blockMatch) {
        // Mark snapshot as verified
        snapshot.markProofVerified(true);
        
        return {
          verified: true,
          status: 'verified',
          message: 'Blockchain proof verified successfully',
          onChainRecord: {
            generation: onChainRecord.generation,
            hash: onChainRecord.hash,
            blockNumber: onChainRecord.blockNumber,
            timestamp: onChainRecord.timestamp
          }
        };
      } else {
        return {
          verified: false,
          status: 'mismatch',
          message: 'Blockchain proof does not match on-chain record',
          details: {
            hashMatch,
            blockMatch,
            snapshotHash: proof.genomeHash,
            onChainHash: onChainRecord.hash,
            snapshotBlock: proof.blockNumber,
            onChainBlock: onChainRecord.blockNumber
          }
        };
      }
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      return {
        verified: false,
        status: 'error',
        message: 'Verification error occurred',
        error: error.message
      };
    }
  }
  
  /**
   * Import and verify snapshot from .obg file
   * Automatically verifies blockchain proof if blockchain bridge is provided
   * 
   * @param {string} obgData - OBG file content
   * @param {BlockchainBridge} blockchainBridge - Optional blockchain bridge for verification
   * @returns {Promise<Object>} Import result with snapshot and verification status
   */
  async importAndVerify(obgData, blockchainBridge = null) {
    try {
      // Import snapshot
      const snapshot = this.import(obgData);
      
      if (!snapshot) {
        return {
          success: false,
          snapshot: null,
          verification: null,
          message: 'Failed to import snapshot'
        };
      }
      
      // Verify blockchain proof if bridge provided
      let verification = null;
      if (blockchainBridge && snapshot.hasBlockchainProof()) {
        verification = await this.verifyBlockchainProof(snapshot, blockchainBridge);
      }
      
      return {
        success: true,
        snapshot,
        verification,
        message: 'Snapshot imported successfully'
      };
    } catch (error) {
      console.error('Import and verify failed:', error);
      return {
        success: false,
        snapshot: null,
        verification: null,
        message: error.message
      };
    }
  }
  
  /**
   * Format verification result for terminal display
   * 
   * @param {Object} verificationResult - Result from verifyBlockchainProof
   * @returns {string} Formatted message
   */
  formatVerificationResult(verificationResult) {
    const lines = [];
    
    lines.push('=== Blockchain Verification ===');
    
    switch (verificationResult.status) {
      case 'verified':
        lines.push('Status: VERIFIED ✓');
        lines.push(`Generation: ${verificationResult.onChainRecord.generation}`);
        lines.push(`Hash: ${verificationResult.onChainRecord.hash.substring(0, 16)}...`);
        lines.push(`Block: #${verificationResult.onChainRecord.blockNumber}`);
        break;
        
      case 'no_proof':
        lines.push('Status: NO PROOF');
        lines.push('This snapshot does not contain blockchain proof');
        break;
        
      case 'not_connected':
        lines.push('Status: CANNOT VERIFY');
        lines.push('Blockchain not connected');
        break;
        
      case 'not_found':
        lines.push('Status: NOT FOUND ✗');
        lines.push('Genome record not found on blockchain');
        break;
        
      case 'mismatch':
        lines.push('Status: MISMATCH ✗');
        lines.push('Snapshot data does not match blockchain record');
        if (verificationResult.details) {
          lines.push(`Hash match: ${verificationResult.details.hashMatch ? 'Yes' : 'No'}`);
          lines.push(`Block match: ${verificationResult.details.blockMatch ? 'Yes' : 'No'}`);
        }
        break;
        
      case 'error':
        lines.push('Status: ERROR');
        lines.push(`Error: ${verificationResult.error}`);
        break;
        
      default:
        lines.push('Status: UNKNOWN');
    }
    
    lines.push('==============================');
    
    return lines.join('\n');
  }
}

export default PersistenceManager;
