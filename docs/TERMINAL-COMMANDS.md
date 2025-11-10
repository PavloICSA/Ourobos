# Pascal Terminal Commands Reference

Complete reference for all commands available in the OuroborOS-Chimera Pascal terminal.

## Table of Contents

- [Basic Commands](#basic-commands)
- [Blockchain Commands](#blockchain-commands)
- [Mutation Commands](#mutation-commands)
- [Service Commands](#service-commands)
- [Performance Commands](#performance-commands)
- [System Commands](#system-commands)

---

## Basic Commands

### `help`
Display list of available commands.

**Usage:**
```
> help
```

**Output:**
Lists all available commands with brief descriptions.

---

### `clear`
Clear the terminal screen.

**Usage:**
```
> clear
```

---

### `status`
Display current organism status and system health.

**Usage:**
```
> status
```

**Output:**
- Current generation
- Population, energy, mutation rate
- Service health (blockchain, quantum, bio sensors)
- Active neural clusters

---

## Blockchain Commands

### `propose-mutation`
Propose a new mutation to the organism's code.

**Usage:**
```
> propose-mutation
Enter language (algol/lisp/pascal/rust/go/fortran): algol
Enter code: IF population > 100 THEN mutation_rate := 0.05
```

**Parameters:**
- `language`: Source language for the mutation code
- `code`: The mutation code to propose

**Process:**
1. Code is compiled to Ourocode
2. Ourocode is validated
3. Proposal is submitted to blockchain
4. Returns proposal ID

**Example:**
```
> propose-mutation
Language: algol
Code: IF energy < 20 THEN growth_rate := 0.1
Compiling to Ourocode... ✓
Validating... ✓
Submitting to blockchain... ✓
Proposal #42 created
Voting period: 60 seconds
```

---

### `vote`
Vote on an active mutation proposal.

**Usage:**
```
> vote <proposal_id> <yes|no>
```

**Parameters:**
- `proposal_id`: ID of the proposal to vote on
- `vote`: Either `yes` or `no`

**Example:**
```
> vote 42 yes
Voting on proposal #42... ✓
Vote recorded on blockchain
```

---

### `execute-proposal`
Execute an approved mutation proposal.

**Usage:**
```
> execute-proposal <proposal_id>
```

**Parameters:**
- `proposal_id`: ID of the approved proposal

**Process:**
1. Verifies proposal is approved
2. Fetches quantum entropy
3. Reads bio sensor data
4. Executes mutation
5. Updates organism state
6. Records genome hash on blockchain

**Example:**
```
> execute-proposal 42
Executing proposal #42...
Fetching quantum entropy... ✓
Reading bio sensors... ✓
Executing mutation... ✓
Recording genome hash... ✓
Mutation complete! Generation #43
```

---

### `query-chain`
Query blockchain for organism history.

**Usage:**
```
> query-chain [generation]
```

**Parameters:**
- `generation` (optional): Specific generation to query. If omitted, shows current generation.

**Example:**
```
> query-chain 42
Generation: 42
Genome Hash: 0x1234...5678
Block Number: 1337
Timestamp: 2024-01-15 10:30:45
Transaction: 0xabcd...ef01
```

---

### `list-proposals`
List all mutation proposals.

**Usage:**
```
> list-proposals [status]
```

**Parameters:**
- `status` (optional): Filter by status (`active`, `approved`, `rejected`, `executed`)

**Example:**
```
> list-proposals active
Active Proposals:
  #42: IF population > 100... (5 for, 2 against)
  #43: WHILE energy < 50... (3 for, 1 against)
```

---

## Mutation Commands

### `compile`
Compile code to Ourocode without proposing.

**Usage:**
```
> compile <language> <code>
```

**Parameters:**
- `language`: Source language
- `code`: Code to compile

**Example:**
```
> compile algol "IF x > 10 THEN y := 5"
Compiling... ✓
Ourocode:
  @module test
  @version 1.0
  ...
Hash: 0x9876...5432
```

---

### `validate`
Validate Ourocode syntax.

**Usage:**
```
> validate <ourocode_hash>
```

**Parameters:**
- `ourocode_hash`: Hash of Ourocode to validate

**Example:**
```
> validate 0x9876...5432
Validating Ourocode... ✓
Syntax: Valid
Semantic: Valid
```

---

## Service Commands

### `quantum-seed`
Request quantum entropy.

**Usage:**
```
> quantum-seed [bits]
```

**Parameters:**
- `bits` (optional): Number of bits to generate (default: 256)

**Example:**
```
> quantum-seed 256
Requesting quantum entropy...
Backend: ibmq_qasm_simulator
Entropy: 0xabcd...ef01
Bits: 256
Time: 1.2s
```

---

### `sensor-read`
Read current bio sensor values.

**Usage:**
```
> sensor-read
```

**Output:**
```
Bio Sensor Readings:
  Light: 0.65 (65%)
  Temperature: 0.72 (28.8°C)
  Acceleration: 0.31 (6.2 m/s²)
  Timestamp: 2024-01-15 10:30:45
```

---

### `cluster-status`
Display neural cluster status.

**Usage:**
```
> cluster-status [cluster_id]
```

**Parameters:**
- `cluster_id` (optional): Specific cluster ID. If omitted, shows all clusters.

**Example:**
```
> cluster-status
Neural Clusters:
  main: Active (Decision: grow, Confidence: 0.8)
  secondary: Active (Decision: maintain, Confidence: 0.6)
```

---

### `service-health`
Check health of all services.

**Usage:**
```
> service-health
```

**Output:**
```
Service Health:
  ✓ Blockchain: Connected (http://localhost:8545)
  ✓ Quantum: Connected (http://localhost:5000)
  ⚠ Bio Sensors: Mock mode (hardware unavailable)
  ✓ Go WASM: Loaded
  ✓ Rust WASM: Loaded
  ✓ Fortran WASM: Loaded
```

---

## Performance Commands

### `perf-show`
Display performance metrics dashboard.

**Usage:**
```
> perf-show
```

**Output:**
Displays real-time performance metrics for all system components.

---

### `perf-summary`
Show performance summary.

**Usage:**
```
> perf-summary
```

**Output:**
```
Performance Summary:
  Ourocode: 8.5ms avg compile time
  Blockchain: 245ms avg latency
  Quantum: 1.8s avg response (95% cache hit)
  Bio Sensors: 45ms avg latency
  Visualization: 58 FPS
```

---

### `perf-reset`
Reset performance metrics.

**Usage:**
```
> perf-reset
```

---

### `perf-export`
Export performance metrics to JSON file.

**Usage:**
```
> perf-export
```

**Output:**
Downloads `performance-metrics-[timestamp].json` file.

---

### `perf-health`
Check if performance is within acceptable thresholds.

**Usage:**
```
> perf-health
```

**Output:**
```
System Health: healthy
No performance issues detected
```

---

## System Commands

### `save`
Save organism snapshot to file.

**Usage:**
```
> save [filename]
```

**Parameters:**
- `filename` (optional): Name for the snapshot file (default: auto-generated)

**Example:**
```
> save my-organism
Saving snapshot...
Blockchain proof: ✓
Quantum provenance: ✓
Sensor snapshot: ✓
Saved to: my-organism-gen42.obg
```

---

### `load`
Load organism snapshot from file.

**Usage:**
```
> load <filename>
```

**Parameters:**
- `filename`: Name of the snapshot file to load

**Example:**
```
> load my-organism-gen42.obg
Loading snapshot...
Verifying blockchain proof... ✓
Restoring state... ✓
Loaded generation #42
```

---

### `verify`
Verify blockchain proof for loaded snapshot.

**Usage:**
```
> verify
```

**Output:**
```
Verifying blockchain proof...
Genome Hash: 0x1234...5678
On-chain Hash: 0x1234...5678
Status: ✓ VERIFIED
```

---

### `export`
Export organism data in various formats.

**Usage:**
```
> export <format>
```

**Parameters:**
- `format`: Export format (`json`, `csv`, `ourocode`)

**Example:**
```
> export json
Exporting to JSON...
Downloaded: organism-export-[timestamp].json
```

---

### `config`
Display or update configuration.

**Usage:**
```
> config [key] [value]
```

**Parameters:**
- `key` (optional): Configuration key to view/update
- `value` (optional): New value for the key

**Examples:**
```
> config
Current Configuration:
  blockchain.rpcUrl: http://localhost:8545
  quantum.useMock: false
  ...

> config quantum.useMock true
Updated: quantum.useMock = true
```

---

### `version`
Display system version information.

**Usage:**
```
> version
```

**Output:**
```
OuroborOS-Chimera v1.0.0
Components:
  Rust WASM: v0.1.0
  Fortran WASM: v0.1.0
  Go WASM: v0.1.0
  Pascal Terminal: v0.1.0
  Solidity Contracts: v0.1.0
```

---

### `exit`
Exit the terminal (if running in standalone mode).

**Usage:**
```
> exit
```

---

## Command Aliases

Some commands have shorter aliases:

| Command | Alias |
|---------|-------|
| `propose-mutation` | `propose` |
| `execute-proposal` | `execute` |
| `query-chain` | `query` |
| `list-proposals` | `list` |
| `service-health` | `health` |
| `perf-show` | `perf` |

---

## Tips & Tricks

### Command History
- Use **↑** and **↓** arrow keys to navigate command history
- Use **Tab** for command auto-completion

### Batch Commands
Execute multiple commands in sequence:
```
> propose-mutation; vote 42 yes; execute-proposal 42
```

### Output Redirection
Save command output to file:
```
> status > organism-status.txt
```

### Variables
Store values in variables:
```
> set proposal_id 42
> vote $proposal_id yes
```

---

## Error Messages

Common error messages and their meanings:

| Error | Meaning | Solution |
|-------|---------|----------|
| `Blockchain not connected` | Cannot reach blockchain node | Check RPC URL, start local node, or enable mock mode |
| `Proposal not found` | Invalid proposal ID | Use `list-proposals` to see valid IDs |
| `Voting period ended` | Cannot vote on closed proposal | Proposal voting period has expired |
| `Ourocode validation failed` | Invalid Ourocode syntax | Check code syntax and try again |
| `Quantum service unavailable` | Cannot reach quantum API | Check quantum service or enable mock mode |
| `Insufficient votes` | Proposal doesn't meet quorum | Wait for more votes or adjust quorum settings |

---

## See Also

- [User Guide](USER-GUIDE.md) - Complete user guide
- [Architecture](ARCHITECTURE.md) - System architecture
- [Service Setup](SERVICE-SETUP.md) - Setting up services
