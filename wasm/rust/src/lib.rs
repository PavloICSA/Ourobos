use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// OrganismState represents the core metrics and state of the organism
#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct OrganismState {
    // Core metrics
    population: f64,
    energy: f64,
    generation: u64,
    age: u64,
    
    // Evolution parameters
    mutation_rate: f64,
    selection_pressure: f64,
    adaptation_score: f64,
    
    // State vector for numeric computations
    #[serde(skip)]
    state_vector: Vec<f64>,
}

#[wasm_bindgen]
impl OrganismState {
    /// Create a new OrganismState with default values
    #[wasm_bindgen(constructor)]
    pub fn new() -> OrganismState {
        OrganismState {
            population: 100.0,
            energy: 1000.0,
            generation: 0,
            age: 0,
            mutation_rate: 0.01,
            selection_pressure: 0.5,
            adaptation_score: 0.0,
            state_vector: vec![100.0, 1000.0, 0.01],
        }
    }
    
    /// Initialize organism state from JSON configuration
    #[wasm_bindgen(js_name = initFromConfig)]
    pub fn init_from_config(config_json: &str) -> Result<OrganismState, JsValue> {
        serde_json::from_str(config_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse config: {}", e)))
    }
    
    /// Perform one step of organism evolution
    #[wasm_bindgen]
    pub fn step(&mut self, delta_time: f64) -> f64 {
        // Increment age
        self.age += 1;
        
        // Update population based on energy and mutation rate
        let growth_rate = (self.energy / 1000.0) * (1.0 - self.mutation_rate);
        self.population += self.population * growth_rate * delta_time;
        
        // Energy consumption based on population
        let energy_consumption = self.population * 0.1 * delta_time;
        self.energy -= energy_consumption;
        
        // Energy regeneration
        let energy_regen = 10.0 * delta_time;
        self.energy += energy_regen;
        
        // Clamp values
        self.population = self.population.max(1.0);
        self.energy = self.energy.max(0.0).min(10000.0);
        
        // Update state vector
        self.state_vector[0] = self.population;
        self.state_vector[1] = self.energy;
        self.state_vector[2] = self.mutation_rate;
        
        // Calculate and return adaptation score
        self.adaptation_score = self.calculate_adaptation_score();
        self.adaptation_score
    }
    
    /// Calculate adaptation score based on current state
    fn calculate_adaptation_score(&self) -> f64 {
        let pop_score = (self.population / 100.0).min(2.0);
        let energy_score = (self.energy / 1000.0).min(1.0);
        let age_score = (self.age as f64 / 100.0).min(1.0);
        
        (pop_score + energy_score + age_score) / 3.0
    }
    
    /// Get a snapshot of the current state as JSON
    #[wasm_bindgen(js_name = getSnapshot)]
    pub fn get_snapshot(&self) -> Result<String, JsValue> {
        serde_json::to_string(self)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize state: {}", e)))
    }
    
    /// Restore state from a JSON snapshot
    #[wasm_bindgen(js_name = loadSnapshot)]
    pub fn load_snapshot(&mut self, snapshot_json: &str) -> Result<(), JsValue> {
        let loaded: OrganismState = serde_json::from_str(snapshot_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse snapshot: {}", e)))?;
        
        *self = loaded;
        Ok(())
    }
    
    // Getters for JavaScript access
    #[wasm_bindgen(getter)]
    pub fn population(&self) -> f64 {
        self.population
    }
    
    #[wasm_bindgen(getter)]
    pub fn energy(&self) -> f64 {
        self.energy
    }
    
    #[wasm_bindgen(getter)]
    pub fn generation(&self) -> u64 {
        self.generation
    }
    
    #[wasm_bindgen(getter)]
    pub fn age(&self) -> u64 {
        self.age
    }
    
    #[wasm_bindgen(getter, js_name = mutationRate)]
    pub fn mutation_rate(&self) -> f64 {
        self.mutation_rate
    }
    
    #[wasm_bindgen(getter, js_name = selectionPressure)]
    pub fn selection_pressure(&self) -> f64 {
        self.selection_pressure
    }
    
    #[wasm_bindgen(getter, js_name = adaptationScore)]
    pub fn adaptation_score(&self) -> f64 {
        self.adaptation_score
    }
    
    // Setters for JavaScript access
    #[wasm_bindgen(setter)]
    pub fn set_population(&mut self, value: f64) {
        self.population = value.max(0.0);
        self.state_vector[0] = self.population;
    }
    
    #[wasm_bindgen(setter)]
    pub fn set_energy(&mut self, value: f64) {
        self.energy = value.max(0.0);
        self.state_vector[1] = self.energy;
    }
    
    #[wasm_bindgen(setter)]
    pub fn set_generation(&mut self, value: u64) {
        self.generation = value;
    }
    
    #[wasm_bindgen(setter, js_name = mutationRate)]
    pub fn set_mutation_rate(&mut self, value: f64) {
        self.mutation_rate = value.max(0.0).min(1.0);
        self.state_vector[2] = self.mutation_rate;
    }
    
    #[wasm_bindgen(setter, js_name = selectionPressure)]
    pub fn set_selection_pressure(&mut self, value: f64) {
        self.selection_pressure = value.max(0.0).min(1.0);
    }
    
    /// Get the state vector for numeric computations
    #[wasm_bindgen(js_name = getStateVector)]
    pub fn get_state_vector(&self) -> Vec<f64> {
        self.state_vector.clone()
    }
    
    /// Update the state vector
    #[wasm_bindgen(js_name = setStateVector)]
    pub fn set_state_vector(&mut self, vector: Vec<f64>) {
        if vector.len() >= 3 {
            self.population = vector[0];
            self.energy = vector[1];
            self.mutation_rate = vector[2];
            self.state_vector = vector;
        }
    }
}

impl Default for OrganismState {
    fn default() -> Self {
        Self::new()
    }
}

/// RuleRegistry manages the collection of rules and their execution tracking
#[wasm_bindgen]
pub struct RuleRegistry {
    rules: HashMap<String, Rule>,
    execution_order: Vec<String>,
}

/// Rule represents a single executable rule with metadata
#[derive(Serialize, Deserialize, Clone)]
struct Rule {
    id: String,
    lisp_code: String,
    execution_count: u64,
    total_execution_time_ms: f64,
    last_execution_time_ms: f64,
    created_at: u64,
}

#[wasm_bindgen]
impl RuleRegistry {
    /// Create a new empty rule registry
    #[wasm_bindgen(constructor)]
    pub fn new() -> RuleRegistry {
        RuleRegistry {
            rules: HashMap::new(),
            execution_order: Vec::new(),
        }
    }
    
    /// Register a new rule
    #[wasm_bindgen(js_name = registerRule)]
    pub fn register_rule(&mut self, id: &str, lisp_code: &str) -> Result<(), JsValue> {
        if id.is_empty() {
            return Err(JsValue::from_str("Rule ID cannot be empty"));
        }
        
        let rule = Rule {
            id: id.to_string(),
            lisp_code: lisp_code.to_string(),
            execution_count: 0,
            total_execution_time_ms: 0.0,
            last_execution_time_ms: 0.0,
            created_at: js_sys::Date::now() as u64,
        };
        
        self.rules.insert(id.to_string(), rule);
        
        // Add to execution order if not already present
        if !self.execution_order.contains(&id.to_string()) {
            self.execution_order.push(id.to_string());
        }
        
        Ok(())
    }
    
    /// Remove a rule from the registry
    #[wasm_bindgen(js_name = removeRule)]
    pub fn remove_rule(&mut self, id: &str) -> bool {
        self.execution_order.retain(|rule_id| rule_id != id);
        self.rules.remove(id).is_some()
    }
    
    /// Get the Lisp code for a specific rule
    #[wasm_bindgen(js_name = getRuleCode)]
    pub fn get_rule_code(&self, id: &str) -> Option<String> {
        self.rules.get(id).map(|rule| rule.lisp_code.clone())
    }
    
    /// Get all rule IDs in execution order
    #[wasm_bindgen(js_name = getRuleIds)]
    pub fn get_rule_ids(&self) -> Vec<String> {
        self.execution_order.clone()
    }
    
    /// Get the number of rules in the registry
    #[wasm_bindgen(js_name = getRuleCount)]
    pub fn get_rule_count(&self) -> usize {
        self.rules.len()
    }
    
    /// Record rule execution with timing information
    #[wasm_bindgen(js_name = recordExecution)]
    pub fn record_execution(&mut self, id: &str, execution_time_ms: f64) -> Result<(), JsValue> {
        if let Some(rule) = self.rules.get_mut(id) {
            rule.execution_count += 1;
            rule.total_execution_time_ms += execution_time_ms;
            rule.last_execution_time_ms = execution_time_ms;
            Ok(())
        } else {
            Err(JsValue::from_str(&format!("Rule not found: {}", id)))
        }
    }
    
    /// Get execution statistics for a rule
    #[wasm_bindgen(js_name = getRuleStats)]
    pub fn get_rule_stats(&self, id: &str) -> Result<String, JsValue> {
        if let Some(rule) = self.rules.get(id) {
            let avg_time = if rule.execution_count > 0 {
                rule.total_execution_time_ms / rule.execution_count as f64
            } else {
                0.0
            };
            
            let stats = serde_json::json!({
                "id": rule.id,
                "executionCount": rule.execution_count,
                "totalExecutionTimeMs": rule.total_execution_time_ms,
                "lastExecutionTimeMs": rule.last_execution_time_ms,
                "averageExecutionTimeMs": avg_time,
                "createdAt": rule.created_at,
            });
            
            serde_json::to_string(&stats)
                .map_err(|e| JsValue::from_str(&format!("Failed to serialize stats: {}", e)))
        } else {
            Err(JsValue::from_str(&format!("Rule not found: {}", id)))
        }
    }
    
    /// Get statistics for all rules as JSON
    #[wasm_bindgen(js_name = getAllStats)]
    pub fn get_all_stats(&self) -> Result<String, JsValue> {
        let mut all_stats = Vec::new();
        
        for rule_id in &self.execution_order {
            if let Some(rule) = self.rules.get(rule_id) {
                let avg_time = if rule.execution_count > 0 {
                    rule.total_execution_time_ms / rule.execution_count as f64
                } else {
                    0.0
                };
                
                all_stats.push(serde_json::json!({
                    "id": rule.id,
                    "executionCount": rule.execution_count,
                    "totalExecutionTimeMs": rule.total_execution_time_ms,
                    "lastExecutionTimeMs": rule.last_execution_time_ms,
                    "averageExecutionTimeMs": avg_time,
                    "createdAt": rule.created_at,
                }));
            }
        }
        
        serde_json::to_string(&all_stats)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize stats: {}", e)))
    }
    
    /// Clear all execution statistics
    #[wasm_bindgen(js_name = clearStats)]
    pub fn clear_stats(&mut self) {
        for rule in self.rules.values_mut() {
            rule.execution_count = 0;
            rule.total_execution_time_ms = 0.0;
            rule.last_execution_time_ms = 0.0;
        }
    }
    
    /// Export the registry as JSON
    #[wasm_bindgen(js_name = exportRegistry)]
    pub fn export_registry(&self) -> Result<String, JsValue> {
        let export_data = serde_json::json!({
            "rules": self.rules,
            "executionOrder": self.execution_order,
        });
        
        serde_json::to_string(&export_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to export registry: {}", e)))
    }
    
    /// Import a registry from JSON
    #[wasm_bindgen(js_name = importRegistry)]
    pub fn import_registry(&mut self, json: &str) -> Result<(), JsValue> {
        let data: serde_json::Value = serde_json::from_str(json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse registry JSON: {}", e)))?;
        
        if let Some(rules_obj) = data.get("rules") {
            let rules: HashMap<String, Rule> = serde_json::from_value(rules_obj.clone())
                .map_err(|e| JsValue::from_str(&format!("Failed to parse rules: {}", e)))?;
            self.rules = rules;
        }
        
        if let Some(order_arr) = data.get("executionOrder") {
            let order: Vec<String> = serde_json::from_value(order_arr.clone())
                .map_err(|e| JsValue::from_str(&format!("Failed to parse execution order: {}", e)))?;
            self.execution_order = order;
        }
        
        Ok(())
    }
}

impl Default for RuleRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Apply a rule with parameters and return the result
/// This is a high-level function that coordinates rule execution
#[wasm_bindgen(js_name = applyRule)]
pub fn apply_rule(
    registry: &mut RuleRegistry,
    state: &mut OrganismState,
    rule_id: &str,
    params: Vec<f64>,
) -> Result<f64, JsValue> {
    // Get the rule code
    let rule_code = registry.get_rule_code(rule_id)
        .ok_or_else(|| JsValue::from_str(&format!("Rule not found: {}", rule_id)))?;
    
    // Start timing
    let start_time = js_sys::Date::now();
    
    // Apply rule logic based on parameters
    // In a real implementation, this would invoke the Lisp interpreter
    // For now, we'll do a simple parameter-based state update
    let result = apply_rule_logic(state, &params);
    
    // Record execution time
    let execution_time = js_sys::Date::now() - start_time;
    registry.record_execution(rule_id, execution_time)?;
    
    Ok(result)
}

/// Internal function to apply rule logic
/// This is a placeholder that will be replaced by Lisp interpreter integration
fn apply_rule_logic(state: &mut OrganismState, params: &[f64]) -> f64 {
    // Simple example: adjust mutation rate based on first parameter
    if !params.is_empty() {
        let adjustment = params[0];
        state.set_mutation_rate(state.mutation_rate() + adjustment * 0.01);
    }
    
    // Return the adaptation score
    state.adaptation_score()
}

/// Initialize the WASM module
#[wasm_bindgen(start)]
pub fn init() {
    // Set panic hook for better error messages in the browser console
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
