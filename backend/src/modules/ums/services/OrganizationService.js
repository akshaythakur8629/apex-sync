const db = require('../../../shared/db');
const provisionTenant = require('../../../shared/db/provision');
const { OrganizationResponseDTO } = require('../dtos/OrganizationDTO');

/**
 * Organization Service
 * Handles core organization lifecycle events.
 */
class OrganizationService {
  async createOrganization(dto) {
    try {
      // 1. Check if slug exists
      const existing = await db.organization.findUnique({
        where: { slug: dto.slug }
      });
      if (existing) {
        throw new Error(`Organization with slug ${dto.slug} already exists.`);
      }

      // 2. Insert organization into UMS
      const org = await db.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug
        }
      });

      // 3. Provision isolated tenant schema
      await provisionTenant(org.slug);

      return new OrganizationResponseDTO(org);
    } catch (err) {
      console.error('Service Error - createOrganization:', err);
      throw err;
    }
  }

  async getAllOrganizations() {
    const orgs = await db.organization.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return orgs.map(org => new OrganizationResponseDTO(org));
  }
}

module.exports = new OrganizationService();
