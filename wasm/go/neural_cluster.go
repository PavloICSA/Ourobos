// Package main implements neural clusters for OuroborOS-Chimera
// Neural clusters are concurrent decision-making processes using Go goroutines
package main

import (
	"encoding/json"
	"syscall/js"
	"sync"
	"time"
)

// NeuralCluster represents a concurrent decision-making process
type NeuralCluster struct {
	ID        string
	State     map[string]float64
	Active    bool
	mutex     sync.RWMutex
	decisions chan Decision
	stopChan  chan struct{}
}

// Decision represents a decision made by a neural cluster
type Decision struct {
	ClusterID  string  `json:"clusterId"`
	Action     string  `json:"action"`
	Confidence float64 `json:"confidence"`
	Timestamp  int64   `json:"timestamp"`
}

var (
	clusters      = make(map[string]*NeuralCluster)
	clusterMutex  sync.RWMutex
)

// createCluster creates a new neural cluster and starts its decision-making goroutine
func createCluster(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("error: cluster ID required")
	}
	
	id := args[0].String()
	
	cluster := &NeuralCluster{
		ID:        id,
		State:     make(map[string]float64),
		Active:    true,
		decisions: make(chan Decision, 100),
		stopChan:  make(chan struct{}),
	}
	
	// Initialize default state
	cluster.State["population"] = 50.0
	cluster.State["energy"] = 50.0
	cluster.State["mutation_rate"] = 0.05
	
	clusterMutex.Lock()
	clusters[id] = cluster
	clusterMutex.Unlock()
	
	// Start decision-making goroutine
	go cluster.processDecisions()
	
	return js.ValueOf(id)
}

// processDecisions runs in a goroutine and continuously makes decisions
func (nc *NeuralCluster) processDecisions() {
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			if !nc.Active {
				return
			}
			// Make decision based on current state
			decision := nc.makeDecision()
			
			// Try to send decision, but don't block if channel is full
			select {
			case nc.decisions <- decision:
			default:
				// Channel full, skip this decision
			}
			
		case <-nc.stopChan:
			return
		}
	}
}

// makeDecision generates a decision based on the cluster's current state
func (nc *NeuralCluster) makeDecision() Decision {
	nc.mutex.RLock()
	defer nc.mutex.RUnlock()
	
	// Extract state values
	energy := nc.State["energy"]
	population := nc.State["population"]
	mutationRate := nc.State["mutation_rate"]
	
	var action string
	var confidence float64
	
	// Decision logic based on state
	if energy > 70 && population < 80 {
		action = "grow"
		confidence = 0.85
	} else if energy < 30 {
		action = "conserve"
		confidence = 0.90
	} else if population > 120 {
		action = "reduce"
		confidence = 0.75
	} else if mutationRate < 0.03 {
		action = "mutate_more"
		confidence = 0.65
	} else if mutationRate > 0.15 {
		action = "mutate_less"
		confidence = 0.70
	} else {
		action = "maintain"
		confidence = 0.60
	}
	
	return Decision{
		ClusterID:  nc.ID,
		Action:     action,
		Confidence: confidence,
		Timestamp:  time.Now().Unix(),
	}
}

// updateClusterState updates the state of a neural cluster
func updateClusterState(this js.Value, args []js.Value) interface{} {
	if len(args) < 2 {
		return js.ValueOf("error: cluster ID and state JSON required")
	}
	
	id := args[0].String()
	stateJSON := args[1].String()
	
	clusterMutex.RLock()
	cluster, exists := clusters[id]
	clusterMutex.RUnlock()
	
	if !exists {
		return js.ValueOf("error: cluster not found")
	}
	
	var state map[string]float64
	if err := json.Unmarshal([]byte(stateJSON), &state); err != nil {
		return js.ValueOf("error: invalid JSON")
	}
	
	cluster.mutex.Lock()
	for key, value := range state {
		cluster.State[key] = value
	}
	cluster.mutex.Unlock()
	
	return js.ValueOf("ok")
}

// getClusterDecision retrieves the next decision from a cluster's decision queue
func getClusterDecision(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.Null()
	}
	
	id := args[0].String()
	
	clusterMutex.RLock()
	cluster, exists := clusters[id]
	clusterMutex.RUnlock()
	
	if !exists {
		return js.Null()
	}
	
	// Try to get a decision with timeout
	select {
	case decision := <-cluster.decisions:
		decisionJSON, err := json.Marshal(decision)
		if err != nil {
			return js.Null()
		}
		return js.ValueOf(string(decisionJSON))
	case <-time.After(10 * time.Millisecond):
		return js.Null()
	}
}

// stopCluster stops a neural cluster and cleans up resources
func stopCluster(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("error: cluster ID required")
	}
	
	id := args[0].String()
	
	clusterMutex.Lock()
	defer clusterMutex.Unlock()
	
	cluster, exists := clusters[id]
	if !exists {
		return js.ValueOf("error: cluster not found")
	}
	
	// Signal the goroutine to stop
	cluster.Active = false
	close(cluster.stopChan)
	
	// Clean up
	delete(clusters, id)
	
	return js.ValueOf("ok")
}

// getClusterState retrieves the current state of a cluster
func getClusterState(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.Null()
	}
	
	id := args[0].String()
	
	clusterMutex.RLock()
	cluster, exists := clusters[id]
	clusterMutex.RUnlock()
	
	if !exists {
		return js.Null()
	}
	
	cluster.mutex.RLock()
	defer cluster.mutex.RUnlock()
	
	stateJSON, err := json.Marshal(cluster.State)
	if err != nil {
		return js.Null()
	}
	
	return js.ValueOf(string(stateJSON))
}

// listClusters returns a list of all active cluster IDs
func listClusters(this js.Value, args []js.Value) interface{} {
	clusterMutex.RLock()
	defer clusterMutex.RUnlock()
	
	ids := make([]interface{}, 0, len(clusters))
	for id := range clusters {
		ids = append(ids, id)
	}
	
	return js.ValueOf(ids)
}

func main() {
	c := make(chan struct{}, 0)
	
	// Register JavaScript functions
	js.Global().Set("goCreateCluster", js.FuncOf(createCluster))
	js.Global().Set("goUpdateClusterState", js.FuncOf(updateClusterState))
	js.Global().Set("goGetClusterDecision", js.FuncOf(getClusterDecision))
	js.Global().Set("goStopCluster", js.FuncOf(stopCluster))
	js.Global().Set("goGetClusterState", js.FuncOf(getClusterState))
	js.Global().Set("goListClusters", js.FuncOf(listClusters))
	
	<-c
}
