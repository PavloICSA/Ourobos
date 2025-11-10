// Example usage of the Lisp Interpreter
// This demonstrates the core features of the interpreter

import { LispInterpreter } from './interpreter.js';

// Create a new interpreter instance
const interp = new LispInterpreter({
  maxOperations: 10000,  // Maximum operations before timeout
  timeout: 100           // Maximum execution time in milliseconds
});

// Example 1: Basic arithmetic
console.log('Arithmetic:', interp.eval('(+ 1 2 3)')); // 6

// Example 2: Define variables
interp.eval('(def pi 3.14159)');
console.log('Variable:', interp.eval('pi')); // 3.14159

// Example 3: Define and call functions
interp.eval('(def square (lambda (x) (* x x)))');
console.log('Function:', interp.eval('(square 5)')); // 25

// Example 4: Conditional logic
console.log('Conditional:', interp.eval('(if (> 10 5) "greater" "less")')); // "greater"

// Example 5: List operations
console.log('List:', interp.eval('(car (list 1 2 3))')); // 1

// Example 6: Register JavaScript bridge function
interp.registerJSFunction('get-entropy', (bits) => {
  // Simulate entropy generation
  return Math.random() * Math.pow(2, bits);
});

console.log('Bridge:', interp.eval('(call-js "get-entropy" 8)')); // Random number

// Example 7: Self-modifying code
interp.eval(`
  (begin
    (def counter 0)
    (def increment (lambda () (set! counter (+ counter 1))))
    (increment)
    (increment)
    counter)
`);
console.log('Self-modification:', interp.eval('counter')); // 2

export { interp };
