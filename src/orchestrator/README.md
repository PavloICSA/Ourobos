# JavaScript Orchestrator

The orchestrator is the central coordination layer for OuroborOS-Chimera, managing communication between all components including WASM modules, the Lisp interpreter, ALGOL compiler, blockchain bridge, quantum client, biosensor client, and other subsystems.

## Architecture

The orchestrator implements a message bus pattern with the following components:

- **Orchestrator**: Core message routing and module management
- **WasmBridge**: Memory management and function call utilities for WASM modules
- **CircuitBreaker**: Fault tolerance and automatic recovery
- **MessageQueue**: Priority-based async message processing
- **MessageHandlers**: Protocol handlers for different message types

## Features

### Module Management

- Load and initialize WASM modules (Rust, Fortran, etc.)
- Track module statistics (call counts, errors, uptime)
- Automatic error tracking and recovery

### Message Routing

- Type-based message dispatch
- Event subscription system
- Priority-based message queue
- Message validation and error responses

### Fault Tolerance

- Circuit breaker pattern prevents cascading failures
- Automatic module recovery after timeout
- Graceful degradation when modules fail
- Configurable failure thresholds

### WASM Interop

- Memory allocation and deallocation
- Typed array marshaling
- Generic function call wrappers
- String handling utilities

## Usage

### Basic Setup

```javascript
import { Orchestrator } from './orchestrator/index.js';
import { setupMessageHandlers } from './orchestrator/message-handlers.js';

// Create orchestrator
const orchestrator = new Orchestrator({
  timeout: 100,                      // Default execution timeout (ms)
  circuitBreakerThreshold: 3,        // Failures before opening circuit
  circuitBreakerTimeout: 30000,      // Time before recovery attempt (ms)
  circuitBreakerResetTimeout: 60000  // Time to reset failure count (ms)
});

// Setup message handlers
const messageQueue = setupMessageHandlers(orchestrator, {
  compiler: algolCompiler,
  interpreter: lispInterpreter,
  organism: organismState
});
```

### Loading WASM Modules

```javascript
// Load Rust module (wasm-pack)
await orchestrator.loadModule('rust', '/wasm/rust/rust_wasm.js');

// Load Fortran module (Emscripten)
await orchestrator.loadModule('fortran', '/wasm/fortran/fortran_engine.js');

// Get loaded module
const rustModule = orchestrator.getModule('rust');
```

### Sending Messages

```javascript
// Compile ALGOL to Lisp
const compileResult = await orchestrator.send('compiler', {
  type: 'compile',
  payload: {
    source: 'IF x > 10 THEN y := 5',
    language: 'algol'
  }
});

// Evaluate Lisp code
const evalResult = await orchestrator.send('interpreter', {
  type: 'eval',
  payload: {
    code: '(+ 1 2 3)',
    context: { x: 10 }
  }
});

// Call WASM function
const computeResult = await orchestrator.send('rust', {
  type: 'compute',
  payload: {
    module: 'rust',
    function: 'step',
    args: [1.0, 2.0]
  }
});
```

### Event Subscription

```javascript
// Subscribe to specific message type
const unsubscribe = orchestrator.subscribe('eval', (message) => {
  console.log('Eval message received:', message);
});

// Unsubscribe when done
unsubscribe();
```

### Using WASM Bridge

```javascript
import { WasmBridge } from './orchestrator/wasm-bridge.js';

// Create bridge for a module
const module = orchestrator.getModule('fortran');
const bridge = new WasmBridge(module);

// Allocate and call with typed arrays
const input = new Float64Array([1.0, 2.0, 3.0]);
const result = bridge.callWithArrays('integrate', [input], {
  length: 3,
  type: 'f64'
});

console.log('Result:', result);

// Manual memory management
const ptr = bridge.allocate(input);
const output = bridge.readBuffer(ptr, 3, 'f64');
bridge.free(ptr);
```

