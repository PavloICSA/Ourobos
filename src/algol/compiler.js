/**
 * ALGOL DSL Compiler
 * Compiles ALGOL-like syntax to Lisp s-expressions
 */

import { Lexer, LexerError } from './lexer.js';
import { Parser, ParserError } from './parser.js';
import { CodeGenerator } from './codegen.js';

export class CompileError {
  constructor(message, line, column, phase) {
    this.message = message;
    this.line = line;
    this.column = column;
    this.phase = phase; // 'lexer', 'parser', or 'codegen'
  }
  
  toString() {
    return `${this.phase} error at line ${this.line}, column ${this.column}: ${this.message}`;
  }
}

export class CompileResult {
  constructor(success, lisp = null, errors = []) {
    this.success = success;
    this.lisp = lisp;
    this.errors = errors;
  }
}

export class ALGOLCompiler {
  constructor() {
    this.lexer = null;
    this.parser = null;
    this.codegen = new CodeGenerator();
  }
  
  /**
   * Compile ALGOL source code to Lisp
   * @param {string} source - ALGOL source code
   * @param {boolean} includeComments - Include source as comments in output
   * @returns {CompileResult}
   */
  compile(source, includeComments = false) {
    try {
      // Phase 1: Lexical analysis
      this.lexer = new Lexer(source);
      const tokens = this.lexer.tokenize();
      
      // Phase 2: Parsing
      this.parser = new Parser(tokens);
      const ast = this.parser.parse();
      
      // Phase 3: Code generation
      let lisp;
      if (includeComments) {
        const sourceLines = source.split('\n');
        lisp = this.codegen.generateWithComments(ast, sourceLines);
      } else {
        lisp = this.codegen.generate(ast);
      }
      
      return new CompileResult(true, lisp, []);
      
    } catch (error) {
      // Handle compilation errors
      const compileError = this.handleError(error);
      return new CompileResult(false, null, [compileError]);
    }
  }
  
  /**
   * Handle compilation errors
   */
  handleError(error) {
    if (error instanceof LexerError) {
      return new CompileError(
        error.message,
        error.line,
        error.column,
        'lexer'
      );
    }
    
    if (error instanceof ParserError) {
      return new CompileError(
        error.message,
        error.line,
        error.column,
        'parser'
      );
    }
    
    // Generic error
    return new CompileError(
      error.message || 'Unknown compilation error',
      0,
      0,
      'codegen'
    );
  }
  
  /**
   * Format error messages for display
   */
  formatErrors(errors, source) {
    if (errors.length === 0) {
      return '';
    }
    
    const sourceLines = source.split('\n');
    const formatted = [];
    
    for (const error of errors) {
      formatted.push(error.toString());
      
      // Add source context if available
      if (error.line > 0 && error.line <= sourceLines.length) {
        const line = sourceLines[error.line - 1];
        formatted.push(`  ${line}`);
        
        // Add pointer to error column
        if (error.column > 0) {
          const pointer = ' '.repeat(error.column + 1) + '^';
          formatted.push(pointer);
        }
      }
      
      formatted.push('');
    }
    
    return formatted.join('\n');
  }
}
