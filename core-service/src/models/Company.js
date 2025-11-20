import { query } from '../utils/database.js';

export class Company {
  constructor(data) {
    Object.assign(this, data);
  }

  static async create(companyData) {
    const {
      name,
      slug,
      email,
      phone,
      address,
      city,
      postalCode,
      country = 'Slovakia',
      website,
      description,
      settings = {},
      subscriptionPlan = 'basic'
    } = companyData;

    const result = await query(
      `INSERT INTO companies 
       (name, slug, email, phone, address, city, postal_code, country, website, description, settings, subscription_plan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [name, slug, email, phone, address, city, postalCode, country, website, description, JSON.stringify(settings), subscriptionPlan]
    );

    return new Company(result.rows[0]);
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );

    return result.rows.length ? new Company(result.rows[0]) : null;
  }

  static async findBySlug(slug) {
    const result = await query(
      'SELECT * FROM companies WHERE slug = $1',
      [slug]
    );

    return result.rows.length ? new Company(result.rows[0]) : null;
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM companies WHERE email = $1',
      [email]
    );

    return result.rows.length ? new Company(result.rows[0]) : null;
  }

  static async findAll(options = {}) {
    const { limit = 50, offset = 0, status = 'active', subscriptionPlan } = options;

    let whereClause = 'WHERE status = $1';
    const params = [status];

    if (subscriptionPlan) {
      whereClause += ' AND subscription_plan = $' + (params.length + 1);
      params.push(subscriptionPlan);
    }

    const result = await query(
      `SELECT * FROM companies 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return result.rows.map(row => new Company(row));
  }

  static async updateById(id, updateData) {
    const {
      name,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      website,
      description,
      logoUrl,
      settings,
      subscriptionPlan,
      status
    } = updateData;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    
    if (email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    
    if (phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    
    if (address !== undefined) {
      fields.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    
    if (city !== undefined) {
      fields.push(`city = $${paramIndex++}`);
      values.push(city);
    }
    
    if (postalCode !== undefined) {
      fields.push(`postal_code = $${paramIndex++}`);
      values.push(postalCode);
    }
    
    if (country !== undefined) {
      fields.push(`country = $${paramIndex++}`);
      values.push(country);
    }
    
    if (website !== undefined) {
      fields.push(`website = $${paramIndex++}`);
      values.push(website);
    }
    
    if (description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    
    if (logoUrl !== undefined) {
      fields.push(`logo_url = $${paramIndex++}`);
      values.push(logoUrl);
    }
    
    if (settings !== undefined) {
      fields.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(settings));
    }
    
    if (subscriptionPlan !== undefined) {
      fields.push(`subscription_plan = $${paramIndex++}`);
      values.push(subscriptionPlan);
    }
    
    if (status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE companies SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length ? new Company(result.rows[0]) : null;
  }

  static async deleteById(id) {
    // Check if company has users
    const usersResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE company_id = $1',
      [id]
    );

    if (parseInt(usersResult.rows[0].count) > 0) {
      throw new Error('Cannot delete company with existing users');
    }

    const result = await query(
      'DELETE FROM companies WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows.length > 0;
  }

  static async isSlugAvailable(slug, excludeId = null) {
    let query_text = 'SELECT COUNT(*) as count FROM companies WHERE slug = $1';
    const params = [slug];

    if (excludeId) {
      query_text += ' AND id != $2';
      params.push(excludeId);
    }

    const result = await query(query_text, params);
    return parseInt(result.rows[0].count) === 0;
  }

  static async isEmailAvailable(email, excludeId = null) {
    let query_text = 'SELECT COUNT(*) as count FROM companies WHERE email = $1';
    const params = [email];

    if (excludeId) {
      query_text += ' AND id != $2';
      params.push(excludeId);
    }

    const result = await query(query_text, params);
    return parseInt(result.rows[0].count) === 0;
  }

  static async getUserCount(id) {
    const result = await query(
      'SELECT COUNT(*) as count FROM users WHERE company_id = $1 AND is_active = true',
      [id]
    );

    return parseInt(result.rows[0].count);
  }

  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_companies,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_companies,
        COUNT(CASE WHEN subscription_plan = 'premium' THEN 1 END) as premium_companies,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_companies
      FROM companies
    `);

    return result.rows[0];
  }

  static async getCompanyWithUsers(id) {
    const companyResult = await query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );

    if (companyResult.rows.length === 0) {
      return null;
    }

    const usersResult = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.last_login, u.created_at
       FROM users u 
       WHERE u.company_id = $1 
       ORDER BY u.created_at DESC`,
      [id]
    );

    const company = new Company(companyResult.rows[0]);
    company.users = usersResult.rows;
    
    return company;
  }

  toJSON() {
    return {
      ...this,
      settings: typeof this.settings === 'string' ? JSON.parse(this.settings) : this.settings
    };
  }
}