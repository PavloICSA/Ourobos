// Retro Terminal UI - Pascal/Turbo Pascal style
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5

export class Terminal {
  constructor(container) {
    this.container = container;
    this.lines = []; // Text buffer
    this.maxLines = 1000; // Scrollback buffer limit
    this.currentInput = '';
    this.cursorPosition = 0;
    this.commandHistory = [];
    this.historyIndex = -1;
    this.prompt = '> ';
    this.cursorVisible = true;
    this.commandHandlers = new Map();
    
    this.init();
  }

  init() {
    // Create terminal elements
    this.outputElement = document.createElement('div');
    this.outputElement.className = 'terminal-output';
    
    this.inputLine = document.createElement('div');
    this.inputLine.className = 'terminal-input-line';
    
    this.promptElement = document.createElement('span');
    this.promptElement.className = 'terminal-prompt';
    this.promptElement.textContent = this.prompt;
    
    this.inputElement = document.createElement('span');
    this.inputElement.className = 'terminal-input';
    
    this.cursorElement = document.createElement('span');
    this.cursorElement.className = 'terminal-cursor';
    this.cursorElement.textContent = '█';
    
    this.inputLine.appendChild(this.promptElement);
    this.inputLine.appendChild(this.inputElement);
    this.inputLine.appendChild(this.cursorElement);
    
    this.container.appendChild(this.outputElement);
    this.container.appendChild(this.inputLine);
    
    // Add CSS class to container
    this.container.className = 'terminal';
    
    // Set up keyboard event listeners
    this.setupEventListeners();
    
    // Start cursor blink animation
    this.startCursorBlink();
    
    // Focus the terminal
    this.container.tabIndex = 0;
    this.container.focus();
  }

  setupEventListeners() {
    // Handle keyboard input
    this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Prevent default behavior for certain keys
    this.container.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
    
    // Keep focus on terminal
    this.container.addEventListener('click', () => {
      this.container.focus();
    });
  }

