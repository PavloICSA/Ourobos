// Virtual Filesystem for ChimeraOS
// Provides in-memory file storage for programs and data

export class VirtualFilesystem {
  constructor() {
    this.files = new Map();
    this.currentDir = '/';
    this.initializeDefaultFiles();
  }

  initializeDefaultFiles() {
    // Create default directories
    this.mkdir('/programs');
    this.mkdir('/data');
    this.mkdir('/scripts');
    
    // Create welcome file
    this.writeFile('/README.txt', 
      'Welcome to ChimeraOS Virtual Filesystem\n' +
      '\n' +
      'This is a virtual in-memory filesystem for storing programs,\n' +
      'scripts, and data. Files are organized in directories and can\n' +
      'be created, edited, and executed.\n' +
      '\n' +
      'Use "ls" to list files, "cat" to read, and "write" to create.\n'
    );
    
    // Create example Lisp program
    this.writeFile('/programs/hello.lisp',
      '; Simple hello world program\n' +
      '(def greet (lambda (name)\n' +
      '  (list "Hello" name)))\n' +
      '\n' +
      '(greet "ChimeraOS")\n'
    );
    
    // Create example ALGOL program
    this.writeFile('/programs/evolve.algol',
      'BEGIN\n' +
      '  REAL energy := 100.0;\n' +
      '  REAL mutation_rate := 0.05;\n' +
      '  \n' +
      '  energy := energy * 1.1;\n' +
      '  mutation_rate := mutation_rate * 0.95;\n' +
      'END\n'
    );
  }

  // Path utilities
  normalizePath(path) {
    if (!path.startsWith('/')) {
      path = this.currentDir + '/' + path;
    }
    
    // Resolve . and ..
    const parts = path.split('/').filter(p => p && p !== '.');
    const resolved = [];
    
    for (const part of parts) {
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }
    
    return '/' + resolved.join('/');
  }

  getParentPath(path) {
    const normalized = this.normalizePath(path);
    const parts = normalized.split('/').filter(p => p);
    parts.pop();
    return '/' + parts.join('/');
  }

  getBasename(path) {
    const normalized = this.normalizePath(path);
    const parts = normalized.split('/').filter(p => p);
    return parts[parts.length - 1] || '/';
  }

  // File operations
  exists(path) {
    const normalized = this.normalizePath(path);
    return this.files.has(normalized);
  }

  isDirectory(path) {
    const normalized = this.normalizePath(path);
    const entry = this.files.get(normalized);
    return entry && entry.type === 'directory';
  }

  isFile(path) {
    const normalized = this.normalizePath(path);
    const entry = this.files.get(normalized);
    return entry && entry.type === 'file';
  }

  mkdir(path) {
    const normalized = this.normalizePath(path);
    
    if (this.exists(normalized)) {
      throw new Error(`Path already exists: ${normalized}`);
    }
    
    // Create parent directories if needed
    const parent = this.getParentPath(normalized);
    if (parent !== '/' && !this.exists(parent)) {
      this.mkdir(parent);
    }
    
    this.files.set(normalized, {
      type: 'directory',
      created: Date.now(),
      modified: Date.now()
    });
  }

  writeFile(path, content) {
    const normalized = this.normalizePath(path);
    
    // Create parent directory if needed
    const parent = this.getParentPath(normalized);
    if (parent !== '/' && !this.exists(parent)) {
      this.mkdir(parent);
    }
    
    const now = Date.now();
    const existing = this.files.get(normalized);
    
    this.files.set(normalized, {
      type: 'file',
      content: content,
      created: existing ? existing.created : now,
      modified: now,
      size: content.length
    });
  }

  readFile(path) {
    const normalized = this.normalizePath(path);
    const entry = this.files.get(normalized);
    
    if (!entry) {
      throw new Error(`File not found: ${normalized}`);
    }
    
    if (entry.type !== 'file') {
      throw new Error(`Not a file: ${normalized}`);
    }
    
    return entry.content;
  }

  deleteFile(path) {
    const normalized = this.normalizePath(path);
    
    if (!this.exists(normalized)) {
      throw new Error(`File not found: ${normalized}`);
    }
    
    if (this.isDirectory(normalized)) {
      // Check if directory is empty
      const children = this.listDirectory(normalized);
      if (children.length > 0) {
        throw new Error(`Directory not empty: ${normalized}`);
      }
    }
    
    this.files.delete(normalized);
  }

  listDirectory(path = null) {
    const normalized = path ? this.normalizePath(path) : this.currentDir;
    
    if (!this.exists(normalized) && normalized !== '/') {
      throw new Error(`Directory not found: ${normalized}`);
    }
    
    const prefix = normalized === '/' ? '/' : normalized + '/';
    const entries = [];
    
    for (const [filePath, entry] of this.files.entries()) {
      if (filePath.startsWith(prefix) && filePath !== normalized) {
        const relativePath = filePath.substring(prefix.length);
        
        // Only include direct children (not nested)
        if (!relativePath.includes('/')) {
          entries.push({
            name: relativePath,
            path: filePath,
            type: entry.type,
            size: entry.size || 0,
            created: entry.created,
            modified: entry.modified
          });
        }
      }
    }
    
    return entries.sort((a, b) => {
      // Directories first, then alphabetical
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  changeDirectory(path) {
    const normalized = this.normalizePath(path);
    
    if (normalized !== '/' && !this.exists(normalized)) {
      throw new Error(`Directory not found: ${normalized}`);
    }
    
    if (normalized !== '/' && !this.isDirectory(normalized)) {
      throw new Error(`Not a directory: ${normalized}`);
    }
    
    this.currentDir = normalized;
  }

  getCurrentDirectory() {
    return this.currentDir;
  }

  // Search operations
  find(pattern) {
    const regex = new RegExp(pattern);
    const results = [];
    
    for (const [path, entry] of this.files.entries()) {
      if (entry.type === 'file' && regex.test(path)) {
        results.push({
          path,
          name: this.getBasename(path),
          size: entry.size,
          modified: entry.modified
        });
      }
    }
    
    return results;
  }

  grep(pattern, path = null) {
    const regex = new RegExp(pattern, 'i');
    const results = [];
    
    const searchFiles = path 
      ? [this.normalizePath(path)]
      : Array.from(this.files.keys()).filter(p => this.isFile(p));
    
    for (const filePath of searchFiles) {
      try {
        const content = this.readFile(filePath);
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            results.push({
              path: filePath,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return results;
  }

  // Get file info
  stat(path) {
    const normalized = this.normalizePath(path);
    const entry = this.files.get(normalized);
    
    if (!entry) {
      throw new Error(`Path not found: ${normalized}`);
    }
    
    return {
      path: normalized,
      type: entry.type,
      size: entry.size || 0,
      created: new Date(entry.created),
      modified: new Date(entry.modified)
    };
  }
}
