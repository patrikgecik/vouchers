import { query } from '../utils/database.js';
import bcrypt from 'bcryptjs';

export class User {
  constructor(data) {
    Object.assign(this, data);
  }

  static async create(userData) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      companyId,
      role = 'user',
      permissions = []
    } = userData;

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, phone, company_id, role, permissions) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [email, passwordHash, firstName, lastName, phone, companyId, role, JSON.stringify(permissions)]
    );

    return new User(result.rows[0]);
  }

  static async findById(id) {
    const result = await query(
      `SELECT u.*, up.bio, up.position, up.department, up.preferences, up.notifications_settings
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1`,
      [id]
    );

    return result.rows.length ? new User(result.rows[0]) : null;
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows.length ? new User(result.rows[0]) : null;
  }

  static async findByCompany(companyId, options = {}) {
    const { limit = 50, offset = 0, role, isActive = true } = options;

    let whereClause = 'WHERE company_id = $1';
    const params = [companyId];

    if (role) {
      whereClause += ' AND role = $' + (params.length + 1);
      params.push(role);
    }

    if (isActive !== null) {
      whereClause += ' AND is_active = $' + (params.length + 1);
      params.push(isActive);
    }

    const result = await query(
      `SELECT u.*, up.bio, up.position, up.department 
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return result.rows.map(row => new User(row));
  }

  static async updateById(id, updateData) {
    const {
      firstName,
      lastName,
      phone,
      role,
      permissions,
      isActive,
      isVerified
    } = updateData;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(firstName);
    }
    
    if (lastName !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(lastName);
    }
    
    if (phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    
    if (role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    
    if (permissions !== undefined) {
      fields.push(`permissions = $${paramIndex++}`);
      values.push(JSON.stringify(permissions));
    }
    
    if (isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }
    
    if (isVerified !== undefined) {
      fields.push(`is_verified = $${paramIndex++}`);
      values.push(isVerified);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length ? new User(result.rows[0]) : null;
  }

  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);

    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [passwordHash, id]
    );

    return result.rows.length ? new User(result.rows[0]) : null;
  }

  static async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  static async deleteById(id) {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows.length > 0;
  }

  async validatePassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  toJSON() {
    const { password_hash, ...user } = this;
    return user;
  }

  static async createProfile(userId, profileData) {
    const { bio, position, department, preferences, notificationsSettings } = profileData;

    const result = await query(
      `INSERT INTO user_profiles 
       (user_id, bio, position, department, preferences, notifications_settings) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         bio = EXCLUDED.bio,
         position = EXCLUDED.position,
         department = EXCLUDED.department,
         preferences = EXCLUDED.preferences,
         notifications_settings = EXCLUDED.notifications_settings,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId,
        bio,
        position,
        department,
        JSON.stringify(preferences || {}),
        JSON.stringify(notificationsSettings || { email: true, push: true })
      ]
    );

    return result.rows[0];
  }

  static async getStats(companyId) {
    const result = await query(
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
         COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
         COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
         COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as recent_logins
       FROM users 
       WHERE company_id = $1`,
      [companyId]
    );

    return result.rows[0];
  }
}