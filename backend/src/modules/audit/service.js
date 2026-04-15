const db = require('../../shared/db');


class AuditService {
  async getDecisionAuditTrace(decisionId) {
    try {
      const decision = await db.decision.findUnique({
        where: { id: parseInt(decisionId) },
        include: {
          athlete: true,
          rationales: {
            include: { user: true }
          },
          assignments: {
            include: { user: true }
          }
        }
      });
      
      if (!decision) throw new Error('Decision audit record not found');
      
      return decision;
    } catch (err) {
      console.error('Audit trace retrieval failed:', err);
      throw err;
    }
  }

  async logAction(orgId, userId, action, details) {
    await db.auditLog.create({
      data: {
        organizationId: orgId,
        userId: userId,
        action: action,
        details: details
      }
    });
  }
}

module.exports = new AuditService();
