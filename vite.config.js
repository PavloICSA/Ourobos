import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      // WASM MIME type headers
      'Content-Type': 'application/wasm'
    },
    fs: {
      // Allow serving files from WASM directories
      allow: ['..']
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    // Enable minification with Terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false // Remove comments
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Code splitting for large dependencies
        manualChunks: (id) => {
          // Split d3 into separate chunk
          if (id.includes('node_modules/d3')) {
            return 'd3-vendor';
          }
          // Split ethers into separate chunk
          if (id.includes('node_modules/ethers')) {
            return 'ethers-vendor';
          }
          // Split blockchain components
          if (id.includes('src/blockchain')) {
            return 'blockchain';
          }
          // Split quantum components (lazy load)
          if (id.includes('src/quantum')) {
            return 'quantum';
          }
          // Split biosensor components (lazy load)
          if (id.includes('src/biosensor')) {
            return 'biosensor';
          }
          // Split visualization components
          if (id.includes('src/visualization')) {
            return 'visualization';
          }
          // Split meta-compiler (lazy load)
          if (id.includes('src/metacompiler')) {
            return 'metacompiler';
          }
          // Keep core components in main bundle
          return undefined;
        },
        // Optimize asset file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      },
      // Tree shaking configuration
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    // Enable source maps for debugging (can be disabled for production)
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  optimizeDeps: {
    exclude: ['@wasm'],
    esbuildOptions: {
      target: 'esnext',
      // Enable tree shaking in dependencies
      treeShaking: true
    },
    // Pre-bundle large dependencies
    include: ['d3', 'ethers']
  },
  // WASM plugin configuration
  plugins: [
    {
      name: 'wasm-content-type-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
          }
          next();
        });
      }
    }
  ],
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
