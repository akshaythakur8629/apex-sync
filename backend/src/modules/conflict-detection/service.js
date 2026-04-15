const db = require('../../shared/db');
const { RULES } = require('./rules');

/**
 * Conflict Detection Service
 * Analyzes snapshots to identify cross-domain conflicts.
 */
const checkConflicts = async (athleteId) => {
  try {
    console.log(`Checking conflicts for athlete ${athleteId}`);

    // 1. Fetch recent snapshots for this athlete
    const snapshotsQuery = `
      SELECT * FROM athlete_snapshots 
      WHERE athlete_id = $1 
      ORDER BY captured_at DESC 
      LIMIT 20
    `;
    const { rows: snapshots } = await db.query(snapshotsQuery, [athleteId]);

    if (snapshots.length === 0) return { conflictsDetected: 0 };

    // 2. Run Rules
    const detectedConflicts = [];
    for (const rule of RULES) {
      const result = rule.detect(snapshots);
      if (result.conflict) {
        detectedConflicts.push({
          ruleId: rule.id,
          severity: rule.severity,
          summary: result.summary,
          signals: result.signals,
        });
      }
    }

    // 3. Persist Significant Conflicts
    const insertConflictQuery = `
      INSERT INTO conflict_events (athlete_id, signals_involved, severity, status, summary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    for (const conflict of detectedConflicts) {
      const { rows } = await db.query(insertConflictQuery, [
        athleteId,
        JSON.stringify(conflict.signals),
        conflict.severity,
        'open',
        conflict.summary,
      ]);
      console.log(`Conflict detected and saved: ${conflict.summary} (ID: ${rows[0].id})`);
      const conflictEventId = rows[0].id;
      
      // 4. Trigger Decision Spawning & Notifications
      const workflow = require('../decision-workflow/service');
      const notifier = require('../notification/alert-dispatcher');
      
      // Auto-trigger decision for high/critical severity
      if (conflict.severity === 'high' || conflict.severity === 'critical') {
        const decision = await workflow.triggerDecision(athleteId, conflictEventId, 'normal');
        await notifier.notifyUser(1, 'conflict', `New decision required: ${conflict.summary}`, decision.id);
      } else {
        await notifier.notifyUser(1, 'conflict', `Low-priority conflict: ${conflict.summary}`, conflictEventId);
      }
    }

    return { conflictsDetected: detectedConflicts.length };
  } catch (err) {
    console.error('Conflict detection failed:', err);
    throw err;
  }
};

module.exports = {
  checkConflicts,
};
