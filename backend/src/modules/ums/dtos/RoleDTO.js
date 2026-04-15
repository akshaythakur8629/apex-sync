/**
 * Role DTOs
 */

class RoleRequestDTO {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.permissionIds = data.permissionIds || [];
    this.organizationId = data.organizationId;
  }

  static validate(data) {
    if (!data.name) throw new Error('Role name is required');
  }
}

class RoleResponseDTO {
  constructor(role) {
    this.id = role.id;
    this.name = role.name;
    this.organizationId = role.organization_id;
    this.permissions = role.permissions || [];
  }
}

module.exports = {
  RoleRequestDTO,
  RoleResponseDTO,
};
