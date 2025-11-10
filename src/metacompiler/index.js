/**
 * Meta-Compiler Module
 * 
 * Unified compilation system for OuroborOS-Chimera organism rules.
 * Compiles multiple languages (ALGOL, Lisp, Pascal, Rust, Go, Fortran)
 * into Ourocode intermediate representation.
 */

// Core compiler
export { MetaCompiler } from './meta-compiler.js';

// Executor
export {
  OurocodeExecutor,
  ExecutionError,
  createOrganismState,
  extractStateFields
} from './ourocode-executor.js';

// Type definitions
export {
  OurocodeModule,
  OurocodeType,
  OurocodeFunction,
  OurocodeBlock,
  ConstInstruction,
  ExtractInstruction,
  InsertInstruction,
  BinaryOpInstruction,
  BranchInstruction,
  PhiInstruction,
  CallInstruction,
  ReturnInstruction,
  createOrganismStateType,
  createOurocodeModule
} from './ourocode-types.js';
