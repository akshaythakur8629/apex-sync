const db = require('../../../shared/db');
const { RoleResponseDTO } = require('../dtos/RoleDTO');

/**
 * Role Service
 * Manages the creation of roles and the mapping of granular permissions.
 */
class RoleService {
  async createRole(dto) {
    try {
      const role = await db.role.create({
        data: {
          organizationId: dto.organizationId,
          name: dto.name,
          description: dto.description,
          permissions: {
            create: dto.permissionIds.map(permId => ({
              permissionId: permId
            }))
          }
        }
      });
      return new RoleResponseDTO(role);
    } catch (err) {
      console.error('Service Error - createRole:', err);
      throw err;
    }
  }

  async getPermissions() {
    return await db.permission.findMany({
      orderBy: [{ module: 'asc' }, { slug: 'asc' }]
    });
  }

  async getOrgRoles(orgId) {
    const roles = await db.role.findMany({
      where: {
        OR: [
          { organizationId: orgId },
          { organizationId: null }
        ]
      },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });

    return roles.map(r => ({
      ...r,
      permissions: r.permissions.map(rp => rp.permission.slug)
    })).map(r => new RoleResponseDTO(r));
  }
}

module.exports = new RoleService();
