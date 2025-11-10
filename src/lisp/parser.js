// S-expression Parser for Lisp
// Tokenizes and parses Lisp code into an Abstract Syntax Tree

/**
 * Token types for Lisp syntax
 */
const TokenType = {
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  SYMBOL: 'SYMBOL',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  EOF: 'EOF'
};

/**
 * Tokenizer for Lisp syntax
 * Converts source code into a stream of tokens
 */
class Tokenizer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
  }

  /**
   * Get current character without advancing
   */
  peek() {
    return this.pos < this.source.length ? this.source[this.pos] : null;
  }

  /**
   * Get current character and advance position
   */
  advance() {
    const char = this.source[this.pos++];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  /**
   * Skip whitespace and comments
   */
  skipWhitespace() {
    while (this.peek()) {
      const char = this.peek();
      
      // Skip whitespace
      if (/\s/.test(char)) {
        this.advance();
        continue;
      }
      
      // Skip comments (semicolon to end of line)
      if (char === ';') {
        while (this.peek() && this.peek() !== '\n') {
          this.advance();
        }
        continue;
      }
      
      break;
    }
  }

  /**
   * Read a number token
   */
  readNumber() {
    const start = this.pos;
    const startLine = this.line;
    const startColumn = this.column;
    
    // Handle negative numbers
    if (this.peek() === '-') {
      this.advance();
    }
    
    // Read digits and decimal point
    while (this.peek() && /[0-9.]/.test(this.peek())) {
      this.advance();
    }
    
    const value = this.source.substring(start, this.pos);
    return {
      type: TokenType.NUMBER,
      value: parseFloat(value),
      line: startLine,
      column: startColumn
    };
  }

  /**
   * Read a symbol token
   */
  readSymbol() {
    const start = this.pos;
    const startLine = this.line;
    const startColumn = this.column;
    
    // Symbols can contain letters, numbers, and special characters
    // but cannot start with a digit
    while (this.peek() && /[^\s()";]/.test(this.peek())) {
      this.advance();
    }
    
    const value = this.source.substring(start, this.pos);
    return {
      type: TokenType.SYMBOL,
      value: value,
      line: startLine,
      column: startColumn
    };
  }

  /**
   * Read a string token
   */
  readString() {
    const startLine = this.line;
    const startColumn = this.column;
    
    this.advance(); // Skip opening quote
    
    let value = '';
    while (this.peek() && this.peek() !== '"') {
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.advance();
        // Handle escape sequences
        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          default: value += escaped;
        }
      } else {
        value += this.advance();
      }
    }
    
    if (this.peek() !== '"') {
      throw new ParseError('Unterminated string', startLine, startColumn);
    }
    
    this.advance(); // Skip closing quote
    
    return {
      type: TokenType.STRING,
      value: value,
      line: startLine,
      column: startColumn
    };
  }

  /**
   * Get the next token from the source
   */
  nextToken() {
    this.skipWhitespace();
    
    if (!this.peek()) {
      return { type: TokenType.EOF, value: null, line: this.line, column: this.column };
    }
    
    const char = this.peek();
    const line = this.line;
    const column = this.column;
    
    // Parentheses
    if (char === '(') {
      this.advance();
      return { type: TokenType.LPAREN, value: '(', line, column };
    }
    
    if (char === ')') {
      this.advance();
      return { type: TokenType.RPAREN, value: ')', line, column };
    }
    
    // Strings
    if (char === '"') {
      return this.readString();
    }
    
    // Numbers
    if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(this.source[this.pos + 1] || ''))) {
      return this.readNumber();
    }
    
    // Symbols
    return this.readSymbol();
  }

  /**
   * Tokenize the entire source into an array of tokens
   */
  tokenize() {
    const tokens = [];
    let token;
    
    do {
      token = this.nextToken();
      tokens.push(token);
    } while (token.type !== TokenType.EOF);
    
    return tokens;
  }
}

/**
 * Parser for Lisp S-expressions
 * Builds an Abstract Syntax Tree from tokens
 */
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  /**
   * Get current token without advancing
   */
  peek() {
    return this.tokens[this.pos];
  }

  /**
   * Get current token and advance position
   */
  advance() {
    return this.tokens[this.pos++];
  }

  /**
   * Parse a single S-expression
   */
  parseExpression() {
    const token = this.peek();
    
    if (!token || token.type === TokenType.EOF) {
      throw new ParseError('Unexpected end of input', token.line, token.column);
    }
    
    // Parse list (S-expression)
    if (token.type === TokenType.LPAREN) {
      return this.parseList();
    }
    
    // Parse atom (number, symbol, or string)
    return this.parseAtom();
  }

  /**
   * Parse a list (parenthesized expression)
   */
  parseList() {
    const startToken = this.advance(); // Consume '('
    const elements = [];
    
    while (this.peek().type !== TokenType.RPAREN) {
      if (this.peek().type === TokenType.EOF) {
        throw new ParseError(
          'Unexpected end of input, expected )',
          startToken.line,
          startToken.column
        );
      }
      
      elements.push(this.parseExpression());
    }
    
    this.advance(); // Consume ')'
    
    return elements;
  }

  /**
   * Parse an atom (number, symbol, or string)
   */
  parseAtom() {
    const token = this.advance();
    
    switch (token.type) {
      case TokenType.NUMBER:
        return token.value;
      
      case TokenType.STRING:
        return token.value;
      
      case TokenType.SYMBOL:
        return { type: 'symbol', value: token.value };
      
      case TokenType.RPAREN:
        throw new ParseError('Unexpected )', token.line, token.column);
      
      default:
        throw new ParseError(`Unexpected token: ${token.type}`, token.line, token.column);
    }
  }

  /**
   * Parse all expressions in the token stream
   */
  parse() {
    const expressions = [];
    
    while (this.peek().type !== TokenType.EOF) {
      expressions.push(this.parseExpression());
    }
    
    return expressions;
  }
}

/**
 * Parse error with line and column information
 */
class ParseError extends Error {
  constructor(message, line, column) {
    super(`Parse error at line ${line}, column ${column}: ${message}`);
    this.name = 'ParseError';
    this.line = line;
    this.column = column;
  }
}

/**
 * Main parse function
 * Converts Lisp source code into an AST
 */
export function parse(source) {
  try {
    const tokenizer = new Tokenizer(source);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    throw new ParseError(error.message, 1, 1);
  }
}

export { ParseError, TokenType };
