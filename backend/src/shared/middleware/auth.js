const jwt = require('jsonwebtoken');

const db = require('../../shared/db');

const auth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Authentication required' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // 1. Super User bypass
      if (decoded.is_super_user) return next();

      // 2. Permission check
      if (requiredPermissions.length > 0) {
        // Fetch user permissions from DB
        const query = `
          SELECT p.slug 
          FROM public.permissions p
          JOIN public.role_permissions rp ON p.id = rp.permission_id
          JOIN public.user_roles ur ON rp.role_id = ur.role_id
          WHERE ur.user_id = $1
        `;
        const { rows } = await db.query(query, [decoded.id]);
        const userPerms = rows.map(r => r.slug);

        const hasAllPerms = requiredPermissions.every(p => userPerms.includes(p));
        if (!hasAllPerms) {
          return res.status(403).json({ error: 'Permission denied' });
        }
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

module.exports = auth;
