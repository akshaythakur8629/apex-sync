const UserService = require('../services/UserService');
const { UserRequestDTO } = require('../dtos/UserDTO');

class UserController {
  async create(req, res) {
    try {
      UserRequestDTO.validate(req.body);
      const dto = new UserRequestDTO(req.body);
      
      // Force organizationId to the admin's organization unless they are a Super User
      if (!req.user.is_super_user) {
        dto.organizationId = req.user.organization_id;
      }

      // 2. Call Service
      const result = await UserService.createUser(dto);

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const orgId = req.user.is_super_user ? req.query.orgId : req.user.organization_id;
      if (!orgId) return res.status(400).json({ error: 'Organization ID required' });

      const result = await UserService.getUsersByOrganization(orgId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  }
}

module.exports = new UserController();
