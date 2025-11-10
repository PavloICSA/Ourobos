# Deploy OuroborOS-Chimera NOW (No Docker, No WASM Build)

## 🚀 Fastest Path to Live Demo (5 Minutes)

### Step 1: Choose Your Platform

Pick ONE of these options:

#### Option A: Netlify (Recommended)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### Option B: Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Option C: Firebase
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

### Step 2: Configure Mock Mode

After deployment, set these environment variables in your platform's dashboard:

```
VITE_BLOCKCHAIN_MOCK=true
VITE_QUANTUM_MOCK=true
VITE_BIOSENSOR_MOCK=true
```

**For Netlify:**
- Go to: Site settings → Environment variables
- Add the three variables above
- Click "Redeploy"

**For Vercel:**
- Go to: Project settings → Environment Variables
- Add the three variables above
- Redeploy from dashboard

**For Firebase:**
- Environment variables are set in `.env.production.mock` (already created)
- Just deploy again: `firebase deploy --only hosting`

### Step 3: Done! 🎉

Your app is now live and fully functional in mock mode.

---

## What You Get in Mock Mode

✅ **Full UI Experience**
- Retro terminal interface
- All commands working
- Real-time visualization
- Graph and fractal views

✅ **Core Functionality**
- Lisp interpreter with self-modification
- ALGOL DSL compiler
- Organism simulation
- State persistence (browser storage)

✅ **Simulated Services**
- Mock blockchain (simulated mutations/voting)
- Mock quantum entropy (crypto-random)
- Mock bio sensors (simulated environmental data)

❌ **Not Available**
- Real blockchain transactions (requires deployed contracts)
- True quantum randomness (requires quantum service)
- Physical sensor data (requires Raspberry Pi sensors)
- WASM performance optimizations (requires WASM build)

---

## Build Configuration

The project is now configured for quick deployment:

- **netlify.toml**: Uses `build:quick` (JavaScript only, no WASM)
- **firebase.json**: Configured with proper headers
- **.env.production.mock**: Mock mode environment variables
- **package.json**: Added `build:quick` script

---

## Testing Locally First (Optional)

If you want to test before deploying:

1. **Create `.env.local`:**
   ```bash
   VITE_BLOCKCHAIN_MOCK=true
   VITE_QUANTUM_MOCK=true
   VITE_BIOSENSOR_MOCK=true
   ```

2. **Start dev server:**
   ```bash
   npm install
   npm run dev
   ```

3. **Open:** http://localhost:3000

---

## Troubleshooting

### "Command not found: netlify/vercel/firebase"

**Solution:** Install the CLI tool first:
```bash
npm install -g netlify-cli
# or
npm install -g vercel
# or
npm install -g firebase-tools
```

### "Build failed"

**Solution:** The build should work with just `npm run build:quick`. If it fails:
1. Make sure you have Node.js 18+ installed
2. Run `npm install` first
3. Check the error message - it might be a missing dependency

### "Site loads but shows errors"

**Solution:** Make sure mock mode is enabled:
- Check environment variables are set correctly
- Redeploy after setting variables
- Check browser console for specific errors

### "WASM modules not found"

**Solution:** This is expected! Mock mode doesn't use WASM. The app will work without it.

---

## Next Steps After Deployment

### To Enable Real Services Later:

1. **Deploy Smart Contracts:**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network sepolia
   ```

2. **Start Quantum Service:**
   ```bash
   cd services/quantum
   python quantum_entropy.py
   ```

3. **Start Bio Sensor Service:**
   ```bash
   cd services/biosensor
   python bio_sensor_node.py
   ```

4. **Update Environment Variables:**
   ```
   VITE_BLOCKCHAIN_MOCK=false
   VITE_BLOCKCHAIN_RPC=https://sepolia.infura.io/v3/YOUR_KEY
   VITE_CONTRACT_ADDRESS=0x...
   VITE_QUANTUM_MOCK=false
   VITE_QUANTUM_API=https://your-quantum-api.com
   VITE_BIOSENSOR_MOCK=false
   VITE_BIOSENSOR_API=https://your-biosensor-api.com
   ```

5. **Redeploy**

### To Build WASM Modules:

If you get more disk space and want full performance:

1. **Install build tools:**
   - Rust: https://rustup.rs/
   - wasm-pack: https://rustwasm.github.io/wasm-pack/installer/
   - Emscripten: https://emscripten.org/
   - TinyGo: https://tinygo.org/
   - Free Pascal: https://www.freepascal.org/

2. **Build:**
   ```bash
   npm run build:optimized
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

## Summary

**Right now, to deploy:**

```bash
# Install CLI (choose one)
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Set environment variables in dashboard
# VITE_BLOCKCHAIN_MOCK=true
# VITE_QUANTUM_MOCK=true
# VITE_BIOSENSOR_MOCK=true

# Redeploy
netlify deploy --prod
```

**That's it!** Your app is live and fully functional for showcasing. 🚀
