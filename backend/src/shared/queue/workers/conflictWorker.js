const { Worker } = require('bullmq');
const { connection } = require('../index');
const conflictService = require('../../../modules/conflict-detection/service');

/**
 * Conflict Worker
 * Listens for new data snapshots and triggers the conflict detection engine.
 */
const conflictWorker = new Worker('conflict-queue', async (job) => {
  const { athleteId, orgSlug } = job.data;
  console.log(`[Worker] Started conflict check for athlete ${athleteId} (Org: ${orgSlug})`);
  
  try {
    // Switch DB schema context for this worker job
    const db = require('../../db');
    await db.query(`SET search_path TO ${orgSlug}, public;`);

    const result = await conflictService.checkConflicts(athleteId);
    console.log(`[Worker] Finished conflict check. Conflicts found: ${result.conflictsDetected}`);
  } catch (err) {
    console.error(`[Worker] Conflict check failed for job ${job.id}:`, err);
    throw err;
  }
}, { connection });

module.exports = conflictWorker;
