/**
 * Organization DTOs
 */

class OrganizationRequestDTO {
  constructor(data) {
    this.name = data.name;
    this.slug = data.slug.toLowerCase().replace(/\s+/g, '-');
  }

  static validate(data) {
    if (!data.name || data.name.length < 3) {
      throw new Error('Name must be at least 3 characters long');
    }
    if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
      throw new Error('Slug must be alphanumeric with hyphens');
    }
  }
}

class OrganizationResponseDTO {
  constructor(org) {
    this.id = org.id;
    this.name = org.name;
    this.slug = org.slug;
    this.isActive = org.is_active;
    this.createdAt = org.created_at;
  }
}

module.exports = {
  OrganizationRequestDTO,
  OrganizationResponseDTO,
};
