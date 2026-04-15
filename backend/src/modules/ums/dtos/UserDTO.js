/**
 * User DTOs
 */

class UserRequestDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.organizationId = data.organizationId;
    this.roleIds = data.roleIds || []; // Array of role IDs to assign
  }

  static validate(data) {
    if (!data.email || !data.email.includes('@')) throw new Error('Invalid email');
    if (!data.password || data.password.length < 8) throw new Error('Password must be at least 8 chars');
  }
}

class UserResponseDTO {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.organizationId = user.organization_id;
    this.isSuperUser = user.is_super_user;
    this.roles = user.roles || [];
  }
}

module.exports = {
  UserRequestDTO,
  UserResponseDTO,
};
