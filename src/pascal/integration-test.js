// Pascal Terminal Integration Tests
// Tests Pascal WASM bridge and orchestrator integration

import { PascalBridge } from './pascal-bridge.js';

/**
 * Test Suite: Pascal Bridge Basic Functionality
 */
export async function testPascalBridgeBasics() {
  console.log('Testing Pascal Bridge Basics...');
  
  const tests = [];
  
  // Test 1: Bridge instantiation
  tests.push({
    name: 'Bridge instantiation',
    test: () => {
      const bridge = new PascalBridge();
      return bridge !== null && bridge !== undefined;
    }
  });
  
  // Test 2: String encoding/decoding
  tests.push({
    name: 'String encoding/decoding',
    test: () => {
      const bridge = new PascalBridge();
      const testString = 'Hello, Pascal!';
      const encoded = bridge.textEncoder.encode(testString);
      const decoded = bridge.textDecoder.decode(encoded);
      return decoded === testString;
    }
  });
  
  // Test 3: Terminal connection
  tests.push({
    name: 'Terminal connection',
    test: () => {
      const bridge = new PascalBridge();
      const mockTerminal = { writeLine: () => {} };
      bridge.setTerminal(mockTerminal);
      return bridge.terminal === mockTerminal;
    }
  });
  
  // Test 4: Orchestrator connection
  tests.push({
    name: 'Orchestrator connection',
    test: () => {
      const bridge = new PascalBridge();
      const mockOrchestrator = {};
      bridge.setOrchestrator(mockOrchestrator);
      return bridge.orchestrator === mockOrchestrator;
    }
  });
  
  // Run tests
  return runTests(tests);
}

/**
 * Test Suite: Mock Orchestrator Integration
 */
export async function testMockOrchestratorIntegration() {
  console.log('Testing Mock Orchestrator Integration...');
  
  const tests = [];
  
  // Create mock orchestrator
  const mockOrchestrator = {
    proposeMutationCalled: false,
    voteCalled: false,
    getGenomeHistoryCalled: false,
    
    async proposeMutation(code, language) {
      this.proposeMutationCalled = true;
      return 42;
    },
    
    async vote(proposalId, support) {
      this.voteCalled = true;
    },
    
    async getGenomeHistory(generation) {
      this.getGenomeHistoryCalled = true;
      return {
        hash: '0x1234',
        blockNumber: 100,
        timestamp: Date.now() / 1000
      };
    },
    
    async getQuantumEntropy() {
      return { entropy: '0xabcd', backend: 'mock' };
    },
    
    async getBioSensorReadings() {
      return {
        light: 0.5,
        temperature: 0.6,
        acceleration: 0.3,
        timestamp: Date.now() / 1000
      };
    },
    
    async getStatus() {
      return {
        population: 100,
        energy: 50,
        generation: 5
      };
    }
  };
  
  // Create bridge with mock terminal
  const mockTerminal = {
    lines: [],
    writeLine(text, style) {
      this.lines.push({ text, style });
    }
  };
  
  const bridge = new PascalBridge(mockOrchestrator);
  bridge.setTerminal(mockTerminal);
  
  // Test 1: Propose mutation
  tests.push({
    name: 'Propose mutation handler',
    test: async () => {
      await bridge.handleSubmitProposal('test code', 'algol');
      return mockOrchestrator.proposeMutationCalled;
    }
  });
  
  // Test 2: Vote handler
  tests.push({
    name: 'Vote handler',
    test: async () => {
      await bridge.handleVote(1, true);
      return mockOrchestrator.voteCalled;
    }
  });
  
  // Test 3: Query blockchain handler
  tests.push({
    name: 'Query blockchain handler',
    test: async () => {
      await bridge.handleQueryBlockchain(5);
      return mockOrchestrator.getGenomeHistoryCalled;
    }
  });
  
  // Test 4: Quantum entropy handler
  tests.push({
    name: 'Quantum entropy handler',
    test: async () => {
      await bridge.handleGetQuantumEntropy();
      return mockTerminal.lines.some(line => 
        line.text.includes('Quantum Entropy')
      );
    }
  });
  
  // Test 5: Bio sensor handler
  tests.push({
    name: 'Bio sensor handler',
    test: async () => {
      await bridge.handleGetBioSensors();
      return mockTerminal.lines.some(line => 
        line.text.includes('Bio Sensor Readings')
      );
    }
  });
  
  // Test 6: Status handler
  tests.push({
    name: 'Status handler',
    test: async () => {
      await bridge.handleGetStatus();
      return mockTerminal.lines.some(line => 
        line.text.includes('Organism Status')
      );
    }
  });
  
  // Run tests
  return runTests(tests);
}