### Circuit Breaker

```javascript
// Check if module is available
if (orchestrator.getCircuitBreaker().isAvailable('rust')) {
  // Safe to call
  await orchestrator.send('rust', message);
}

// Get circuit breaker stats
const stats = orchestrator.getCircuitBreaker().getStats('rust');
console.log('Circuit state:', stats.state);
console.log('Failures:', stats.failures);

// Manually reset circuit breaker
orchestrator.getCircuitBreaker().reset('rust');
```

### Execution Timeout

```javascript
// Execute with custom timeout
const result = await orchestrator.executeWithTimeout(
  () => expensiveOperation(),
  5000  // 5 second timeout
);
```

### Statistics

```javascript
// Get orchestrator statistics
const stats = orchestrator.getStats();
console.log('Modules loaded:', stats.moduleCount);
console.log('Handlers registered:', stats.handlerCount);
console.log('Module stats:', stats.modules);
console.log('Circuit breaker stats:', stats.circuitBreaker);
```

## Message Protocol

### Message Structure

All messages must follow this structure:

```javascript
{
  type: 'string',        // Message type (required)
  payload: {},           // Message data (required)
  timestamp: 1234567890  // Unix timestamp (auto-added if missing)
}
```

### Message Types

#### compile

Compile ALGOL code to Lisp.

```javascript
{
  type: 'compile',
  payload: {
    source: 'IF x > 10 THEN y := 5',
    language: 'algol'
  }
}
```

#### eval

Evaluate Lisp code.

```javascript
{
  type: 'eval',
  payload: {
    code: '(+ 1 2 3)',
    context: { x: 10 }  // Optional variable bindings
  }
}
```

#### compute

Call a WASM function.

```javascript
{
  type: 'compute',
  payload: {
    module: 'rust',
    function: 'step',
    args: [1.0, 2.0]
  }
}
```

#### mutate

Mutate organism state.

```javascript
{
  type: 'mutate',
  payload: {
    ruleId: 'rule-123',
    mutationType: 'parameter'  // 'parameter' | 'structure' | 'delete' | 'duplicate'
  }
}
```

### Response Format

Success response:

```javascript
{
  type: 'compile:success',
  payload: { /* result data */ },
  success: true,
  timestamp: 1234567890
}
```

Error response:

```javascript
{
  type: 'compile:error',
  payload: {
    errors: ['Error message 1', 'Error message 2']
  },
  success: false,
  timestamp: 1234567890
}
```

## Error Handling

The orchestrator implements multiple layers of error handling:

1. **Message Validation**: Invalid messages are rejected with clear error messages
2. **Circuit Breaker**: Failing modules are automatically disabled after threshold
3. **Timeout Enforcement**: Long-running operations are terminated
4. **Error Tracking**: All errors are logged with timestamps

Example error handling:

```javascript
try {
  const result = await orchestrator.send('rust', message);
} catch (error) {
  if (error.message.includes('Circuit breaker OPEN')) {
    console.log('Module temporarily unavailable, using fallback');
    // Use fallback implementation
  } else if (error.message.includes('timeout')) {
    console.log('Operation timed out');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Performance Considerations

- **Message Queue**: Messages are processed asynchronously with priority scheduling
- **Memory Management**: WASM bridge tracks allocations for automatic cleanup
- **Circuit Breaker**: Prevents wasted calls to failing modules
- **Timeout Enforcement**: Prevents infinite loops and hangs

## Testing

See `example.js` for a complete working example demonstrating all features.

## Requirements Satisfied

This implementation satisfies the following requirements:

- **2.1**: Load and initialize WASM modules (Rust, Fortran)
- **2.2**: Message-passing interface between JavaScript and WASM
- **2.3**: Typed array parameter handling
- **2.4**: Shared memory buffer management
- **2.5**: Error handling without crashes
- **11.4**: Circuit breaker for fault tolerance
