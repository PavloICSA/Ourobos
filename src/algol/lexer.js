/**
 * ALGOL DSL Lexer
 * Tokenizes ALGOL-like source code with line/column tracking
 */

// Token types
export const TokenType = {
  // Keywords
  IF: 'IF',
  THEN: 'THEN',
  ELSE: 'ELSE',
  WHILE: 'WHILE',
  DO: 'DO',
  BEGIN: 'BEGIN',
  END: 'END',
  
  // Operators
  ASSIGN: 'ASSIGN',        // :=
  PLUS: 'PLUS',            // +
  MINUS: 'MINUS',          // -
  MULTIPLY: 'MULTIPLY',    // *
  DIVIDE: 'DIVIDE',        // /
  LT: 'LT',                // <
  GT: 'GT',                // >
  LE: 'LE',                // <=
  GE: 'GE',                // >=
  EQ: 'EQ',                // =
  NE: 'NE',                // <>
  
  // Delimiters
  LPAREN: 'LPAREN',        // (
  RPAREN: 'RPAREN',        // )
  SEMICOLON: 'SEMICOLON',  // ;
  
  // Literals and identifiers
  NUMBER: 'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  
  // Special
  EOF: 'EOF',
  NEWLINE: 'NEWLINE'
};

// Keywords map
const KEYWORDS = {
  'IF': TokenType.IF,
  'THEN': TokenType.THEN,
  'ELSE': TokenType.ELSE,
  'WHILE': TokenType.WHILE,
  'DO': TokenType.DO,
  'BEGIN': TokenType.BEGIN,
  'END': TokenType.END
};

export class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
  
  toString() {
    return `Token(${this.type}, ${this.value}, ${this.line}:${this.column})`;
  }
}

export class LexerError extends Error {
  constructor(message, line, column) {
    super(message);
    this.name = 'LexerError';
    this.line = line;
    this.column = column;
  }
}

export class Lexer {
  constructor(source) {
    this.source = source;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }
  
  /**
   * Tokenize the entire source code
   * @returns {Token[]} Array of tokens
   */
  tokenize() {
    this.tokens = [];
    
    while (this.position < this.source.length) {
      this.skipWhitespaceAndComments();
      
      if (this.position >= this.source.length) {
        break;
      }
      
      const token = this.nextToken();
      if (token) {
        this.tokens.push(token);
      }
    }
    
    // Add EOF token
    this.tokens.push(new Token(TokenType.EOF, null, this.line, this.column));
    
    return this.tokens;
  }
  
  /**
   * Get the next token from the source
   * @returns {Token|null}
   */
  nextToken() {
    const char = this.currentChar();
    const line = this.line;
    const column = this.column;
    
    // Numbers
    if (this.isDigit(char)) {
      return this.readNumber(line, column);
    }
    
    // Identifiers and keywords
    if (this.isAlpha(char) || char === '_') {
      return this.readIdentifier(line, column);
    }
    
    // Two-character operators
    if (char === ':' && this.peek() === '=') {
      this.advance();
      this.advance();
      return new Token(TokenType.ASSIGN, ':=', line, column);
    }
    
    if (char === '<' && this.peek() === '=') {
      this.advance();
      this.advance();
      return new Token(TokenType.LE, '<=', line, column);
    }
    
    if (char === '>' && this.peek() === '=') {
      this.advance();
      this.advance();
      return new Token(TokenType.GE, '>=', line, column);
    }
    
    if (char === '<' && this.peek() === '>') {
      this.advance();
      this.advance();
      return new Token(TokenType.NE, '<>', line, column);
    }
    
    // Single-character operators and delimiters
    switch (char) {
      case '+':
        this.advance();
        return new Token(TokenType.PLUS, '+', line, column);
      case '-':
        this.advance();
        return new Token(TokenType.MINUS, '-', line, column);
      case '*':
        this.advance();
        return new Token(TokenType.MULTIPLY, '*', line, column);
      case '/':
        this.advance();
        return new Token(TokenType.DIVIDE, '/', line, column);
      case '<':
        this.advance();
        return new Token(TokenType.LT, '<', line, column);
      case '>':
        this.advance();
        return new Token(TokenType.GT, '>', line, column);
      case '=':
        this.advance();
        return new Token(TokenType.EQ, '=', line, column);
      case '(':
        this.advance();
        return new Token(TokenType.LPAREN, '(', line, column);
      case ')':
        this.advance();
        return new Token(TokenType.RPAREN, ')', line, column);
      case ';':
        this.advance();
        return new Token(TokenType.SEMICOLON, ';', line, column);
      default:
        throw new LexerError(
          `Unexpected character: '${char}'`,
          line,
          column
        );
    }
  }
  
