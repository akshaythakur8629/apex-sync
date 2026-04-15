const db = require('./index');

/**
 * Tenant Provisioning Utility
 * Creates a new isolated schema and all required tables for a new organization.
 */
const provisionTenant = async (organizationSlug) => {
  try {
    console.log(`Provisioning new tenant schema: ${organizationSlug}`);

    if (!/^[a-z0-9_]+$/i.test(organizationSlug)) {
      throw new Error('Invalid organization slug format');
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Create Schema
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${organizationSlug};`);

      // 2. Create Tables
      const tablesSql = `
        CREATE TABLE IF NOT EXISTS ${organizationSlug}.athletes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            position VARCHAR(100),
            status VARCHAR(50) DEFAULT 'available',
            medical_clearance VARCHAR(50) DEFAULT 'cleared',
            load_tolerance VARCHAR(50) DEFAULT 'full',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ${organizationSlug}.athlete_snapshots (
            id SERIAL PRIMARY KEY,
            athlete_id INTEGER REFERENCES ${organizationSlug}.athletes(id) ON DELETE CASCADE,
            source VARCHAR(100) NOT NULL,
            metric_type VARCHAR(100) NOT NULL,
            value JSONB NOT NULL,
            captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ${organizationSlug}.conflict_events (
            id SERIAL PRIMARY KEY,
            athlete_id INTEGER REFERENCES ${organizationSlug}.athletes(id) ON DELETE CASCADE,
            signals_involved JSONB NOT NULL,
            severity VARCHAR(50) DEFAULT 'medium',
            status VARCHAR(50) DEFAULT 'open',
            summary TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ${organizationSlug}.decisions (
            id SERIAL PRIMARY KEY,
            athlete_id INTEGER REFERENCES ${organizationSlug}.athletes(id) ON DELETE CASCADE,
            conflict_event_id INTEGER REFERENCES ${organizationSlug}.conflict_events(id),
            status VARCHAR(50) DEFAULT 'pending',
            priority VARCHAR(50) DEFAULT 'normal',
            deadline TIMESTAMP WITH TIME ZONE,
            escalation_level INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ${organizationSlug}.decision_assignments (
            id SERIAL PRIMARY KEY,
            decision_id INTEGER REFERENCES ${organizationSlug}.decisions(id) ON DELETE CASCADE,
            user_id INTEGER,
            assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS ${organizationSlug}.rationale_records (
            id SERIAL PRIMARY KEY,
            decision_id INTEGER REFERENCES ${organizationSlug}.decisions(id) ON DELETE CASCADE,
            user_id INTEGER,
            key_factors JSONB,
            trade_offs TEXT,
            dissenting_views TEXT,
            confidence_level INTEGER,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ${organizationSlug}.notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            type VARCHAR(50),
            rel_id INTEGER,
            title TEXT,
            message TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await client.query(tablesSql);
      await client.query('COMMIT');
      
      console.log(`Successfully provisioned schema: ${organizationSlug}`);
      return { success: true, schema: organizationSlug };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Failed to provision tenant ${organizationSlug}:`, err);
    throw err;
  }
};

module.exports = provisionTenant;
