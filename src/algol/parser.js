/**
 * ALGOL DSL Parser
 * Recursive descent parser that builds an AST from tokens
 */

import { TokenType } from './lexer.js';

// AST Node Types
export class ASTNode {
  constructor(type, line, column) {
    this.type = type;
    this.line = line;
    this.column = column;
  }
}

export class ProgramNode extends ASTNode {
  constructor(statements, line, column) {
    super('Program', line, column);
    this.statements = statements;
  }
}

export class AssignmentNode extends ASTNode {
  constructor(identifier, expression, line, column) {
    super('Assignment', line, column);
    this.identifier = identifier;
    this.expression = expression;
  }
}

export class IfNode extends ASTNode {
  constructor(condition, thenBranch, elseBranch, line, column) {
    super('If', line, column);
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
}

export class WhileNode extends ASTNode {
  constructor(condition, body, line, column) {
    super('While', line, column);
    this.condition = condition;
    this.body = body;
  }
}

export class BlockNode extends ASTNode {
  constructor(statements, line, column) {
    super('Block', line, column);
    this.statements = statements;
  }
}

export class BinaryOpNode extends ASTNode {
  constructor(operator, left, right, line, column) {
    super('BinaryOp', line, column);
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class UnaryOpNode extends ASTNode {
  constructor(operator, operand, line, column) {
    super('UnaryOp', line, column);
    this.operator = operator;
    this.operand = operand;
  }
}

export class NumberNode extends ASTNode {
  constructor(value, line, column) {
    super('Number', line, column);
    this.value = value;
  }
}

export class IdentifierNode extends ASTNode {
  constructor(name, line, column) {
    super('Identifier', line, column);
    this.name = name;
  }
}

export class ParserError extends Error {
  constructor(message, line, column) {
    super(message);
    this.name = 'ParserError';
    this.line = line;
    this.column = column;
  }
}

export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }
  
  /**
   * Parse the token stream into an AST
   * @returns {ProgramNode}
   */
  parse() {
    const statements = [];
    
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      statements.push(this.statement());
    }
    
    return new ProgramNode(statements, 1, 1);
  }
  
  /**
   * Parse a statement
   * statement ::= assignment | conditional | loop | block
   */
  statement() {
    const token = this.currentToken();
    
    // Block statement
    if (this.match(TokenType.BEGIN)) {
      return this.blockStatement();
    }
    
    // Conditional statement
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }
    
    // Loop statement
    if (this.match(TokenType.WHILE)) {
      return this.whileStatement();
    }
    
    // Assignment statement
    if (token.type === TokenType.IDENTIFIER) {
      return this.assignmentStatement();
    }
    