  /**
   * Read a number token (integer or float)
   */
  readNumber(line, column) {
    let value = '';
    
    while (this.isDigit(this.currentChar())) {
      value += this.currentChar();
      this.advance();
    }
    
    // Handle decimal point
    if (this.currentChar() === '.' && this.isDigit(this.peek())) {
      value += '.';
      this.advance();
      
      while (this.isDigit(this.currentChar())) {
        value += this.currentChar();
        this.advance();
      }
    }
    
    return new Token(TokenType.NUMBER, parseFloat(value), line, column);
  }
  
  /**
   * Read an identifier or keyword token
   */
  readIdentifier(line, column) {
    let value = '';
    
    while (this.isAlphaNumeric(this.currentChar()) || this.currentChar() === '_') {
      value += this.currentChar();
      this.advance();
    }
    
    // Check if it's a keyword (case-insensitive)
    const upperValue = value.toUpperCase();
    const tokenType = KEYWORDS[upperValue] || TokenType.IDENTIFIER;
    
    return new Token(tokenType, value, line, column);
  }
  
  /**
   * Skip whitespace and comments
   */
  skipWhitespaceAndComments() {
    while (this.position < this.source.length) {
      const char = this.currentChar();
      
      // Skip whitespace
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
        continue;
      }
      
      // Handle newlines
      if (char === '\n') {
        this.advance();
        this.line++;
        this.column = 1;
        continue;
      }
      
      // Skip comments (// style)
      if (char === '/' && this.peek() === '/') {
        this.skipLineComment();
        continue;
      }
      
      // Skip comments (/* */ style)
      if (char === '/' && this.peek() === '*') {
        this.skipBlockComment();
        continue;
      }
      
      break;
    }
  }
  
  /**
   * Skip line comment (// ...)
   */
  skipLineComment() {
    // Skip //
    this.advance();
    this.advance();
    
    // Skip until newline or EOF
    while (this.currentChar() !== '\n' && this.position < this.source.length) {
      this.advance();
    }
  }
  
  /**
   * Skip block comment
   */
  skipBlockComment() {
    const startLine = this.line;
    const startColumn = this.column;
    
    // Skip /*
    this.advance();
    this.advance();
    
    // Skip until */
    while (this.position < this.source.length - 1) {
      if (this.currentChar() === '*' && this.peek() === '/') {
        this.advance();
        this.advance();
        return;
      }
      
      if (this.currentChar() === '\n') {
        this.line++;
        this.column = 1;
      }
      
      this.advance();
    }
    
    // Unterminated comment
    throw new LexerError(
      'Unterminated block comment',
      startLine,
      startColumn
    );
  }
  
  /**
   * Get current character
   */
  currentChar() {
    if (this.position >= this.source.length) {
      return '\0';
    }
    return this.source[this.position];
  }
  
  /**
   * Peek at next character
   */
  peek(offset = 1) {
    const pos = this.position + offset;
    if (pos >= this.source.length) {
      return '\0';
    }
    return this.source[pos];
  }
  
  /**
   * Advance to next character
   */
  advance() {
    if (this.position < this.source.length) {
      this.position++;
      this.column++;
    }
  }
  
  /**
   * Check if character is a digit
   */
  isDigit(char) {
    return char >= '0' && char <= '9';
  }
  
  /**
   * Check if character is alphabetic
   */
  isAlpha(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }
  
  /**
   * Check if character is alphanumeric
   */
  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
