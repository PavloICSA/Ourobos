/**
 * ALGOL DSL Code Generator
 * Converts AST to Lisp s-expressions
 */

import { TokenType } from './lexer.js';

export class CodeGenerator {
  constructor() {
    this.indentLevel = 0;
    this.indentSize = 2;
  }
  
  /**
   * Generate Lisp code from AST
   * @param {ASTNode} ast - The abstract syntax tree
   * @returns {string} Generated Lisp code
   */
  generate(ast) {
    if (ast.type === 'Program') {
      return this.generateProgram(ast);
    }
    
    throw new Error(`Unknown AST node type: ${ast.type}`);
  }
  
  /**
   * Generate code for program node
   */
  generateProgram(node) {
    if (node.statements.length === 0) {
      return '()';
    }
    
    if (node.statements.length === 1) {
      return this.generateStatement(node.statements[0]);
    }
    
    // Multiple statements wrapped in begin
    const statements = node.statements.map(stmt => 
      this.generateStatement(stmt)
    );
    
    return this.formatBegin(statements);
  }
  
  /**
   * Generate code for a statement
   */
  generateStatement(node) {
    switch (node.type) {
      case 'Assignment':
        return this.generateAssignment(node);
      case 'If':
        return this.generateIf(node);
      case 'While':
        return this.generateWhile(node);
      case 'Block':
        return this.generateBlock(node);
      default:
        // Expression statement
        return this.generateExpression(node);
    }
  }
  
  /**
   * Generate code for assignment
   * identifier := expression  =>  (set! identifier expression)
   */
  generateAssignment(node) {
    const expr = this.generateExpression(node.expression);
    return `(set! ${node.identifier} ${expr})`;
  }
  
  /**
   * Generate code for if statement
   * IF condition THEN thenBranch ELSE elseBranch
   * =>  (if condition thenBranch elseBranch)
   */
  generateIf(node) {
    const condition = this.generateExpression(node.condition);
    const thenBranch = this.generateStatement(node.thenBranch);
    
    if (node.elseBranch) {
      const elseBranch = this.generateStatement(node.elseBranch);
      return this.formatIf(condition, thenBranch, elseBranch);
    }
    
    // No else branch - use empty begin
    return this.formatIf(condition, thenBranch, '(begin)');
  }
  
  /**
   * Generate code for while loop
   * WHILE condition DO body
   * =>  (while condition body)
   * 
   * Note: 'while' is not standard Lisp, but we'll generate it
   * and the interpreter should support it or we can expand to recursion
   */
  generateWhile(node) {
    const condition = this.generateExpression(node.condition);
    const body = this.generateStatement(node.body);
    
    return this.formatWhile(condition, body);
  }
  
  /**
   * Generate code for block
   * BEGIN stmt1; stmt2; ... END  =>  (begin stmt1 stmt2 ...)
   */
  generateBlock(node) {
    if (node.statements.length === 0) {
      return '(begin)';
    }
    
    const statements = node.statements.map(stmt =>
      this.generateStatement(stmt)
    );
    
    return this.formatBegin(statements);
  }
  
  /**
   * Generate code for expression
   */
  generateExpression(node) {
    switch (node.type) {
      case 'BinaryOp':
        return this.generateBinaryOp(node);
      case 'UnaryOp':
        return this.generateUnaryOp(node);
      case 'Number':
        return this.generateNumber(node);
      case 'Identifier':
        return this.generateIdentifier(node);
      default:
        throw new Error(`Unknown expression type: ${node.type}`);
    }
  }
  
  /**
   * Generate code for binary operation
   */
  generateBinaryOp(node) {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);
    const operator = this.mapOperator(node.operator);
    
    return `(${operator} ${left} ${right})`;
  }
  
  /**
   * Generate code for unary operation
   */
  generateUnaryOp(node) {
    const operand = this.generateExpression(node.operand);
    const operator = this.mapOperator(node.operator);
    
    return `(${operator} ${operand})`;
  }
  
  /**
   * Generate code for number literal
   */
  generateNumber(node) {
    return node.value.toString();
  }
  
  /**
   * Generate code for identifier
   */
  generateIdentifier(node) {
    return node.name;
  }
  
  /**
   * Map ALGOL operators to Lisp operators
   */
  mapOperator(tokenType) {
    const operatorMap = {
      [TokenType.PLUS]: '+',
      [TokenType.MINUS]: '-',
      [TokenType.MULTIPLY]: '*',
      [TokenType.DIVIDE]: '/',
      [TokenType.LT]: '<',
      [TokenType.GT]: '>',
      [TokenType.LE]: '<=',
      [TokenType.GE]: '>=',
      [TokenType.EQ]: '=',
      [TokenType.NE]: '!='
    };
    
    const operator = operatorMap[tokenType];
    if (!operator) {
      throw new Error(`Unknown operator: ${tokenType}`);
    }
    
    return operator;
  }
  
  /**
   * Format if expression with proper indentation
   */
  formatIf(condition, thenBranch, elseBranch) {
    // Check if branches are simple (no newlines)
    const thenSimple = !thenBranch.includes('\n');
    const elseSimple = !elseBranch.includes('\n');
    
    if (thenSimple && elseSimple && 
        condition.length + thenBranch.length + elseBranch.length < 60) {
      // Single line format
      return `(if ${condition} ${thenBranch} ${elseBranch})`;
    }
    
    // Multi-line format
    const indent = ' '.repeat(this.indentSize);
    return `(if ${condition}\n${indent}${thenBranch}\n${indent}${elseBranch})`;
  }
  
  /**
   * Format while loop with proper indentation
   */
  formatWhile(condition, body) {
    // For now, generate a simple while form
    // The Lisp interpreter will need to support this
    if (!body.includes('\n') && condition.length + body.length < 60) {
      return `(while ${condition} ${body})`;
    }
    
    const indent = ' '.repeat(this.indentSize);
    return `(while ${condition}\n${indent}${body})`;
  }
  
  /**
   * Format begin block with proper indentation
   */
  formatBegin(statements) {
    if (statements.length === 0) {
      return '(begin)';
    }
    
    if (statements.length === 1) {
      return `(begin ${statements[0]})`;
    }
    
    // Check if all statements are simple
    const allSimple = statements.every(s => !s.includes('\n'));
    const totalLength = statements.reduce((sum, s) => sum + s.length, 0);
    
    if (allSimple && totalLength < 60) {
      // Single line format
      return `(begin ${statements.join(' ')})`;
    }
    
    // Multi-line format
    const indent = ' '.repeat(this.indentSize);
    const formattedStatements = statements
      .map(s => indent + s)
      .join('\n');
    
    return `(begin\n${formattedStatements})`;
  }
  
  /**
   * Generate code with comments for debugging
   */
  generateWithComments(ast, sourceLines) {
    const code = this.generate(ast);
    
    // Add header comment
    const header = `;; Generated from ALGOL DSL\n`;
    
    // Add source as comments
    const sourceComments = sourceLines
      .map(line => `;; ${line}`)
      .join('\n');
    
    return `${header}${sourceComments}\n\n${code}`;
  }
}
