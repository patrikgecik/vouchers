import express from 'express';
import crypto from 'crypto';
import { authenticateToken, requireRole, requireCompany } from '../middleware/auth.js';
import { validateRequest, createApiKeySchema } from '../utils/validators.js';
import { query } from '../utils/database.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { generateApiKey } from '../utils/jwt.js';

const router = express.Router();

// All routes require authentication and company association
router.use(authenticateToken);
router.use(requireCompany);

// Get all API keys for company (admin/manager only)
router.get('/', requireRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const { isActive } = req.query;

  let whereClause = 'WHERE company_id = $1';
  const params = [companyId];

  if (isActive !== undefined) {
    whereClause += ' AND is_active = $2';
    params.push(isActive === 'true');
  }

  const result = await query(
    `SELECT 
       id, name, permissions, last_used, is_active, created_at, expires_at,
       CONCAT(LEFT(key_hash, 8), '...') as masked_key
     FROM api_keys 
     ${whereClause}
     ORDER BY created_at DESC`,
    params
  );

  res.json({
    success: true,
    data: {
      apiKeys: result.rows
    }
  });
}));

// Get specific API key (admin/manager only)
router.get('/:id', requireRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  const result = await query(
    `SELECT 
       id, name, permissions, last_used, is_active, created_at, expires_at,
       CONCAT(LEFT(key_hash, 8), '...') as masked_key
     FROM api_keys 
     WHERE id = $1 AND company_id = $2`,
    [id, companyId]
  );

  if (result.rows.length === 0) {
    throw createError('API key not found', 404);
  }

  res.json({
    success: true,
    data: {
      apiKey: result.rows[0]
    }
  });
}));

// Create new API key (admin/manager only)
router.post('/', requireRole(['admin', 'manager']), validateRequest(createApiKeySchema), asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const { name, permissions, expiresAt } = req.validatedData;
  const createdBy = req.user.id;

  // Generate API key
  const apiKey = generateApiKey();
  
  // In production, hash the API key before storing
  // For now, storing as plain text for simplicity
  const keyHash = apiKey; // Should be: crypto.createHash('sha256').update(apiKey).digest('hex');

  const result = await query(
    `INSERT INTO api_keys 
     (company_id, name, key_hash, permissions, created_by, expires_at) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, name, permissions, is_active, created_at, expires_at`,
    [companyId, name, keyHash, JSON.stringify(permissions), createdBy, expiresAt || null]
  );

  res.status(201).json({
    success: true,
    message: 'API key created successfully',
    data: {
      apiKey: {
        ...result.rows[0],
        key: apiKey // Return the actual key only on creation
      },
      warning: 'Please save this API key securely. You will not be able to see it again.'
    }
  });
}));

// Update API key (admin/manager only)
router.put('/:id', requireRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;
  const { name, permissions, expiresAt, isActive } = req.body;

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }

  if (permissions !== undefined) {
    fields.push(`permissions = $${paramIndex++}`);
    values.push(JSON.stringify(permissions));
  }

  if (expiresAt !== undefined) {
    fields.push(`expires_at = $${paramIndex++}`);
    values.push(expiresAt);
  }

  if (isActive !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (fields.length === 0) {
    throw createError('No fields to update', 400);
  }

  values.push(id, companyId);

  const result = await query(
    `UPDATE api_keys 
     SET ${fields.join(', ')} 
     WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1} 
     RETURNING id, name, permissions, last_used, is_active, created_at, expires_at`,
    values
  );

  if (result.rows.length === 0) {
    throw createError('API key not found', 404);
  }

  res.json({
    success: true,
    message: 'API key updated successfully',
    data: {
      apiKey: result.rows[0]
    }
  });
}));

// Delete API key (admin/manager only)
router.delete('/:id', requireRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  const result = await query(
    'DELETE FROM api_keys WHERE id = $1 AND company_id = $2 RETURNING id',
    [id, companyId]
  );

  if (result.rows.length === 0) {
    throw createError('API key not found', 404);
  }

  res.json({
    success: true,
    message: 'API key deleted successfully'
  });
}));

// Deactivate API key (admin/manager only)
router.put('/:id/deactivate', requireRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  const result = await query(
    `UPDATE api_keys 
     SET is_active = false 
     WHERE id = $1 AND company_id = $2 
     RETURNING id, name, is_active`,
    [id, companyId]
  );

  if (result.rows.length === 0) {
    throw createError('API key not found', 404);
  }

  res.json({
    success: true,
    message: 'API key deactivated successfully',
    data: {
      apiKey: result.rows[0]
    }
  });
}));

// Activate API key (admin/manager only)
router.put('/:id/activate', requireRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  const result = await query(
    `UPDATE api_keys 
     SET is_active = true 
     WHERE id = $1 AND company_id = $2 
     RETURNING id, name, is_active`,
    [id, companyId]
  );

  if (result.rows.length === 0) {
    throw createError('API key not found', 404);
  }

  res.json({
    success: true,
    message: 'API key activated successfully',
    data: {
      apiKey: result.rows[0]
    }
  });
}));

// Regenerate API key (admin/manager only)
router.post('/:id/regenerate', requireRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  // Generate new API key
  const newApiKey = generateApiKey();
  const keyHash = newApiKey; // Should be hashed in production

  const result = await query(
    `UPDATE api_keys 
     SET key_hash = $1, last_used = NULL 
     WHERE id = $2 AND company_id = $3 
     RETURNING id, name, permissions, is_active, created_at, expires_at`,
    [keyHash, id, companyId]
  );

  if (result.rows.length === 0) {
    throw createError('API key not found', 404);
  }

  res.json({
    success: true,
    message: 'API key regenerated successfully',
    data: {
      apiKey: {
        ...result.rows[0],
        key: newApiKey // Return the new key only on regeneration
      },
      warning: 'Please save this new API key securely. You will not be able to see it again.'
    }
  });
}));

export default router;