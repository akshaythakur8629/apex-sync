const buildPrompt = (athleteData, conflictEvents, uncertaintyMetadata) => {
  return `
    SYSTEM: You are a Performance Intelligence Assistant. Your role is to synthesize multi-domain data for elite sports organizations.
    STRICT RULE: Do not generate diagnoses, clearance recommendations, or outcome predictions. Only synthesize and surface provided data.

    ATHLETE PROFILE:
    ${JSON.stringify(athleteData, null, 2)}

    DETECTED CONFLICTS:
    ${JSON.stringify(conflictEvents, null, 2)}

    DATA UNCERTAINTY:
    ${JSON.stringify(uncertaintyMetadata, null, 2)}

    TASK:
    Generate a 3-paragraph decision brief that:
    1. Highlights the primary conflicting signals detected.
    2. Identifies any major data gaps or low-confidence metrics.
    3. Traces which pieces of information came from which source (e.g. GPS vs EMR).
    
    Format the output as a JSON object with keys: "primary_conflicts", "data_limitations", "source_trace".
  `;
};

module.exports = {
  buildPrompt,
};
