const express = require('express');
const router = express.Router();
const authController = require('./controller');
const authMiddleware = require('../../shared/middleware/auth');

router.post('/login', authController.login);
router.get('/me', authMiddleware(), authController.getMe);

module.exports = router;
