const OrganizationService = require('../services/OrganizationService');
const { OrganizationRequestDTO } = require('../dtos/OrganizationDTO');

/**
 * Organization Controller
 * Exposes endpoints for Super Users to manage organizations.
 */
class OrganizationController {
  async create(req, res) {
    try {
      // 1. Validate Input
      OrganizationRequestDTO.validate(req.body);
      const dto = new OrganizationRequestDTO(req.body);

      // 2. Call Service
      const result = await OrganizationService.createOrganization(dto);

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const result = await OrganizationService.getAllOrganizations();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve organizations' });
    }
  }
}

module.exports = new OrganizationController();