  handleKeyDown(e) {
    // Handle special keys
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.handleEnter();
        break;
        
      case 'Backspace':
        e.preventDefault();
        this.handleBackspace();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.handleArrowUp();
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        this.handleArrowDown();
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        this.handleArrowLeft();
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        this.handleArrowRight();
        break;
        
      case 'Home':
        e.preventDefault();
        this.cursorPosition = 0;
        this.updateInput();
        break;
        
      case 'End':
        e.preventDefault();
        this.cursorPosition = this.currentInput.length;
        this.updateInput();
        break;
        
      default:
        // Handle regular character input
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          this.handleCharacterInput(e.key);
        }
    }
  }

  handleCharacterInput(char) {
    // Insert character at cursor position
    this.currentInput = 
      this.currentInput.slice(0, this.cursorPosition) + 
      char + 
      this.currentInput.slice(this.cursorPosition);
    this.cursorPosition++;
    this.updateInput();
  }

  handleBackspace() {
    if (this.cursorPosition > 0) {
      this.currentInput = 
        this.currentInput.slice(0, this.cursorPosition - 1) + 
        this.currentInput.slice(this.cursorPosition);
      this.cursorPosition--;
      this.updateInput();
    }
  }

  handleEnter() {
    const command = this.currentInput.trim();
    
    // Add command to output
    this.writeLine(this.prompt + this.currentInput);
    
    // Add to history if not empty
    if (command) {
      this.commandHistory.push(command);
      this.historyIndex = this.commandHistory.length;
      
      // Execute command
      this.executeCommand(command);
    }
    
    // Clear input
    this.currentInput = '';
    this.cursorPosition = 0;
    this.updateInput();
  }

  handleArrowUp() {
    // Navigate command history backwards
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentInput = this.commandHistory[this.historyIndex];
      this.cursorPosition = this.currentInput.length;
      this.updateInput();
    }
  }

  handleArrowDown() {
    // Navigate command history forwards
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      this.currentInput = this.commandHistory[this.historyIndex];
      this.cursorPosition = this.currentInput.length;
      this.updateInput();
    } else if (this.historyIndex === this.commandHistory.length - 1) {
      this.historyIndex = this.commandHistory.length;
      this.currentInput = '';
      this.cursorPosition = 0;
      this.updateInput();
    }
  }

  handleArrowLeft() {
    if (this.cursorPosition > 0) {
      this.cursorPosition--;
      this.updateInput();
    }
  }

  handleArrowRight() {
    if (this.cursorPosition < this.currentInput.length) {
      this.cursorPosition++;
      this.updateInput();
    }
  }

  updateInput() {
    // Update input display with cursor at correct position
    const beforeCursor = this.currentInput.slice(0, this.cursorPosition);
    const afterCursor = this.currentInput.slice(this.cursorPosition);
    
    this.inputElement.textContent = beforeCursor;
    
    // Position cursor element
    if (afterCursor) {
      this.cursorElement.textContent = afterCursor[0];
      this.cursorElement.classList.add('has-char');
      
      // Create element for text after cursor
      const afterElement = document.createElement('span');
      afterElement.textContent = afterCursor.slice(1);
      
      // Clear and rebuild input line
      this.inputLine.innerHTML = '';
      this.inputLine.appendChild(this.promptElement);
      this.inputLine.appendChild(this.inputElement);
      this.inputLine.appendChild(this.cursorElement);
      this.inputLine.appendChild(afterElement);
    } else {
      this.cursorElement.textContent = '█';
      this.cursorElement.classList.remove('has-char');
      
      this.inputLine.innerHTML = '';
      this.inputLine.appendChild(this.promptElement);
      this.inputLine.appendChild(this.inputElement);
      this.inputLine.appendChild(this.cursorElement);
    }
  }

  startCursorBlink() {
    // Blink cursor every 500ms
    setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.cursorElement.style.opacity = this.cursorVisible ? '1' : '0';
    }, 500);
  }

  write(text, style = '') {
    // Add text to current line without newline
    const span = document.createElement('span');
    if (style) {
      span.className = `terminal-${style}`;
    }
    span.textContent = text;
    
    // If there's a current line being built, append to it
    if (this.lines.length > 0 && !this.lines[this.lines.length - 1].complete) {
      const lastLine = this.outputElement.lastChild;
      if (lastLine) {
        lastLine.appendChild(span);
      }
    } else {
      // Create new line
      const lineDiv = document.createElement('div');
      lineDiv.className = 'terminal-line';
      lineDiv.appendChild(span);
      this.outputElement.appendChild(lineDiv);
      this.lines.push({ element: lineDiv, complete: false });
    }
    
    this.autoScroll();
  }

  writeLine(text, style = '') {
    // Add text with newline
    const lineDiv = document.createElement('div');
    lineDiv.className = 'terminal-line';
    
    if (style) {
      lineDiv.classList.add(`terminal-${style}`);
    }
    
    lineDiv.textContent = text;
    this.outputElement.appendChild(lineDiv);
    
    this.lines.push({ element: lineDiv, complete: true });
    
    // Maintain scrollback buffer limit
    if (this.lines.length > this.maxLines) {
      const removed = this.lines.shift();
      if (removed.element.parentNode) {
        removed.element.parentNode.removeChild(removed.element);
      }
    }
    
    this.autoScroll();
  }

  autoScroll() {
    // Scroll to bottom
    this.container.scrollTop = this.container.scrollHeight;
  }

  clear() {
    // Clear all output
    this.outputElement.innerHTML = '';
    this.lines = [];
  }

  setPrompt(prompt) {
    this.prompt = prompt;
    this.promptElement.textContent = prompt;
  }

  onCommand(callback) {
    // Register command callback
    this.commandCallback = callback;
  }

  executeCommand(command) {
    // Parse command
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Check for registered handler
    const handler = this.commandHandlers.get(cmd);
    if (handler) {
      try {
        handler(args);
      } catch (error) {
        this.writeLine(`Error: ${error.message}`, 'error');
      }
    } else if (this.commandCallback) {
      // Use generic callback
      this.commandCallback(command);
    } else {
      this.writeLine(`Unknown command: ${cmd}`, 'error');
      this.writeLine('Type "help" for available commands');
    }
  }

  registerCommand(name, handler) {
    // Register a command handler
    this.commandHandlers.set(name.toLowerCase(), handler);
  }

  unregisterCommand(name) {
    this.commandHandlers.delete(name.toLowerCase());
  }
}
