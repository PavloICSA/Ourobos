# Terminal Module

Retro Pascal/Turbo Pascal-style terminal UI for OuroborOS-Chimera.

## Features

- **Retro Aesthetics**: Green-on-black color scheme with monospace font
- **Text Buffer**: 1000-line scrollback buffer with auto-scroll
- **Cursor Rendering**: Blinking cursor with proper positioning
- **Input Handling**: Full keyboard support including:
  - Character input
  - Backspace, Enter
  - Arrow keys for cursor movement
  - Up/Down arrows for command history navigation
  - Home/End keys
- **Command System**: Extensible command registration and handling
- **Text Styling**: Support for colors (error, warning, success, info, dim) and bold text
- **Output Methods**: `write()` and `writeLine()` for flexible text output

## Usage

### Basic Setup

```javascript
import { Terminal, CommandRegistry } from './terminal/index.js';

// Create terminal
const container = document.getElementById('terminal-container');
const terminal = new Terminal(container);

// Set up command handlers
const commands = new CommandRegistry(terminal, orchestrator);

// Display welcome message
terminal.writeLine('Welcome to OuroborOS-Chimera', 'success');
terminal.writeLine('Type "help" for commands', 'info');
```

### Writing Output

```javascript
// Write text without newline
terminal.write('Population: ');
terminal.writeLine('100', 'success');

// Write with styling
terminal.writeLine('Error occurred', 'error');
terminal.writeLine('Warning message', 'warning');
terminal.writeLine('Success!', 'success');
terminal.writeLine('Information', 'info');
terminal.writeLine('Dimmed text', 'dim');
```

### Custom Commands

```javascript
// Register a custom command
terminal.registerCommand('mycommand', (args) => {
  terminal.writeLine(`Executed with args: ${args.join(', ')}`);
});

// Unregister a command
terminal.unregisterCommand('mycommand');
```

### Built-in Commands

The `CommandRegistry` provides these commands:

- `help` - Display available commands
- `evolve [steps]` - Run evolution for N steps
- `mutate <rule>` - Apply ALGOL mutation rule
- `status` - Display organism state
- `save <name>` - Save snapshot
- `load <name>` - Load snapshot
- `export` - Download .obg file
- `import` - Upload .obg file
- `reset` - Revert to last save
- `clear` - Clear terminal output

### Connecting to Orchestrator

```javascript
// Commands need orchestrator for full functionality
const commands = new CommandRegistry(terminal, orchestrator);

// Or set it later
commands.setOrchestrator(orchestrator);
```

## API Reference

### Terminal Class

#### Constructor
```javascript
new Terminal(container: HTMLElement)
```

#### Methods

- `write(text: string, style?: string): void` - Write text without newline
- `writeLine(text: string, style?: string): void` - Write text with newline
- `clear(): void` - Clear all output
- `setPrompt(prompt: string): void` - Change command prompt
- `onCommand(callback: Function): void` - Set generic command callback
- `registerCommand(name: string, handler: Function): void` - Register command handler
- `unregisterCommand(name: string): void` - Remove command handler

#### Style Options

- `'error'` - Red text
- `'warning'` - Yellow text
- `'success'` - Bold green text
- `'info'` - Cyan text
- `'dim'` - Dark green text
- `'bold'` - Bold text

### CommandRegistry Class

#### Constructor
```javascript
new CommandRegistry(terminal: Terminal, orchestrator?: Orchestrator)
```

#### Methods

- `setOrchestrator(orchestrator: Orchestrator): void` - Connect orchestrator

## Requirements Satisfied

- **3.1**: Retro terminal with monospace green text on black background
- **3.2**: Keyboard input with command history navigation
- **3.3**: Command handlers for evolve, mutate, status, save, load, export, import, reset, help
- **3.4**: Real-time output display with cursor positioning
- **3.5**: Text styling support (colors, bold)

## Implementation Details

### Text Buffer
- Maintains array of line elements
- Automatically removes old lines when exceeding 1000-line limit
- Auto-scrolls to bottom on new output

### Input Handling
- Keyboard events captured on container element
- Cursor position tracked separately from display
- Command history stored in array with index tracking
- Special key handling (arrows, backspace, enter, home, end)

### Cursor Animation
- Blinks every 500ms using setInterval
- Displays character under cursor when not at end of line
- Styled with green background and black text

### Command Parsing
- Splits input on whitespace
- First token is command name (case-insensitive)
- Remaining tokens are arguments
- Looks up handler in registry or uses generic callback

## Future Enhancements

- Tab completion for commands
- Multi-line input support
- Copy/paste support
- Configurable color schemes
- Command aliases
- Input validation
