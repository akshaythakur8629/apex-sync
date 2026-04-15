const RoleService = require('../services/RoleService');
const { RoleRequestDTO } = require('../dtos/RoleDTO');

/**
 * Role Controller
 * Exposes endpoints for managers to define roles and set permissions.
 */
class RoleController {
  async create(req, res) {
    try {
      RoleRequestDTO.validate(req.body);
      const dto = new RoleRequestDTO(req.body);

      // Force organizationId unless Super User
      if (!req.user.is_super_user) {
        dto.organizationId = req.user.organization_id;
      }

      const result = await RoleService.createRole(dto);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async listPermissions(req, res) {
    try {
      const result = await RoleService.getPermissions();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve permissions' });
    }
  }

  async listRoles(req, res) {
    try {
      const orgId = req.user.is_super_user ? req.query.orgId : req.user.organization_id;
      const result = await RoleService.getOrgRoles(orgId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve roles' });
    }
  }
}

module.exports = new RoleController();
