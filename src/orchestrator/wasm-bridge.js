/**
 * WASM Bridge - Memory Management and Function Call Utilities
 * 
 * Provides utilities for managing memory allocation, typed array marshaling,
 * and generic function call wrappers for WebAssembly modules.
 */

export class WasmBridge {
  /**
   * Create a WASM bridge for a module
   * @param {Object} module - WASM module instance
   */
  constructor(module) {
    this.module = module;
    
    // Access to WASM memory
    this.memory = module.memory || null;
    
    // Track allocations for cleanup
    this.allocations = new Set();
    
    // Type mappings
    this.typeMap = {
      'i32': Int32Array,
      'f32': Float32Array,
      'f64': Float64Array,
      'u8': Uint8Array,
      'u16': Uint16Array,
      'u32': Uint32Array,
      'i8': Int8Array,
      'i16': Int16Array
    };
  }

  /**
   * Allocate memory in WASM and copy typed array data
   * @param {TypedArray} typedArray - Data to allocate
   * @returns {number} Pointer to allocated memory
   */
  allocate(typedArray) {
    if (!this.module.malloc) {
      throw new Error('Module does not export malloc function');
    }
    
    const bytes = typedArray.byteLength;
    const ptr = this.module.malloc(bytes);
    
    if (!ptr) {
      throw new Error('Memory allocation failed');
    }
    
    // Track allocation
    this.allocations.add(ptr);
    
    // Copy data to WASM memory
    const memoryView = this.getMemoryView(typedArray.constructor, ptr, typedArray.length);
    memoryView.set(typedArray);
    
    return ptr;
  }

  /**
   * Free allocated memory
   * @param {number} ptr - Pointer to free
   */
  free(ptr) {
    if (!this.module.free) {
      throw new Error('Module does not export free function');
    }
    
    if (this.allocations.has(ptr)) {
      this.module.free(ptr);
      this.allocations.delete(ptr);
    }
  }

  /**
   * Free all tracked allocations
   */
  freeAll() {
    for (const ptr of this.allocations) {
      if (this.module.free) {
        this.module.free(ptr);
      }
    }
    this.allocations.clear();
  }

  /**
   * Read buffer from WASM memory
   * @param {number} ptr - Pointer to memory
   * @param {number} length - Number of elements
   * @param {string} type - Type identifier ('i32', 'f32', 'f64', etc.)
   * @returns {TypedArray} Copied data
   */
  readBuffer(ptr, length, type) {
    const TypedArrayClass = this.typeMap[type];
    
    if (!TypedArrayClass) {
      throw new Error(`Unknown type: ${type}`);
    }
    
    if (!this.memory) {
      throw new Error('Module does not export memory');
    }
    
    // Create view into WASM memory
    const view = new TypedArrayClass(
      this.memory.buffer,
      ptr,
      length
    );
    
    // Return a copy (slice) to avoid issues with memory growth
    return view.slice();
  }

  /**
   * Write buffer to WASM memory
   * @param {number} ptr - Pointer to memory
   * @param {TypedArray} data - Data to write
   */
  writeBuffer(ptr, data) {
    if (!this.memory) {
      throw new Error('Module does not export memory');
    }
    
    const view = this.getMemoryView(data.constructor, ptr, data.length);
    view.set(data);
  }

  /**
   * Get a typed array view into WASM memory
   * @private
   */
  getMemoryView(TypedArrayClass, ptr, length) {
    if (!this.memory) {
      throw new Error('Module does not export memory');
    }
    
    return new TypedArrayClass(
      this.memory.buffer,
      ptr,
      length
    );
  }

  /**
   * Generic call wrapper for WASM functions
   * @param {string} functionName - Name of function to call
   * @param {...any} args - Arguments to pass
   * @returns {any} Function result
   */
  call(functionName, ...args) {
    const func = this.module[functionName];
    
    if (!func) {
      throw new Error(`Function '${functionName}' not found in module`);
    }
    
    if (typeof func !== 'function') {
      throw new Error(`'${functionName}' is not a function`);
    }
    
    try {
      return func(...args);
    } catch (error) {
      throw new Error(`WASM function '${functionName}' failed: ${error.message}`);
    }
  }

  /**
   * Call a WASM function with typed array arguments
   * Automatically handles allocation and cleanup
   * @param {string} functionName - Name of function to call
   * @param {Array<TypedArray>} inputs - Input arrays
   * @param {Object} outputSpec - Output specification {length, type}
   * @returns {TypedArray} Result array
   */
  callWithArrays(functionName, inputs, outputSpec) {
    const inputPtrs = [];
    let outputPtr = null;
    
    try {
      // Allocate input arrays
      for (const input of inputs) {
        const ptr = this.allocate(input);
        inputPtrs.push(ptr);
      }
      
      // Allocate output array if specified
      if (outputSpec) {
        const TypedArrayClass = this.typeMap[outputSpec.type];
        const outputArray = new TypedArrayClass(outputSpec.length);
        outputPtr = this.allocate(outputArray);
      }
      
      // Build arguments: input pointers, lengths, output pointer
      const args = [];
      for (let i = 0; i < inputs.length; i++) {
        args.push(inputPtrs[i]);
        args.push(inputs[i].length);
      }
      if (outputPtr !== null) {
        args.push(outputPtr);
      }
      
      // Call function
      const result = this.call(functionName, ...args);
      
      // Read output if specified
      if (outputSpec && outputPtr !== null) {
        return this.readBuffer(outputPtr, outputSpec.length, outputSpec.type);
      }
      
      return result;
      
    } finally {
      // Clean up allocations
      for (const ptr of inputPtrs) {
        this.free(ptr);
      }
      if (outputPtr !== null) {
        this.free(outputPtr);
      }
    }
  }

  /**
   * Allocate a string in WASM memory
   * @param {string} str - String to allocate
   * @returns {number} Pointer to allocated string
   */
  allocateString(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str + '\0'); // Null-terminated
    return this.allocate(bytes);
  }

  /**
   * Read a null-terminated string from WASM memory
   * @param {number} ptr - Pointer to string
   * @returns {string} Decoded string
   */
  readString(ptr) {
    if (!this.memory) {
      throw new Error('Module does not export memory');
    }
    
    const view = new Uint8Array(this.memory.buffer);
    const bytes = [];
    
    let i = ptr;
    while (view[i] !== 0 && i < view.length) {
      bytes.push(view[i]);
      i++;
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  }

  /**
   * Get memory statistics
   * @returns {Object} Memory stats
   */
  getMemoryStats() {
    return {
      allocations: this.allocations.size,
      memorySize: this.memory ? this.memory.buffer.byteLength : 0,
      hasMemory: !!this.memory,
      hasMalloc: !!this.module.malloc,
      hasFree: !!this.module.free
    };
  }
}

/**
 * Create a WASM bridge for a module
 * @param {Object} module - WASM module instance
 * @returns {WasmBridge} Bridge instance
 */
export function createBridge(module) {
  return new WasmBridge(module);
}
