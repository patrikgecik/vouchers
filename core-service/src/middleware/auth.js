import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.js';
import { query } from '../utils/database.js';

const isAuthDisabled = () => process.env.DISABLE_AUTH === 'true';

const buildBypassUser = () => {
  const companyId = process.env.DISABLE_AUTH_COMPANY_ID ? parseInt(process.env.DISABLE_AUTH_COMPANY_ID, 10) : null;
  const companySlug = process.env.DISABLE_AUTH_COMPANY_SLUG || 'dev-company';
  return {
    id: 0,
    userId: 0,
    email: process.env.DISABLE_AUTH_USER_EMAIL || 'dev@bypass.local',
    role: process.env.DISABLE_AUTH_ROLE || 'system_admin',
    permissions: ['*'],
    company_id: companyId,
    companySlug,
    company_slug: companySlug,
    company_name: process.env.DISABLE_AUTH_COMPANY_NAME || 'Development Company'
  };
};

const applyBypassUser = (req) => {
  if (!req.__authBypassLogged) {
    console.warn('⚠️ DISABLE_AUTH=true – authentication temporarily bypassed');
    req.__authBypassLogged = true;
  }
  req.user = req.user || buildBypassUser();
};

export const authenticateToken = async (req, res, next) => {
  try {
    if (isAuthDisabled()) {
      applyBypassUser(req);
      return next();
    }

    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const userResult = await query(
      `SELECT u.*, c.slug as company_slug, c.name as company_name 
       FROM users u 
       LEFT JOIN companies c ON u.company_id = c.id 
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = {
      ...decoded,
      ...userResult.rows[0]
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    if (isAuthDisabled()) {
      applyBypassUser(req);
      return next();
    }

    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(token);
    
    const userResult = await query(
      `SELECT u.*, c.slug as company_slug, c.name as company_name 
       FROM users u 
       LEFT JOIN companies c ON u.company_id = c.id 
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.userId]
    );
    
    req.user = userResult.rows.length > 0 ? {
      ...decoded,
      ...userResult.rows[0]
    } : null;
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

export const requireCompany = async (req, res, next) => {
  try {
    if (isAuthDisabled()) {
      applyBypassUser(req);
      if (!req.company) {
        req.company = {
          id: req.user.company_id,
          slug: req.user.company_slug || req.user.companySlug,
          name: req.user.company_name || 'Development Company'
        };
      }
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.company_id) {
      return res.status(403).json({
        success: false,
        message: 'Company association required'
      });
    }

    // Verify company exists and is active
    const companyResult = await query(
      'SELECT * FROM companies WHERE id = $1 AND status = $2',
      [req.user.company_id, 'active']
    );
    
    if (companyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Company not found or inactive'
      });
    }

    req.company = companyResult.rows[0];
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying company association'
    });
  }
};

export const checkApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }

    const apiKeyResult = await query(
      `SELECT ak.*, c.name as company_name, c.slug as company_slug 
       FROM api_keys ak 
       JOIN companies c ON ak.company_id = c.id 
       WHERE ak.key_hash = $1 AND ak.is_active = true AND (ak.expires_at IS NULL OR ak.expires_at > NOW())`,
      [apiKey] // V production by mal byť hashovaný
    );
    
    if (apiKeyResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired API key'
      });
    }

    const apiKeyData = apiKeyResult.rows[0];
    
    // Update last used timestamp
    await query(
      'UPDATE api_keys SET last_used = NOW() WHERE id = $1',
      [apiKeyData.id]
    );

    req.apiKey = apiKeyData;
    req.company = {
      id: apiKeyData.company_id,
      name: apiKeyData.company_name,
      slug: apiKeyData.company_slug
    };
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error validating API key'
    });
  }
};

export const requireApiPermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key authentication required'
      });
    }

    const permissions = req.apiKey.permissions || [];
    
    if (!permissions.includes(permission) && !permissions.includes('*')) {
      return res.status(403).json({
        success: false,
        message: `API permission '${permission}' required`
      });
    }

    next();
  };
};