/**
 * Test Suite: Error Handling
 */
export async function testErrorHandling() {
  console.log('Testing Error Handling...');
  
  const tests = [];
  
  // Create bridge without orchestrator
  const mockTerminal = {
    lines: [],
    writeLine(text, style) {
      this.lines.push({ text, style });
    }
  };
  
  const bridge = new PascalBridge();
  bridge.setTerminal(mockTerminal);
  
  // Test 1: Handle missing orchestrator
  tests.push({
    name: 'Missing orchestrator error',
    test: async () => {
      await bridge.handleSubmitProposal('test', 'algol');
      return mockTerminal.lines.some(line => 
        line.text.includes('Orchestrator not initialized') &&
        line.style === 'error'
      );
    }
  });
  
  // Test 2: Handle orchestrator errors
  tests.push({
    name: 'Orchestrator error handling',
    test: async () => {
      const errorOrchestrator = {
        async proposeMutation() {
          throw new Error('Test error');
        }
      };
      
      bridge.setOrchestrator(errorOrchestrator);
      mockTerminal.lines = [];
      
      await bridge.handleSubmitProposal('test', 'algol');
      return mockTerminal.lines.some(line => 
        line.text.includes('Failed to submit proposal') &&
        line.style === 'error'
      );
    }
  });
  
  // Run tests
  return runTests(tests);
}

/**
 * Test Suite: Display Functions
 */
export async function testDisplayFunctions() {
  console.log('Testing Display Functions...');
  
  const tests = [];
  
  const mockTerminal = {
    lines: [],
    writeLine(text, style) {
      this.lines.push({ text, style });
    }
  };
  
  const bridge = new PascalBridge();
  bridge.setTerminal(mockTerminal);
  
  // Test 1: Display text
  tests.push({
    name: 'Display text',
    test: () => {
      bridge.displayText('Test message');
      return mockTerminal.lines[mockTerminal.lines.length - 1].text === 'Test message';
    }
  });
  
  // Test 2: Display error
  tests.push({
    name: 'Display error',
    test: () => {
      bridge.displayText('Error message', 'error');
      const lastLine = mockTerminal.lines[mockTerminal.lines.length - 1];
      return lastLine.text === 'Error message' && lastLine.style === 'error';
    }
  });
  
  // Test 3: Display success
  tests.push({
    name: 'Display success',
    test: () => {
      bridge.displayText('Success message', 'success');
      const lastLine = mockTerminal.lines[mockTerminal.lines.length - 1];
      return lastLine.text === 'Success message' && lastLine.style === 'success';
    }
  });
  
  // Test 4: Display info
  tests.push({
    name: 'Display info',
    test: () => {
      bridge.displayText('Info message', 'info');
      const lastLine = mockTerminal.lines[mockTerminal.lines.length - 1];
      return lastLine.text === 'Info message' && lastLine.style === 'info';
    }
  });
  
  // Run tests
  return runTests(tests);
}

/**
 * Helper: Run test suite
 */
async function runTests(tests) {
  const results = {
    total: tests.length,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        results.passed++;
        console.log(`✓ ${test.name}`);
      } else {
        results.failed++;
        results.errors.push({ name: test.name, error: 'Test returned false' });
        console.log(`✗ ${test.name}: Test returned false`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ name: test.name, error: error.message });
      console.log(`✗ ${test.name}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('=== Pascal Bridge Integration Tests ===\n');
  
  const results = {
    basics: await testPascalBridgeBasics(),
    mockOrchestrator: await testMockOrchestratorIntegration(),
    errorHandling: await testErrorHandling(),
    display: await testDisplayFunctions()
  };
  
  console.log('\n=== Test Summary ===');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const [suite, result] of Object.entries(results)) {
    console.log(`\n${suite}:`);
    console.log(`  Passed: ${result.passed}/${result.total}`);
    console.log(`  Failed: ${result.failed}/${result.total}`);
    
    if (result.errors.length > 0) {
      console.log('  Errors:');
      result.errors.forEach(err => {
        console.log(`    - ${err.name}: ${err.error}`);
      });
    }
    
    totalPassed += result.passed;
    totalFailed += result.failed;
  }
  
  console.log(`\n=== Overall ===`);
  console.log(`Total Passed: ${totalPassed}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  return results;
}

// Export test runner
export default {
  testPascalBridgeBasics,
  testMockOrchestratorIntegration,
  testErrorHandling,
  testDisplayFunctions,
  runAllTests
};
