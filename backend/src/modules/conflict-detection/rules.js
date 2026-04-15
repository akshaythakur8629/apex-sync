/**
 * Conflict Detection Rules
 * Standard logic for identifying anomalies across data domains.
 */
const RULES = [
  {
    name: 'Wellness Decline vs High Load',
    id: 'well_vs_load',
    severity: 'high',
    detect: (snapshots) => {
      // Find latest Wellness (Subjective) and Player Load (GPS)
      const load = snapshots.find(s => s.metric_type === 'player_load');
      const wellness = snapshots.find(s => s.metric_type === 'subjective_wellness'); // Mock metric

      if (load && wellness) {
        // Example logic: Load > 500 and Wellness < 3
        if (load.value.val > 500 && wellness.value.val < 3) {
          return {
            conflict: true,
            summary: `High training load (${load.value.val}) detected alongside low subjective wellness (${wellness.value.val}).`,
            signals: { load: load.value.val, wellness: wellness.value.val }
          };
        }
      }
      return { conflict: false };
    }
  },
  {
    name: 'Medical Note Conflict',
    id: 'med_conflict',
    severity: 'critical',
    detect: (snapshots) => {
      // Find Medical Status and Rehab Progress
      const medStatus = snapshots.find(s => s.metric_type === 'medical_clearance');
      const rehabProgress = snapshots.find(s => s.metric_type === 'rehab_milestone_completion');

      if (medStatus && rehabProgress) {
        // Example: Cleared for play but stalled rehab
        if (medStatus.value.val === 'cleared' && rehabProgress.value.val < 50) {
          return {
            conflict: true,
            summary: `Athlete cleared for play, but rehab milestones are only at ${rehabProgress.value.val}%.`,
            signals: { status: medStatus.value.val, rehab: rehabProgress.value.val }
          };
        }
      }
      return { conflict: false };
    }
  }
];

module.exports = {
  RULES,
};