    throw new ParserError(
      `Unexpected token: ${token.type}`,
      token.line,
      token.column
    );
  }
  
  /**
   * Parse block statement
   * block ::= BEGIN statement* END
   */
  blockStatement() {
    const beginToken = this.previous();
    const statements = [];
    
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      statements.push(this.statement());
      
      // Optional semicolon between statements
      this.match(TokenType.SEMICOLON);
    }
    
    this.consume(TokenType.END, "Expected 'END' after block");
    
    return new BlockNode(statements, beginToken.line, beginToken.column);
  }
  
  /**
   * Parse assignment statement
   * assignment ::= identifier := expression
   */
  assignmentStatement() {
    const identToken = this.advance();
    const identifier = identToken.value;
    
    this.consume(TokenType.ASSIGN, "Expected ':=' in assignment");
    
    const expression = this.expression();
    
    // Optional semicolon
    this.match(TokenType.SEMICOLON);
    
    return new AssignmentNode(
      identifier,
      expression,
      identToken.line,
      identToken.column
    );
  }
  
  /**
   * Parse if statement
   * conditional ::= IF expression THEN statement (ELSE statement)?
   */
  ifStatement() {
    const ifToken = this.previous();
    
    const condition = this.expression();
    
    this.consume(TokenType.THEN, "Expected 'THEN' after IF condition");
    
    const thenBranch = this.statement();
    
    let elseBranch = null;
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }
    
    return new IfNode(
      condition,
      thenBranch,
      elseBranch,
      ifToken.line,
      ifToken.column
    );
  }
  
  /**
   * Parse while statement
   * loop ::= WHILE expression DO statement
   */
  whileStatement() {
    const whileToken = this.previous();
    
    const condition = this.expression();
    
    this.consume(TokenType.DO, "Expected 'DO' after WHILE condition");
    
    const body = this.statement();
    
    return new WhileNode(
      condition,
      body,
      whileToken.line,
      whileToken.column
    );
  }
  
  /**
   * Parse expression with operator precedence
   * expression ::= comparison
   */
  expression() {
    return this.comparison();
  }
  
  /**
   * Parse comparison operators
   * comparison ::= term (("<" | ">" | "<=" | ">=" | "=" | "<>") term)*
   */
  comparison() {
    let expr = this.term();
    
    while (this.match(TokenType.LT, TokenType.GT, TokenType.LE, 
                       TokenType.GE, TokenType.EQ, TokenType.NE)) {
      const operator = this.previous();
      const right = this.term();
      expr = new BinaryOpNode(
        operator.type,
        expr,
        right,
        operator.line,
        operator.column
      );
    }
    
    return expr;
  }
  
  /**
   * Parse addition and subtraction
   * term ::= factor (("+"|"-") factor)*
   */
  term() {
    let expr = this.factor();
    
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new BinaryOpNode(
        operator.type,
        expr,
        right,
        operator.line,
        operator.column
      );
    }
    
    return expr;
  }
  
  /**
   * Parse multiplication and division
   * factor ::= unary (("*"|"/") unary)*
   */
  factor() {
    let expr = this.unary();
    
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new BinaryOpNode(
        operator.type,
        expr,
        right,
        operator.line,
        operator.column
      );
    }
    
    return expr;
  }
  
  /**
   * Parse unary operators
   * unary ::= ("-") unary | primary
   */
  unary() {
    if (this.match(TokenType.MINUS)) {
      const operator = this.previous();
      const operand = this.unary();
      return new UnaryOpNode(
        operator.type,
        operand,
        operator.line,
        operator.column
      );
    }
    
    return this.primary();
  }
  
  /**
   * Parse primary expressions
   * primary ::= number | identifier | "(" expression ")"
   */
  primary() {
    const token = this.currentToken();
    
    // Number literal
    if (this.match(TokenType.NUMBER)) {
      return new NumberNode(
        this.previous().value,
        token.line,
        token.column
      );
    }
    
    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      return new IdentifierNode(
        this.previous().value,
        token.line,
        token.column
      );
    }
    
    // Parenthesized expression
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }
    
    throw new ParserError(
      `Unexpected token in expression: ${token.type}`,
      token.line,
      token.column
    );
  }
  
  /**
   * Check if current token matches any of the given types
   */
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check if current token is of given type
   */
  check(type) {
    if (this.isAtEnd()) return false;
    return this.currentToken().type === type;
  }
  
  /**
   * Consume a token of the expected type or throw error
   */
  consume(type, message) {
    if (this.check(type)) {
      return this.advance();
    }
    
    const token = this.currentToken();
    throw new ParserError(message, token.line, token.column);
  }
  
  /**
   * Advance to next token
   */
  advance() {
    if (!this.isAtEnd()) {
      this.position++;
    }
    return this.previous();
  }
  
  /**
   * Check if at end of tokens
   */
  isAtEnd() {
    return this.position >= this.tokens.length ||
           this.currentToken().type === TokenType.EOF;
  }
  
  /**
   * Get current token
   */
  currentToken() {
    return this.tokens[this.position];
  }
  
  /**
   * Get previous token
   */
  previous() {
    return this.tokens[this.position - 1];
  }
}
