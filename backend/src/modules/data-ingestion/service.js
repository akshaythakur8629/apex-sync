const db = require('../../shared/db');
const catapult = require('./connectors/catapult');
const normalizer = require('./normalizer');

/**
 * Ingestion Service
 * Handles fetching, normalizing, and persisting data snapshots.
 */
const ingestAthleteData = async (athleteId) => {
  try {
    console.log(`Starting ingestion for athlete ${athleteId}`);
    
    // 1. Fetch raw data from mock source
    const rawData = await catapult.fetchMockCatapultData(athleteId);
    
    // 2. Normalize data
    const normalizedSnapshots = normalizer.normalize(rawData);
    
    // 3. Persist to Database
    const insertQuery = `
      INSERT INTO athlete_snapshots (athlete_id, source, metric_type, value, unit, captured_at, is_stale)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    for (const snapshot of normalizedSnapshots) {
      await db.query(insertQuery, [
        snapshot.athlete_id,
        snapshot.source,
        snapshot.metric_type,
        snapshot.value,
        snapshot.unit,
        snapshot.captured_at,
        snapshot.is_stale,
      ]);
    }

    console.log(`Successfully ingested ${normalizedSnapshots.length} snapshots for athlete ${athleteId}`);
    
    // 4. Trigger Conflict Detection (Asynchronous)
    const { conflictQueue } = require('../../shared/queue');
    const auditService = require('../audit/service');

    await conflictQueue.add('check-conflicts', { 
      athleteId, 
      orgSlug: 'raptors' // In real scenario, would be passed from the request context
    });

    await auditService.logAction(1, null, 'DATA_INGESTION_COMPLETE', { 
      athleteId, 
      count: normalizedSnapshots.length 
    });

    return { success: true, count: normalizedSnapshots.length };
  } catch (err) {
    console.error('Ingestion failed:', err);
    throw err;
  }
};

module.exports = {
  ingestAthleteData,
};
