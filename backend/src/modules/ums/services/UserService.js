const db = require('../../../shared/db');
const { UserResponseDTO } = require('../dtos/UserDTO');

/**
 * User Service
 * Manages user accounts and their role assignments.
 */
class UserService {
  async createUser(dto) {
    try {
      // Create user and link roles in a single Prisma operation
      const user = await db.user.create({
        data: {
          organizationId: dto.organizationId,
          email: dto.email,
          passwordHash: dto.password, // In real scenario, hash with bcrypt
          name: dto.name,
          roles: {
            create: dto.roleIds.map(roleId => ({
              roleId: roleId
            }))
          }
        },
        include: {
          roles: {
            include: { role: true }
          }
        }
      });

      return new UserResponseDTO(user);
    } catch (err) {
      console.error('Service Error - createUser:', err);
      throw err;
    }
  }

  async getUsersByOrganization(orgId) {
    const users = await db.user.findMany({
      where: { organizationId: orgId },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });

    // Flatten role names for the DTO
    return users.map(u => ({
      ...u,
      roles: u.roles.map(ur => ur.role.name)
    })).map(u => new UserResponseDTO(u));
  }
}

module.exports = new UserService();
