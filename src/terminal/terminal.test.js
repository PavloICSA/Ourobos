// Terminal Unit Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Terminal } from './terminal.js';

describe('Terminal', () => {
  let container;
  let terminal;

  beforeEach(() => {
    // Create a mock container
    container = document.createElement('div');
    document.body.appendChild(container);
    terminal = new Terminal(container);
  });

  it('should initialize with correct structure', () => {
    expect(container.querySelector('.terminal-output')).toBeTruthy();
    expect(container.querySelector('.terminal-input-line')).toBeTruthy();
    expect(container.querySelector('.terminal-cursor')).toBeTruthy();
  });

  it('should write text without newline', () => {
    terminal.write('Hello');
    const output = container.querySelector('.terminal-output');
    expect(output.textContent).toContain('Hello');
  });

  it('should write text with newline', () => {
    terminal.writeLine('Line 1');
    terminal.writeLine('Line 2');
    const lines = container.querySelectorAll('.terminal-line');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('should apply text styling', () => {
    terminal.writeLine('Error message', 'error');
    const line = container.querySelector('.terminal-error');
    expect(line).toBeTruthy();
    expect(line.textContent).toBe('Error message');
  });

  it('should clear output', () => {
    terminal.writeLine('Line 1');
    terminal.writeLine('Line 2');
    terminal.clear();
    const output = container.querySelector('.terminal-output');
    expect(output.children.length).toBe(0);
  });

  it('should change prompt', () => {
    terminal.setPrompt('$ ');
    const prompt = container.querySelector('.terminal-prompt');
    expect(prompt.textContent).toBe('$ ');
  });

  it('should register and execute commands', () => {
    let executed = false;
    terminal.registerCommand('test', () => {
      executed = true;
    });
    
    terminal.executeCommand('test');
    expect(executed).toBe(true);
  });

  it('should handle command with arguments', () => {
    let receivedArgs = [];
    terminal.registerCommand('echo', (args) => {
      receivedArgs = args;
    });
    
    terminal.executeCommand('echo hello world');
    expect(receivedArgs).toEqual(['hello', 'world']);
  });

  it('should maintain command history', () => {
    // Simulate entering commands
    terminal.currentInput = 'command1';
    terminal.handleEnter();
    
    terminal.currentInput = 'command2';
    terminal.handleEnter();
    
    expect(terminal.commandHistory).toContain('command1');
    expect(terminal.commandHistory).toContain('command2');
  });

  it('should handle backspace', () => {
    terminal.currentInput = 'hello';
    terminal.cursorPosition = 5;
    terminal.handleBackspace();
    
    expect(terminal.currentInput).toBe('hell');
    expect(terminal.cursorPosition).toBe(4);
  });

  it('should handle character input', () => {
    terminal.currentInput = '';
    terminal.cursorPosition = 0;
    terminal.handleCharacterInput('a');
    
    expect(terminal.currentInput).toBe('a');
    expect(terminal.cursorPosition).toBe(1);
  });

  it('should navigate history with arrow keys', () => {
    terminal.commandHistory = ['cmd1', 'cmd2', 'cmd3'];
    terminal.historyIndex = 3;
    
    terminal.handleArrowUp();
    expect(terminal.currentInput).toBe('cmd3');
    
    terminal.handleArrowUp();
    expect(terminal.currentInput).toBe('cmd2');
    
    terminal.handleArrowDown();
    expect(terminal.currentInput).toBe('cmd3');
  });

  it('should maintain scrollback buffer limit', () => {
    // Write more than maxLines
    for (let i = 0; i < 1100; i++) {
      terminal.writeLine(`Line ${i}`);
    }
    
    expect(terminal.lines.length).toBeLessThanOrEqual(1000);
  });
});
