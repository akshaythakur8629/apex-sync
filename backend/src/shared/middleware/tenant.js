const db = require('../db');

/**
 * Tenant Middleware
 * Switches the PostgreSQL search_path to the specific tenant schema 
 * identified in the JWT token (org_slug).
 */
const setTenantSchema = async (req, res, next) => {
  try {
    // 1. Get org_slug from the user object (set by auth middleware)
    const orgSlug = req.user?.org_slug;

    if (!orgSlug) {
      return res.status(403).json({ error: 'Tenant context missing in request' });
    }

    // 2. Set search_path to the tenant schema, falling back to public
    // Example: SET search_path TO raptors, public;
    // We use a parameterized query here for security, though search_path 
    // requires careful string interpolation for the schema name.
    
    // Validate orgSlug to prevent SQL injection in schema names (alphanumeric only)
    if (!/^[a-z0-9_]+$/i.test(orgSlug)) {
        return res.status(400).json({ error: 'Invalid tenant schema name' });
    }

    await db.query(`SET search_path TO ${orgSlug}, public;`);
    
    console.log(`Switched database context to schema: ${orgSlug}`);
    next();
  } catch (err) {
    console.error('Failed to set tenant context:', err);
    res.status(500).json({ error: 'Database context switching failed' });
  }
};

module.exports = setTenantSchema;
