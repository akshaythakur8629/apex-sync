const express = require('express');
const router = express.Router();
const auth = require('../../shared/middleware/auth');
const OrganizationController = require('./controllers/OrganizationController');
const UserController = require('./controllers/UserController');
const RoleController = require('./controllers/RoleController');

/**
 * Super User Routes
 * Root management of organizations and global users.
 */
router.post('/super/organizations', auth(['org:manage']), OrganizationController.create);
router.get('/super/organizations', auth(['org:manage']), OrganizationController.list);

/**
 * Organization Management Routes
 * Granular RBAC for managing roles and users within an organization.
 */
router.post('/org/users', auth(['user:manage']), UserController.create);
router.get('/org/users', auth(['user:manage']), UserController.list);

router.post('/org/roles', auth(['user:manage']), RoleController.create);
router.get('/org/roles', auth(['user:manage']), RoleController.listRoles);
router.get('/org/permissions', auth(['user:manage']), RoleController.listPermissions);

module.exports = router;
