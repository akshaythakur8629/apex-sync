const db = require('../../shared/db');

/**
 * Decision Workflow Service
 * Manages the lifecycle of readiness and RTP decisions.
 * States: pending -> in_review -> awaiting_rationale -> resolved -> escalated
 */
class DecisionWorkflowService {
  /**
   * Spawns a decision record from a conflict alert.
   */
  async triggerDecision(athleteId, conflictEventId, priority = 'normal') {
    const deadline = priority === 'gameday' 
      ? new Date(Date.now() + 4 * 60 * 60 * 1000)  // 4 hours
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const decision = await db.decision.create({
      data: {
        athleteId: parseInt(athleteId),
        conflictEventId: parseInt(conflictEventId),
        status: 'pending',
        priority,
        deadline
      }
    });
    
    console.log(`Decision ${decision.id} spawned for athlete ${athleteId}`);
    return decision;
  }

  async assignDecision(decisionId, userId) {
    return await db.$transaction([
      // 1. Deactivate current assignments
      db.decisionAssignment.updateMany({
        where: { decisionId: parseInt(decisionId) },
        data: { isActive: false }
      }),
      // 2. Create new assignment
      db.decisionAssignment.create({
        data: {
          decisionId: parseInt(decisionId),
          userId: parseInt(userId),
          isActive: true
        }
      }),
      // 3. Update decision status
      db.decision.update({
        where: { id: parseInt(decisionId) },
        data: { status: 'in_review' }
      })
    ]);
  }

  async finalizeDecision(decisionId, userId, rationaleData) {
    return await db.$transaction([
      // 1. Store Rationale
      db.rationaleRecord.create({
        data: {
          decisionId: parseInt(decisionId),
          userId: parseInt(userId),
          keyFactors: rationaleData.keyFactors,
          tradeOffs: rationaleData.tradeOffs,
          dissentingViews: rationaleData.dissentingViews,
          confidenceLevel: rationaleData.confidenceLevel,
          notes: rationaleData.notes
        }
      }),
      // 2. Update status
      db.decision.update({
        where: { id: parseInt(decisionId) },
        data: { status: 'resolved' }
      }),
      // 3. Resolve active assignment
      db.decisionAssignment.updateMany({
        where: { decisionId: parseInt(decisionId), isActive: true },
        data: { resolvedAt: new Date() }
      })
    ]);
  }

  async runEscalationJob() {
    const overdueDecisions = await db.decision.findMany({
      where: {
        status: { notIn: ['resolved', 'dismissed'] },
        deadline: { lt: new Date() }
      }
    });

    for (const decision of overdueDecisions) {
      await db.decision.update({
        where: { id: decision.id },
        data: {
          escalationLevel: { increment: 1 },
          status: 'escalated'
        }
      });
      console.log(`Escalated decision ${decision.id} due to deadline breach.`);
    }
  }
}

module.exports = new DecisionWorkflowService();
