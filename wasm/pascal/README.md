# Pascal WASM Module

Pascal terminal compiled to WebAssembly for OuroborOS-Chimera.

## Overview

This directory contains the Pascal source code and build scripts for compiling the terminal interface to WebAssembly. The Pascal code handles command parsing and validation, while JavaScript handles I/O and orchestration.

## Files

- `terminal.pas` - Pascal source code for terminal logic
- `build.sh` - Linux/Mac build script
- `build.cmd` - Windows build script
- `README.md` - This file

## Prerequisites

### Option 1: Free Pascal with WASM Support (Recommended)

Free Pascal WASM support is experimental as of 2024. You may need to build FPC from source with WASM target enabled.

**Installation:**

```bash
# Ubuntu/Debian
sudo apt-get install fp-compiler

# macOS
brew install fpc

# Windows
# Download from https://www.freepascal.org/
# Or use Chocolatey: choco install freepascal
```

**Building FPC with WASM Support:**

```bash
# Clone FPC repository
git clone https://gitlab.com/freepascal.org/fpc/source.git fpc-source
cd fpc-source

# Build with WASM target
make clean
make all OPT="-dWASM"
make install
```

See: https://wiki.freepascal.org/WebAssembly

### Option 2: pas2js (JavaScript Fallback)

If WASM target is not available, the build scripts will fall back to pas2js, which compiles Pascal to JavaScript.

```bash
# Install pas2js
npm install -g pas2js
```

### Option 3: Emscripten (Alternative)

You can also use Emscripten to compile Pascal to WASM:

1. Install Emscripten SDK
2. Compile Pascal to C using p2c or fpc
3. Compile C to WASM using emcc

## Building

### Quick Build

```bash
# Linux/Mac
./build.sh

# Windows
build.cmd
```

### Manual Build

```bash
# Using Free Pascal with WASM target
fpc -Twasm -O3 -Xs -XX -CX terminal.pas -o../../public/wasm/pascal/terminal.wasm

# Using pas2js (JavaScript output)
pas2js -Jirtl -Jc terminal.pas -o../../public/wasm/pascal/terminal.js
```

### Build Options

- `-Twasm` - Target WebAssembly
- `-O3` - Optimization level 3
- `-Xs` - Strip symbols
- `-XX` - Smart linking
- `-CX` - Create smartlinked units

## Output

The build produces:

- `../../public/wasm/pascal/terminal.wasm` - WebAssembly binary (if WASM target available)
- `../../public/wasm/pascal/terminal.js` - JavaScript fallback (if using pas2js)

## Pascal Code Structure

### Exports

The Pascal module exports these functions for JavaScript:

```pascal
procedure Initialize; cdecl; export;
procedure ProcessCommand(cmdPtr: PChar); cdecl; export;
function IsRunning: Boolean; cdecl; export;
```

### Imports

The Pascal module imports these functions from JavaScript:

```pascal
procedure JSBridge_SubmitProposal(code: PChar; language: PChar); external 'env';
procedure JSBridge_Vote(proposalId: LongInt; support: Boolean); external 'env';
procedure JSBridge_QueryBlockchain(generation: LongInt); external 'env';
procedure JSBridge_GetQuantumEntropy; external 'env';
procedure JSBridge_GetBioSensors; external 'env';
procedure JSBridge_GetStatus; external 'env';
procedure JSBridge_DisplayText(text: PChar); external 'env';
procedure JSBridge_DisplayError(text: PChar); external 'env';
procedure JSBridge_DisplaySuccess(text: PChar); external 'env';
procedure JSBridge_DisplayInfo(text: PChar); external 'env';
```

## Command Parsing

The Pascal code handles:

1. **Command Type Detection** - Identifies command from first word
2. **Argument Parsing** - Splits arguments respecting quotes
3. **Validation** - Checks required arguments and types
4. **Bridge Calls** - Invokes JavaScript functions via WASM imports

### Supported Commands

