/**
 * AI Hallucination Guard
 * Performs a second-pass review of LLM-generated briefs to ensure 
 * they do not contain clinical assessments or unsupported claims.
 */
class HallucinationGuard {
  /**
   * Scans for forbidden clinical/predictive language using regex and simple rules.
   */
  static basicRedaction(content) {
    const forbiddenPatterns = [
      /diagnose/i, /treatment plan/i, /prescribe/i,
      /will recover in/i, /predict/i, /guarantee/i,
      /medically cleared/i // Only humans can say this
    ];

    let redactedContent = content;
    forbiddenPatterns.forEach(pattern => {
      redactedContent = redactedContent.replace(pattern, "[REDACTED: CLINICAL CLAIM]");
    });

    return redactedContent;
  }

  /**
   * Per the PRD, this would perform a second LLM call to verify grounding.
   * Mocking the logic for the MVP.
   */
  static async verifyGrounding(brief, snapshots) {
    // 1. Identify all claims in the brief
    // 2. Cross-reference with snapshot metric_types
    // 3. Flag any claim that doesn't have a matching metric source
    
    const metricTypesFoundInSource = new Set(snapshots.map(s => s.metric_type));
    
    // Simple heuristic: if brief mentions a metric we don't have, flag it
    const potentialHallucinations = [];
    if (brief.includes("heart rate") && !metricTypesFoundInSource.has("heart_rate")) {
      potentialHallucinations.push("Mention of heart rate without source data.");
    }

    return {
      isValid: potentialHallucinations.length === 0,
      warnings: potentialHallucinations
    };
  }
}

module.exports = HallucinationGuard;
