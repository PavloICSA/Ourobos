/**
 * Demo Organism - Initial rules and state for demonstration workflow
 * 
 * This module provides:
 * - Simple ALGOL rules for demo mutations
 * - Initial organism state setup
 * - Demo mutation sequence definition
 * 
 * Requirements: 17.1
 */

/**
 * Demo organism initial state
 */
export const DEMO_INITIAL_STATE = {
  population: 50,
  energy: 75,
  mutationRate: 0.1,
  generation: 0,
  blockchainGeneration: 0,
  lastGenomeHash: '',
  quantumEntropyUsed: '',
  sensorReadings: {
    light: 0.5,
    temperature: 0.5,
    acceleration: 0.5
  },
  activeClusterIds: ['main', 'secondary']
};

/**
 * Demo ALGOL rules for mutations
 * These are simple, understandable rules that demonstrate the system
 */
export const DEMO_ALGOL_RULES = {
  // Rule 1: Population-based mutation rate adjustment
  populationControl: `
BEGIN
  IF population > 100 THEN
    mutation_rate := 0.05
  ELSE
    mutation_rate := 0.1
  END
END
  `.trim(),
  
  // Rule 2: Energy-based growth control
  energyManagement: `
BEGIN
  IF energy > 50 THEN
    population := population * 1.1
  ELSE
    population := population * 0.9
  END;
  energy := energy - 10
END
  `.trim(),
  
  // Rule 3: Sensor-influenced adaptation
  sensorAdaptation: `
BEGIN
  IF light > 0.7 THEN
    energy := energy + 20
  ELSE IF light < 0.3 THEN
    energy := energy - 10
  END;
  
  IF temperature > 0.8 THEN
    mutation_rate := mutation_rate * 1.2
  END
END
  `.trim(),
  
  // Rule 4: Balanced homeostasis
  homeostasis: `
BEGIN
  IF population > 150 THEN
    population := population * 0.8;
    energy := energy + 15
  END;
  
  IF energy < 20 THEN
    population := population * 0.7;
    mutation_rate := 0.15
  END
END
  `.trim(),
  
  // Rule 5: Quantum-influenced evolution
  quantumEvolution: `
BEGIN
  mutation_rate := mutation_rate + (entropy_value * 0.01);
  
  IF mutation_rate > 0.2 THEN
    mutation_rate := 0.2
  END;
  
  IF mutation_rate < 0.01 THEN
    mutation_rate := 0.01
  END
END
  `.trim()
};

/**
 * Demo mutation sequence
 * Defines the order and timing of mutations for the demo workflow
 */
export const DEMO_MUTATION_SEQUENCE = [
  {
    step: 1,
    name: 'Population Control',
    description: 'Adjust mutation rate based on population size',
    code: DEMO_ALGOL_RULES.populationControl,
    language: 'algol',
    expectedOutcome: 'Mutation rate should adjust to 0.1 (population < 100)',
    votingDelay: 5000, // 5 seconds for demo (instead of 60)
    autoVote: true,
    voteSupport: true
  },
  {
    step: 2,
    name: 'Energy Management',
    description: 'Control population growth based on energy levels',
    code: DEMO_ALGOL_RULES.energyManagement,
    language: 'algol',
    expectedOutcome: 'Population should increase (energy > 50), energy decreases',
    votingDelay: 5000,
    autoVote: true,
    voteSupport: true
  },
  {
    step: 3,
    name: 'Sensor Adaptation',
    description: 'Adapt organism behavior based on environmental sensors',
    code: DEMO_ALGOL_RULES.sensorAdaptation,
    language: 'algol',
    expectedOutcome: 'Energy and mutation rate adjust based on light and temperature',
    votingDelay: 5000,
    autoVote: true,
    voteSupport: true
  },
  {
    step: 4,
    name: 'Homeostasis',
    description: 'Maintain balanced organism state',
    code: DEMO_ALGOL_RULES.homeostasis,
    language: 'algol',
    expectedOutcome: 'Population and energy balance maintained',
    votingDelay: 5000,
    autoVote: true,
    voteSupport: true
  },
  {
    step: 5,
    name: 'Quantum Evolution',
    description: 'Use quantum entropy to influence mutation rate',
    code: DEMO_ALGOL_RULES.quantumEvolution,
    language: 'algol',
    expectedOutcome: 'Mutation rate influenced by quantum randomness',
    votingDelay: 5000,
    autoVote: true,
    voteSupport: true
  }
];

/**
 * Get demo mutation by step number
 * @param {number} step - Step number (1-5)
 * @returns {Object|null} Demo mutation or null
 */
export function getDemoMutation(step) {
  return DEMO_MUTATION_SEQUENCE.find(m => m.step === step) || null;
}

/**
 * Get all demo mutations
 * @returns {Array} Array of demo mutations
 */
export function getAllDemoMutations() {
  return [...DEMO_MUTATION_SEQUENCE];
}

/**
 * Get demo mutation count
 * @returns {number} Total number of demo mutations
 */
export function getDemoMutationCount() {
  return DEMO_MUTATION_SEQUENCE.length;
}

/**
 * Validate demo mutation step
 * @param {number} step - Step number
 * @returns {boolean} True if valid step
 */
export function isValidDemoStep(step) {
  return step >= 1 && step <= DEMO_MUTATION_SEQUENCE.length;
}

/**
 * Get next demo mutation after given step
 * @param {number} currentStep - Current step number
 * @returns {Object|null} Next mutation or null if at end
 */
export function getNextDemoMutation(currentStep) {
  const nextStep = currentStep + 1;
  return getDemoMutation(nextStep);
}

/**
 * Check if demo sequence is complete
 * @param {number} currentStep - Current step number
 * @returns {boolean} True if all steps completed
 */
export function isDemoComplete(currentStep) {
  return currentStep >= DEMO_MUTATION_SEQUENCE.length;
}

/**
 * Reset demo state
 * @returns {Object} Fresh initial state
 */
export function resetDemoState() {
  return { ...DEMO_INITIAL_STATE };
}

/**
 * Get demo progress
 * @param {number} currentStep - Current step number
 * @returns {Object} Progress information
 */
export function getDemoProgress(currentStep) {
  const total = DEMO_MUTATION_SEQUENCE.length;
  const completed = Math.min(currentStep, total);
  const percentage = (completed / total * 100).toFixed(1);
  
  return {
    currentStep: completed,
    totalSteps: total,
    percentage: parseFloat(percentage),
    remaining: total - completed,
    isComplete: isDemoComplete(currentStep)
  };
}

export default {
  DEMO_INITIAL_STATE,
  DEMO_ALGOL_RULES,
  DEMO_MUTATION_SEQUENCE,
  getDemoMutation,
  getAllDemoMutations,
  getDemoMutationCount,
  isValidDemoStep,
  getNextDemoMutation,
  isDemoComplete,
  resetDemoState,
  getDemoProgress
};