- `propose-mutation <language> <code>` - Submit mutation proposal
- `vote <id> <yes|no>` - Vote on proposal
- `query-chain <generation>` - Query blockchain
- `quantum-entropy` - Get quantum entropy
- `bio-sensors` - Read bio sensors
- `status` - Get organism status
- `help` - Show help
- `exit` - Exit terminal

## Memory Management

### String Handling

- **Pascal → JavaScript**: Null-terminated C strings via PChar
- **JavaScript → Pascal**: Strings written to WASM memory
- **Encoding**: UTF-8 for all strings

### Memory Layout

```
WASM Memory:
┌─────────────────────────────────────┐
│  Pascal Runtime Data                │
├─────────────────────────────────────┤
│  String Buffers                     │
├─────────────────────────────────────┤
│  Command Buffer (1024 bytes)        │
├─────────────────────────────────────┤
│  Input Buffer (256 bytes)           │
└─────────────────────────────────────┘
```

## Testing

### Unit Tests

```bash
# Test compilation
./build.sh

# Check output exists
ls -lh ../../public/wasm/pascal/terminal.wasm
```

### Integration Tests

```javascript
// Load and test Pascal WASM
import { PascalBridge } from './src/pascal/pascal-bridge.js';

const bridge = new PascalBridge();
await bridge.load('/wasm/pascal/terminal.wasm');

// Test command processing
bridge.processCommand('help');
bridge.processCommand('status');
```

## Debugging

### Enable Debug Output

```bash
# Compile with debug symbols
fpc -Twasm -g -gl terminal.pas -o../../public/wasm/pascal/terminal.wasm
```

### Browser DevTools

1. Open browser DevTools
2. Go to Sources tab
3. Look for `terminal.wasm` in file tree
4. Set breakpoints in WASM code
5. Inspect memory and variables

### Console Logging

Add debug output in Pascal:

```pascal
JSBridge_DisplayInfo(PChar('Debug: Command received'));
```

## Performance

- **Module Size**: ~50-100 KB (WASM) or ~30-50 KB (JavaScript)
- **Load Time**: <100ms
- **Command Parse**: <1ms
- **Memory Usage**: ~1 MB

## Limitations

### Current Limitations

1. **WASM Support**: Free Pascal WASM target is experimental
2. **Memory Allocation**: Simplified string allocation (no proper allocator)
3. **Error Handling**: Basic error messages
4. **Multi-line Input**: Not supported yet

### Workarounds

1. **Use pas2js**: Compiles to JavaScript instead of WASM
2. **Use Emscripten**: Compile via C intermediate
3. **JavaScript Fallback**: Implement commands in JavaScript

## Future Enhancements

- [ ] Proper memory allocator for strings
- [ ] Multi-line code input
- [ ] Command history in Pascal layer
- [ ] Tab completion
- [ ] Syntax highlighting
- [ ] Interactive proposal browser

## Troubleshooting

### Build Fails: "Unknown target WASM"

**Solution**: WASM target not available in your FPC installation. Options:
1. Build FPC from source with WASM support
2. Use pas2js fallback
3. Use Emscripten toolchain

### Build Fails: "fpc: command not found"

**Solution**: Install Free Pascal Compiler:
```bash
# Ubuntu/Debian
sudo apt-get install fp-compiler

# macOS
brew install fpc

# Windows
# Download from https://www.freepascal.org/
```

### WASM Module Won't Load

**Solution**: Check:
1. File exists at `/wasm/pascal/terminal.wasm`
2. Server serves WASM with correct MIME type (`application/wasm`)
3. Browser supports WebAssembly
4. No CORS issues

### String Encoding Issues

**Solution**: Ensure:
1. All strings are null-terminated
2. UTF-8 encoding is used
3. Memory boundaries are respected

## Resources

- [Free Pascal Documentation](https://www.freepascal.org/docs.html)
- [WebAssembly Specification](https://webassembly.org/)
- [Free Pascal WASM Wiki](https://wiki.freepascal.org/WebAssembly)
- [pas2js Documentation](https://wiki.freepascal.org/pas2js)

## License

Same as OuroborOS-Chimera project.
