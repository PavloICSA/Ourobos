# ChimeraVisualizer Quick Start

Get the enhanced visualization system running in 5 minutes.

## Quick Test

1. **Open the test page:**
   ```bash
   # Start a local server (if not already running)
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/src/visualization/test.html
   ```

3. **Test the features:**
   - Click "Add Blockchain Gen" to add blockchain generations
   - Click "Update Quantum" to change quantum entropy status
   - Click "Update Sensors" to update bio sensor readings
   - Click "Update Clusters" to add neural cluster decisions
   - Use zoom controls to explore the fractal
   - Toggle animation to see real-time updates

## Integration Example

```javascript
import { ChimeraVisualizer } from './visualization/chimera-visualizer.js';
import { ChimeraOrchestrator } from './orchestrator/chimera-orchestrator.js';

// Create canvas
const canvas = document.getElementById('visualization');

// Create visualizer
const visualizer = new ChimeraVisualizer(canvas, 1200, 800);

// Create orchestrator
const orchestrator = new ChimeraOrchestrator();

// Connect them
orchestrator.setVisualizer(visualizer);

// Initialize
await orchestrator.init();

// Update visualization when state changes
orchestrator.on('mutationComplete', () => {
  const state = orchestrator.getCurrentState();
  visualizer.updateState(state);
});

// Start animation
visualizer.startAnimation();
```

## What You'll See

### 1. Neural Topology Fractal (Top-Left)
- Mandelbrot set colored by cluster activity
- Green areas show high neural activity
- Darker areas show lower activity

### 2. Blockchain Timeline (Top-Right)
- Current generation number
- Last genome hash (truncated)
- Pending proposal status
- Recent generation history with verification marks (✓)

### 3. Quantum Entropy Status (Middle-Right)
- Backend type (hardware/simulator/mock)
- Online/offline status
- Entropy pool level bar (0-10)
- Bits used and last generation time

### 4. Bio Sensor Readings (Bottom-Left)
- Light, temperature, acceleration bars
- Real/mock mode indicator
- Online/offline status
- Average influence percentage

### 5. Neural Cluster Status (Bottom-Right)
- Active cluster count
- Per-cluster action and confidence
- Color-coded confidence bars:
  - Green: High confidence (>70%)
  - Yellow: Medium confidence (40-70%)
  - Orange: Low confidence (<40%)

## Interactive Controls

- **Zoom In/Out**: Adjust fractal zoom level
- **Pan**: Move fractal view (programmatically)
- **Reset View**: Return to default fractal view
- **Toggle Animation**: Start/stop 30 FPS animation loop
- **Clear Data**: Reset all visualization data

## Running the Integration Test

```bash
# Open browser console and run:
npm run dev

# Then navigate to:
http://localhost:3000/src/visualization/integration-test.js
```

The test will verify:
- ✓ Visualizer creation
- ✓ State updates
- ✓ Blockchain history
- ✓ Quantum status
- ✓ Sensor readings
- ✓ Cluster decisions
- ✓ Rendering
- ✓ Fractal controls
- ✓ Animation control
- ✓ Data clearing

## Next Steps

1. **Integrate with orchestrator** - Connect to ChimeraOrchestrator for live data
2. **Add event listeners** - React to blockchain, quantum, and sensor events
3. **Customize layout** - Adjust panel sizes in the layout configuration
4. **Add interactions** - Implement mouse controls for fractal zoom/pan
5. **Extend rendering** - Add more visualization features as needed

## Troubleshooting

**Canvas is blank:**
- Check that canvas element exists in DOM
- Verify canvas dimensions are set correctly
- Call `visualizer.render()` after updates

**Animation not smooth:**
- Check browser performance
- Reduce fractal maxIterations for faster rendering
- Verify 30 FPS throttling is working

**Data not updating:**
- Ensure you call `visualizer.render()` after data updates
- Or use `visualizer.startAnimation()` for automatic updates
- Check that data is being passed correctly

## Performance Tips

- Keep fractal maxIterations under 150 for real-time rendering
- Use animation loop for continuous updates
- Limit blockchain history to last 10 generations
- Throttle sensor updates to every 1-2 seconds

## Color Reference

- **Green (#00ff00)**: Blockchain, bio sensors, success states
- **Cyan (#00ffff)**: Quantum entropy
- **Magenta (#ff00ff)**: Neural clusters
- **Yellow (#ffff00)**: Warnings, medium confidence
- **Orange (#ff8800)**: Mock mode, low confidence
- **Red (#ff0000)**: Errors, offline states

Enjoy visualizing your chimeric digital organism! 🧬
