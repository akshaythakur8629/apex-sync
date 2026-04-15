const db = require('../../shared/db');

/**
 * Performance Controller
 * Provides high-level athlete status views and detail rosters.
 */
class PerformanceController {
  /**
   * Returns the "Roster View" - summary of all athletes.
   */
  async getRoster(req, res) {
    try {
      const athletes = await db.athlete.findMany({
        orderBy: { name: 'asc' }
      });
      res.status(200).json(athletes);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch roster' });
    }
  }

  async getAthleteDetail(req, res) {
    try {
      const { id } = req.params;

      const athlete = await db.athlete.findUnique({
        where: { id: parseInt(id) },
        include: {
          snapshots: {
            take: 20,
            orderBy: { capturedAt: 'desc' }
          },
          decisions: {
            where: { status: { not: 'resolved' } }
          }
        }
      });

      if (!athlete) return res.status(404).json({ error: 'Athlete not found' });

      res.status(200).json(athlete);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch athlete detail' });
    }
  }
}

module.exports = new PerformanceController();
