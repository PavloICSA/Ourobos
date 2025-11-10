/**
 * ALGOL DSL Compiler Example
 * Demonstrates compilation of ALGOL code to Lisp
 */

import { ALGOLCompiler } from './compiler.js';

// Create compiler instance
const compiler = new ALGOLCompiler();

console.log('=== ALGOL DSL Compiler Examples ===\n');

// Example 1: Simple assignment
console.log('Example 1: Simple Assignment');
console.log('ALGOL code:');
const example1 = 'mutation_rate := 0.05';
console.log(`  ${example1}`);

let result = compiler.compile(example1);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(`  ${result.lisp}`);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
}
console.log('');

// Example 2: Conditional statement
console.log('Example 2: Conditional Statement');
console.log('ALGOL code:');
const example2 = `IF population > 100 THEN
  mutation_rate := 0.05
ELSE
  mutation_rate := 0.1`;
console.log(example2);

result = compiler.compile(example2);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(result.lisp);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
}
console.log('');

// Example 3: Arithmetic expression
console.log('Example 3: Arithmetic Expression');
console.log('ALGOL code:');
const example3 = 'energy := population * 2.5 + 10';
console.log(`  ${example3}`);

result = compiler.compile(example3);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(`  ${result.lisp}`);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
}
console.log('');

// Example 4: While loop
console.log('Example 4: While Loop');
console.log('ALGOL code:');
const example4 = `WHILE energy > 0 DO
  energy := energy - 1`;
console.log(example4);

result = compiler.compile(example4);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(result.lisp);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
}
console.log('');

// Example 5: Block statement
console.log('Example 5: Block Statement');
console.log('ALGOL code:');
const example5 = `BEGIN
  population := 100;
  energy := 50;
  mutation_rate := 0.05
END`;
console.log(example5);

result = compiler.compile(example5);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(result.lisp);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
}
console.log('');

// Example 6: Complex nested structure
console.log('Example 6: Complex Nested Structure');
console.log('ALGOL code:');
const example6 = `IF energy > 50 THEN
  BEGIN
    population := population + 10;
    mutation_rate := 0.01
  END
ELSE
  BEGIN
    population := population - 5;
    mutation_rate := 0.1
  END`;
console.log(example6);

result = compiler.compile(example6);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(result.lisp);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
}
console.log('');

// Example 7: Comparison operators
console.log('Example 7: Comparison Operators');
console.log('ALGOL code:');
const example7 = 'IF population >= 100 THEN energy := energy * 1.5';
console.log(`  ${example7}`);

result = compiler.compile(example7);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(`  ${result.lisp}`);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
}
console.log('');

// Example 8: With comments
console.log('Example 8: With Comments in Source');
console.log('ALGOL code:');
const example8 = `// Adjust mutation rate based on population
IF population > 100 THEN
  mutation_rate := 0.05  // Low mutation for large population
ELSE
  mutation_rate := 0.1   // High mutation for small population`;
console.log(example8);

result = compiler.compile(example8, true); // Include comments in output
if (result.success) {
  console.log('Compiled Lisp with comments:');
  console.log(result.lisp);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
}
console.log('');

// Example 9: Error handling - syntax error
console.log('Example 9: Error Handling - Syntax Error');
console.log('ALGOL code:');
const example9 = 'IF population > 100 mutation_rate := 0.05'; // Missing THEN
console.log(`  ${example9}`);

result = compiler.compile(example9);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(`  ${result.lisp}`);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
  console.log('\nFormatted error:');
  console.log(compiler.formatErrors(result.errors, example9));
}
console.log('');

// Example 10: Error handling - unexpected character
console.log('Example 10: Error Handling - Unexpected Character');
console.log('ALGOL code:');
const example10 = 'energy := 100 @ 50'; // Invalid character @
console.log(`  ${example10}`);

result = compiler.compile(example10);
if (result.success) {
  console.log('Compiled Lisp:');
  console.log(`  ${result.lisp}`);
} else {
  console.log('Compilation errors:');
  result.errors.forEach(err => console.log(`  ${err.toString()}`));
  console.log('\nFormatted error:');
  console.log(compiler.formatErrors(result.errors, example10));
}

console.log('\n=== Examples Complete ===');
