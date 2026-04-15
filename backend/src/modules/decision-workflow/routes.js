const express = require('express');
const router = express.Router();
const DecisionController = require('./controller'); // Will need to build this
const auth = require('../../shared/middleware/auth');
const tenant = require('../../shared/middleware/tenant');

// For now, mapping placeholders to service logic
const DecisionWorkflowService = require('./service');

router.get('/open', auth(['athlete:view']), tenant, async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM decisions WHERE status != 'resolved'");
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.post('/:id/rationale', auth(['rationale:capture']), tenant, async (req, res) => {
    try {
        await DecisionWorkflowService.finalizeDecision(req.params.id, req.user.id, req.body);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
