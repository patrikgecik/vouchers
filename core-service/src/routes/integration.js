import express from 'express';
import { authenticateToken, checkApiKey, requireApiPermission } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { query } from '../utils/database.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = express.Router();

// Middleware to handle both token and API key authentication
const flexibleAuth = (req, res, next) => {
  const hasToken = req.headers.authorization;
  const hasApiKey = req.headers['x-api-key'];

  if (hasApiKey) {
    return checkApiKey(req, res, next);
  } else if (hasToken) {
    return authenticateToken(req, res, next);
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required (token or API key)'
    });
  }
};

// Validate user for external services
router.post('/validate-user', flexibleAuth, asyncHandler(async (req, res) => {
  const { userId, companyId } = req.body;

  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const user = await User.findById(userId);
  
  if (!user || !user.is_active) {
    return res.status(404).json({
      success: false,
      message: 'User not found or inactive'
    });
  }

  // If companyId provided, verify user belongs to that company
  if (companyId && user.company_id !== companyId) {
    return res.status(403).json({
      success: false,
      message: 'User does not belong to specified company'
    });
  }

  // If using API key, verify company access
  if (req.apiKey && user.company_id !== req.apiKey.company_id) {
    return res.status(403).json({
      success: false,
      message: 'API key does not have access to this user\'s company'
    });
  }

  const company = user.company_id ? await Company.findById(user.company_id) : null;

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      company: company?.toJSON() || null,
      permissions: user.permissions || [],
      isValid: true
    }
  });
}));

// Get company information for external services
router.get('/company/:companyId', flexibleAuth, asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  // If using API key, verify company access
  if (req.apiKey && req.apiKey.company_id !== parseInt(companyId)) {
    throw createError('API key does not have access to this company', 403);
  }

  // If using user token, verify user belongs to this company
  if (req.user && req.user.company_id !== parseInt(companyId)) {
    throw createError('User does not have access to this company', 403);
  }

  const company = await Company.findById(companyId);
  
  if (!company || company.status !== 'active') {
    throw createError('Company not found or inactive', 404);
  }

  res.json({
    success: true,
    data: {
      company: company.toJSON()
    }
  });
}));

// Get company by slug for external services
router.get('/company/slug/:slug', flexibleAuth, asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const company = await Company.findBySlug(slug);
  
  if (!company || company.status !== 'active') {
    throw createError('Company not found or inactive', 404);
  }

  // If using API key, verify company access
  if (req.apiKey && req.apiKey.company_id !== company.id) {
    throw createError('API key does not have access to this company', 403);
  }

  res.json({
    success: true,
    data: {
      company: company.toJSON()
    }
  });
}));

// Get company users for external services
router.get('/company/:companyId/users', flexibleAuth, requireApiPermission('users:read'), asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { role, isActive = true, limit = 100 } = req.query;

  // If using API key, verify company access
  if (req.apiKey && req.apiKey.company_id !== parseInt(companyId)) {
    throw createError('API key does not have access to this company', 403);
  }

  const users = await User.findByCompany(companyId, {
    role,
    isActive: isActive === 'true',
    limit: Math.min(parseInt(limit), 100) // Max 100 users per request
  });

  res.json({
    success: true,
    data: {
      users: users.map(user => user.toJSON())
    }
  });
}));

// Log integration activity
router.post('/log', checkApiKey, asyncHandler(async (req, res) => {
  const { service, action, requestData, responseData, status, errorMessage, durationMs } = req.body;

  if (!service || !action || !status) {
    throw createError('Service, action, and status are required', 400);
  }

  await query(
    `INSERT INTO integration_logs 
     (company_id, service, action, request_data, response_data, status, error_message, duration_ms) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      req.apiKey.company_id,
      service,
      action,
      requestData ? JSON.stringify(requestData) : null,
      responseData ? JSON.stringify(responseData) : null,
      status,
      errorMessage || null,
      durationMs || null
    ]
  );

  res.json({
    success: true,
    message: 'Integration activity logged'
  });
}));

// Health check endpoint for external services
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'core-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Get integration logs (API key required)
router.get('/logs', checkApiKey, asyncHandler(async (req, res) => {
  const { service, action, status, limit = 50, offset = 0 } = req.query;
  const companyId = req.apiKey.company_id;

  let whereClause = 'WHERE company_id = $1';
  const params = [companyId];

  if (service) {
    whereClause += ' AND service = $' + (params.length + 1);
    params.push(service);
  }

  if (action) {
    whereClause += ' AND action = $' + (params.length + 1);
    params.push(action);
  }

  if (status) {
    whereClause += ' AND status = $' + (params.length + 1);
    params.push(status);
  }

  const result = await query(
    `SELECT * FROM integration_logs 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), parseInt(offset)]
  );

  res.json({
    success: true,
    data: {
      logs: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length
      }
    }
  });
}));

export default router;