import Joi from 'joi';

// User validations
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 100 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 100 characters',
    'any.required': 'Last name is required'
  }),
  phone: Joi.string().pattern(/^[+]?[0-9\s\-\(\)]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  companyName: Joi.string().min(2).max(255).optional(),
  companySlug: Joi.string().pattern(/^[a-z0-9\-]+$/).optional().messages({
    'string.pattern.base': 'Company slug can only contain lowercase letters, numbers, and hyphens'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  }),
  companySlug: Joi.string().pattern(/^[a-z0-9\-]+$/).required().messages({
    'string.pattern.base': 'Company slug can only contain lowercase letters, numbers, and hyphens',
    'any.required': 'Company slug is required for login'
  })
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[+]?[0-9\s\-\(\)]+$/).optional().allow(''),
  bio: Joi.string().max(1000).optional().allow(''),
  position: Joi.string().max(100).optional().allow(''),
  department: Joi.string().max(100).optional().allow(''),
  preferences: Joi.object().optional(),
  notificationsSettings: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional()
  }).optional()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required'
  })
});

// Company validations
export const createCompanySchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Company name must be at least 2 characters long',
    'string.max': 'Company name cannot exceed 255 characters',
    'any.required': 'Company name is required'
  }),
  slug: Joi.string().pattern(/^[a-z0-9\-]+$/).required().messages({
    'string.pattern.base': 'Company slug can only contain lowercase letters, numbers, and hyphens',
    'any.required': 'Company slug is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^[+]?[0-9\s\-\(\)]+$/).optional().allow(''),
  address: Joi.string().max(500).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  postalCode: Joi.string().max(20).optional().allow(''),
  country: Joi.string().max(100).optional(),
  website: Joi.string().uri().optional().allow(''),
  description: Joi.string().max(2000).optional().allow('')
});

export const updateCompanySchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[+]?[0-9\s\-\(\)]+$/).optional().allow(''),
  address: Joi.string().max(500).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  postalCode: Joi.string().max(20).optional().allow(''),
  country: Joi.string().max(100).optional(),
  website: Joi.string().uri().optional().allow(''),
  description: Joi.string().max(2000).optional().allow(''),
  settings: Joi.object().optional()
});

// API Key validations
export const createApiKeySchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'API key name must be at least 2 characters long',
    'string.max': 'API key name cannot exceed 255 characters',
    'any.required': 'API key name is required'
  }),
  permissions: Joi.array().items(Joi.string()).default([]),
  expiresAt: Joi.date().greater('now').optional()
});

// Helper function to validate request data
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    req.validatedData = value;
    next();
  };
};

// Email validation helper
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Slug validation helper
export const isValidSlug = (slug) => {
  const slugRegex = /^[a-z0-9\-]+$/;
  return slugRegex.test(slug);
};

// Phone validation helper
export const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[+]?[0-9\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};
