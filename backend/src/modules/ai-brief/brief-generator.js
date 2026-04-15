/**
 * Mock Brief Generator
 * Simulates calling an LLM (OpenAI/Anthropic).
 */
const generateBrief = async (prompt) => {
  // Simulating API latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    primary_conflicts: [
      "Significant mismatch between high Player Load and declining Subjective Wellness scores.",
      "Clearance status 'Approved' despite unreached rehab milestones for load tolerance."
    ],
    data_limitations: [
      "Missing EMR notes for the last 48 hours for athlete 1.",
      "WHOOP metrics show lower reliability score due to irregular wearing patterns."
    ],
    source_trace: {
      "load_metrics": "Catapult API",
      "wellness_scores": "Mobile App (Subjective RPE)",
      "clearance": "Postgres EMR-Adapter"
    }
  };
};

module.exports = {
  generateBrief,
};
