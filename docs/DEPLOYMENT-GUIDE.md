# Deployment Guide

**Repository:** https://www.github.com/PavloICSA/Ourobos.git

Complete guide for deploying OuroborOS-Chimera to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Deployment Platforms](#deployment-platforms)
  - [Netlify](#netlify)
  - [Firebase Hosting](#firebase-hosting)
  - [Vercel](#vercel)
  - [Custom Server](#custom-server)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ All WASM build tools installed (Rust, Emscripten, Go, Free Pascal)
- ✅ Smart contracts deployed (if using blockchain)
- ✅ External services configured (quantum, bio sensors)
- ✅ Environment variables configured
- ✅ Tests passing

---

## Build Process

### Automated Build

Use the deployment script for automated building:

**Linux/macOS:**
```bash
bash scripts/deploy.sh production
```

**Windows:**
```cmd
scripts\deploy.cmd production
```

This script:
1. Cleans previous builds
2. Installs dependencies
3. Runs tests
4. Builds smart contracts
5. Builds all WASM modules
6. Optimizes WASM with wasm-opt
7. Builds frontend with Vite
8. Verifies build output

---

### Manual Build

If you prefer manual control:

```bash
# 1. Clean
rm -rf dist
rm -rf public/wasm/*.wasm

# 2. Install dependencies
npm install

# 3. Build contracts
cd contracts
npx hardhat compile
cd ..

# 4. Build WASM modules
npm run build:wasm

# 5. Optimize WASM (optional but recommended)
bash scripts/optimize-wasm.sh

# 6. Build frontend
NODE_ENV=production npm run build

# 7. Verify
ls -lh dist/
```

---

### Build Output

After building, you should have:

```
dist/
├── index.html
├── assets/
│   ├── js/
│   │   ├── main-[hash].js
│   │   ├── d3-vendor-[hash].js
│   │   ├── ethers-vendor-[hash].js
│   │   ├── blockchain-[hash].js
│   │   ├── quantum-[hash].js
│   │   └── ...
│   ├── css/
│   │   └── main-[hash].css
│   └── wasm/
│       ├── ouroboros_rust_bg.wasm
│       ├── fortran_engine.wasm
│       ├── neural_cluster.wasm
│       └── terminal.wasm
└── contracts/
    └── config.json
```

---

## Deployment Platforms

### Netlify

**Recommended for:** Quick deployment, automatic builds from Git

#### Method 1: Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   # Test deployment
   netlify deploy
   
   # Production deployment
   netlify deploy --prod
   ```

#### Method 2: Git Integration

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Select your repository
   - Configure build settings:
     - **Build command:** `npm run build:optimized`
     - **Publish directory:** `dist`

3. **Set environment variables:**
   - Go to Site settings → Environment variables
   - Add your production variables:
     ```
     VITE_BLOCKCHAIN_RPC=https://sepolia.infura.io/v3/YOUR_KEY
     VITE_CONTRACT_ADDRESS=0x...
     VITE_QUANTUM_API=https://quantum-api.example.com
     VITE_BIOSENSOR_API=https://biosensor-api.example.com
     ```

4. **Deploy:**
   - Netlify automatically builds and deploys on push

#### Configuration

The `netlify.toml` file is already configured with:
- WASM MIME types
- Security headers
- CORS headers
- Cache control
- SPA redirects

---

### Firebase Hosting

**Recommended for:** Google Cloud integration, global CDN

#### Setup

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login:**
   ```bash
   firebase login
   ```

3. **Initialize (if not already done):**
   ```bash
   firebase init hosting
   ```
   
   Select:
   - Public directory: `dist`
   - Single-page app: `Yes`
   - GitHub integration: Optional

4. **Build:**
   ```bash
   npm run build:optimized
   ```

5. **Deploy:**
   ```bash
   # Test deployment
   firebase hosting:channel:deploy preview
   
   # Production deployment
   firebase deploy --only hosting
   ```

#### Configuration

The `firebase.json` file is already configured with:
- WASM MIME types
- Security headers
- CORS headers
- Cache control
- SPA rewrites

---

### Vercel

**Recommended for:** Next.js-like experience, edge functions

#### Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   # Test deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

#### Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build:optimized",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        }
      ]
    },
    {
      "source": "/(.*).wasm",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/wasm"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Custom Server

**Recommended for:** Full control, custom infrastructure

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name ouroboros-chimera.example.com;
    
    root /var/www/ouroboros-chimera/dist;
    index index.html;
    
    # Security headers
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    
    # WASM MIME type
    location ~* \.wasm$ {
        types {
            application/wasm wasm;
        }
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # JavaScript and CSS caching
    location ~* \.(js|css)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # CORS for API proxying (optional)
    location /api/quantum/ {
        proxy_pass http://quantum-service:5000/api/quantum/;
        add_header Access-Control-Allow-Origin "*";
    }
    
    location /api/biosensor/ {
        proxy_pass http://biosensor-service:5001/api/sensors/;
        add_header Access-Control-Allow-Origin "*";
    }
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName ouroboros-chimera.example.com
    DocumentRoot /var/www/ouroboros-chimera/dist
    
    # Security headers
    Header always set Cross-Origin-Opener-Policy "same-origin"
    Header always set Cross-Origin-Embedder-Policy "require-corp"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    
    # WASM MIME type
    AddType application/wasm .wasm
    
    # Caching
    <FilesMatch "\.(wasm|js|css)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # SPA routing
    <Directory /var/www/ouroboros-chimera/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
# Blockchain
VITE_BLOCKCHAIN_RPC=https://sepolia.infura.io/v3/YOUR_KEY
VITE_CHAIN_ID=11155111
VITE_CONTRACT_ADDRESS=0x1234567890abcdef...
VITE_BLOCKCHAIN_MOCK=false

# Quantum
VITE_QUANTUM_API=https://quantum-api.example.com
VITE_QUANTUM_MOCK=false

# Bio Sensors
VITE_BIOSENSOR_API=https://biosensor-api.example.com
VITE_BIOSENSOR_MOCK=false

# Services
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_QUANTUM=true
VITE_ENABLE_BIOSENSOR=true

# Performance
VITE_ENABLE_MONITORING=true
VITE_LOG_LEVEL=error

# Build
VITE_SOURCEMAP=false
```

### Security Considerations

**Never commit:**
- Private keys
- API tokens
- Wallet mnemonics
- Service credentials

**Use environment variables for:**
- RPC URLs
- API endpoints
- Contract addresses
- Feature flags

**Enable in production:**
- HTTPS only
- Security headers
- Rate limiting
- Input validation

---

## Post-Deployment

### Verification Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] WASM modules load without errors
- [ ] Blockchain connection works
- [ ] Quantum service responds
- [ ] Bio sensor service responds (or mock mode)
- [ ] Terminal commands work
- [ ] Mutations can be proposed
- [ ] Voting works
- [ ] Visualization renders
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Mobile responsive

### Testing

```bash
# Test production build locally
npm run preview

# Open in browser
open http://localhost:4173

# Run smoke tests
npm run test:e2e
```

### Performance Testing

```bash
# Lighthouse audit
npx lighthouse https://your-site.com --view

# Bundle analysis
npm run analyze
```

---

## Monitoring

### Performance Monitoring

Use the built-in performance monitor:

```javascript
import { performanceMonitor } from './src/monitoring/performance-monitor.js';

// Enable monitoring
performanceMonitor.setEnabled(true);

// Check health
const health = performanceMonitor.checkHealth();
console.log('System health:', health);

// Export metrics
const metrics = performanceMonitor.exportMetrics();
```

### Error Tracking

Integrate with error tracking services:

**Sentry:**
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

**LogRocket:**
```javascript
import LogRocket from 'logrocket';

LogRocket.init('your-app/ouroboros-chimera');
```

### Analytics

Track usage with analytics:

**Google Analytics:**
```javascript
import { gtag } from 'ga-gtag';

gtag('config', 'GA_MEASUREMENT_ID');
```

---

## Troubleshooting

### WASM Loading Issues

**Problem:** WASM modules fail to load

**Solutions:**
1. Check MIME type: `Content-Type: application/wasm`
2. Verify CORS headers
3. Check file paths in network tab
4. Ensure WASM files are in `dist/assets/wasm/`

---

### Security Header Issues

**Problem:** SharedArrayBuffer not available

**Solutions:**
1. Verify headers:
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Embedder-Policy: require-corp`
2. Check browser console for errors
3. Test with `curl -I https://your-site.com`

---

### Performance Issues

**Problem:** Slow load times

**Solutions:**
1. Enable WASM optimization: `bash scripts/optimize-wasm.sh`
2. Check bundle size: `npm run analyze`
3. Enable lazy loading for optional services
4. Use CDN for static assets
5. Enable compression (gzip/brotli)

---

### Service Connection Issues

**Problem:** Cannot connect to external services

**Solutions:**
1. Check CORS configuration
2. Verify API endpoints in environment variables
3. Test endpoints directly: `curl https://api.example.com/health`
4. Enable mock mode as fallback
5. Check network tab for failed requests

---

## Rollback Procedure

If deployment fails:

1. **Netlify/Vercel:**
   - Go to Deployments
   - Click on previous successful deployment
   - Click "Publish deploy"

2. **Firebase:**
   ```bash
   firebase hosting:rollback
   ```

3. **Custom Server:**
   ```bash
   # Restore previous build
   cp -r dist.backup dist
   ```

---

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build:optimized
        env:
          VITE_BLOCKCHAIN_RPC: ${{ secrets.BLOCKCHAIN_RPC }}
          VITE_CONTRACT_ADDRESS: ${{ secrets.CONTRACT_ADDRESS }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## Next Steps

- [User Guide](USER-GUIDE.md) - Learn how to use the deployed system
- [Monitoring Guide](MONITORING.md) - Set up monitoring and alerts
- [Scaling Guide](SCALING.md) - Scale for high traffic
