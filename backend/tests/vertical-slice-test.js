const ingestionService = require('../src/modules/data-ingestion/service');
const db = require('../src/shared/db');
const path = require('path');

/**
 * Vertical Slice Integration Test
 * Simulates a data push and verifies the automated chain.
 */
async function runTest() {
  console.log('--- STARTING VERTICAL SLICE TEST ---');

  try {
    // 1. Setup Test Data (Pascal Siakam)
    const athleteId = 1; 
    const mockCsvPath = path.join(__dirname, '../src/modules/data-ingestion/connectors/catapult.js'); // just a placeholder

    console.log('Step 1: Mocking data ingestion...');
    const result = await ingestionService.ingestAthleteData(athleteId, 'catapult', mockCsvPath);
    console.log(`Ingestion result: ${JSON.stringify(result)}`);

    // 2. Wait for background processing (Mocking worker delay)
    console.log('Step 2: Waiting for background conflict detection and decision spawning...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Verify Database State
    console.log('Step 3: Verifying Database...');
    
    // Switch to raptors schema
    await db.query('SET search_path TO raptors, public;');
    
    const { rows: decisions } = await db.query('SELECT * FROM decisions ORDER BY created_at DESC LIMIT 1');
    const { rows: audits } = await db.query('SELECT * FROM public.audit_logs ORDER BY created_at DESC LIMIT 1');

    if (decisions.length > 0) {
      console.log('✅ SUCCESS: Decision record automatically spawned!');
      console.log(`   Decision ID: ${decisions[0].id}, Status: ${decisions[0].status}`);
    } else {
      console.log('❌ FAILURE: No decision record found.');
    }

    if (audits.length > 0) {
      console.log('✅ SUCCESS: Audit log entry created!');
      console.log(`   Action: ${audits[0].action}, Details: ${JSON.stringify(audits[0].details)}`);
    }

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
  } finally {
    console.log('--- TEST COMPLETE ---');
    process.exit();
  }
}

// Check if running directly
if (require.main === module) {
  runTest();
}
