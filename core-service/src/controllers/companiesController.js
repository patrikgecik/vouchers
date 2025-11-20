import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { query } from '../utils/database.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

export const getCompanyPublicProfile = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    throw createError('Company slug is required', 400);
  }

  const company = await Company.findBySlug(slug.toLowerCase());

  if (!company || company.status !== 'active') {
    throw createError('Company not found or inactive', 404);
  }

  const settings = typeof company.settings === 'string'
    ? JSON.parse(company.settings)
    : company.settings || {};

  const publicProfile = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    email: company.email,
    description: company.description,
    phone: company.phone,
    address: company.address,
    city: company.city,
    postalCode: company.postal_code,
    country: company.country,
    website: company.website,
    logoUrl: company.logo_url,
    category: settings?.category || settings?.industry || null,
    coverImage: settings?.branding?.coverImage || settings?.branding?.heroImage || null,
    hours: settings?.businessHours || settings?.hours || null,
    settings
  };

  res.json({
    success: true,
    data: {
      company: publicProfile
    }
  });
});

export const getCompany = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;

  if (!companyId) {
    throw createError('User is not associated with any company', 404);
  }

  const company = await Company.findById(companyId);
  
  if (!company) {
    throw createError('Company not found', 404);
  }

  // Get company statistics
  const userCount = await Company.getUserCount(companyId);

  res.json({
    success: true,
    data: {
      company: {
        ...company.toJSON(),
        userCount
      }
    }
  });
});

export const updateCompany = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const updateData = req.validatedData;

  if (!companyId) {
    throw createError('User is not associated with any company', 404);
  }

  const company = await Company.findById(companyId);
  
  if (!company) {
    throw createError('Company not found', 404);
  }

  // Check if email is being changed and is available
  if (updateData.email && updateData.email !== company.email) {
    const isEmailAvailable = await Company.isEmailAvailable(updateData.email, companyId);
    if (!isEmailAvailable) {
      throw createError('Email is already taken by another company', 400);
    }
  }

  // Update company
  const updatedCompany = await Company.updateById(companyId, updateData);

  res.json({
    success: true,
    message: 'Company updated successfully',
    data: {
      company: updatedCompany.toJSON()
    }
  });
});

export const getCompanySettings = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;

  if (!companyId) {
    throw createError('User is not associated with any company', 404);
  }

  const company = await Company.findById(companyId);
  
  if (!company) {
    throw createError('Company not found', 404);
  }

  const settings = typeof company.settings === 'string' ? 
    JSON.parse(company.settings) : company.settings;

  res.json({
    success: true,
    data: {
      settings: settings || {}
    }
  });
});

export const updateCompanySettings = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const { settings } = req.body;

  if (!companyId) {
    throw createError('User is not associated with any company', 404);
  }

  if (!settings || typeof settings !== 'object') {
    throw createError('Settings must be a valid object', 400);
  }

  const company = await Company.findById(companyId);
  
  if (!company) {
    throw createError('Company not found', 404);
  }

  // Merge with existing settings
  const currentSettings = typeof company.settings === 'string' ? 
    JSON.parse(company.settings) : company.settings || {};
  
  const newSettings = { ...currentSettings, ...settings };

  // Update company settings
  const updatedCompany = await Company.updateById(companyId, { settings: newSettings });

  res.json({
    success: true,
    message: 'Company settings updated successfully',
    data: {
      settings: newSettings
    }
  });
});

export const uploadLogo = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;

  if (!companyId) {
    throw createError('User is not associated with any company', 404);
  }

  if (!req.file) {
    throw createError('No file uploaded', 400);
  }

  // TODO: Implement file upload to cloud storage
  // For now, just return a placeholder URL
  const logoUrl = `/uploads/logos/${req.file.filename}`;

  // Update company with new logo URL
  const updatedCompany = await Company.updateById(companyId, { logoUrl });

  res.json({
    success: true,
    message: 'Logo uploaded successfully',
    data: {
      logoUrl,
      company: updatedCompany.toJSON()
    }
  });
});

export const removeLogo = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;

  if (!companyId) {
    throw createError('User is not associated with any company', 404);
  }

  // Remove logo URL from company
  const updatedCompany = await Company.updateById(companyId, { logoUrl: null });

  res.json({
    success: true,
    message: 'Logo removed successfully',
    data: {
      company: updatedCompany.toJSON()
    }
  });
});

export const getCompanyUsers = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const { page = 1, limit = 20, role, isActive } = req.query;

  if (!companyId) {
    throw createError('User is not associated with any company', 404);
  }

  const offset = (page - 1) * limit;
  
  const users = await User.findByCompany(companyId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
    role,
    isActive: isActive !== undefined ? isActive === 'true' : undefined
  });

  // Get total count for pagination
  const totalResult = await query(
    `SELECT COUNT(*) as total FROM users 
     WHERE company_id = $1 
     ${role ? 'AND role = $2' : ''} 
     ${isActive !== undefined ? `AND is_active = ${isActive === 'true'}` : ''}`,
    role ? [companyId, role] : [companyId]
  );

  const total = parseInt(totalResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      users: users.map(user => user.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
});

export const getCompanyStats = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;

  if (!companyId) {
    throw createError('User is not associated with any company', 404);
  }

  // Get user statistics
  const userStats = await User.getStats(companyId);

  // Get voucher statistics (if voucher service is available)
  let voucherStats = null;
  try {
    // TODO: Call voucher service API to get voucher statistics
    voucherStats = {
      totalVouchers: 0,
      activeVouchers: 0,
      usedVouchers: 0,
      thisMonthVouchers: 0
    };
  } catch (error) {
    console.log('Voucher service unavailable');
  }

  // Get reservation statistics (if reservation service is available)
  let reservationStats = null;
  try {
    // TODO: Call reservation service API to get reservation statistics
    reservationStats = {
      totalReservations: 0,
      activeReservations: 0,
      completedReservations: 0,
      thisMonthReservations: 0
    };
  } catch (error) {
    console.log('Reservation service unavailable');
  }

  res.json({
    success: true,
    data: {
      userStats: {
        totalUsers: parseInt(userStats.total_users),
        activeUsers: parseInt(userStats.active_users),
        verifiedUsers: parseInt(userStats.verified_users),
        adminUsers: parseInt(userStats.admin_users),
        recentLogins: parseInt(userStats.recent_logins)
      },
      voucherStats,
      reservationStats
    }
  });
});

// Admin only endpoints
export const getAllCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, subscriptionPlan } = req.query;

  const offset = (page - 1) * limit;
  
  const companies = await Company.findAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    status,
    subscriptionPlan
  });

  // Get total count
  const totalResult = await query(
    `SELECT COUNT(*) as total FROM companies 
     WHERE status = $1
     ${subscriptionPlan ? 'AND subscription_plan = $2' : ''}`,
    subscriptionPlan ? ['active', subscriptionPlan] : ['active']
  );

  const total = parseInt(totalResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      companies: companies.map(company => company.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCompanies: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
});

export const getCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await Company.getCompanyWithUsers(id);
  
  if (!company) {
    throw createError('Company not found', 404);
  }

  res.json({
    success: true,
    data: {
      company: company.toJSON()
    }
  });
});

export const createCompany = asyncHandler(async (req, res) => {
  const companyData = req.validatedData;

  // Check if slug is available
  const isSlugAvailable = await Company.isSlugAvailable(companyData.slug);
  if (!isSlugAvailable) {
    throw createError('Company slug is already taken', 400);
  }

  // Check if email is available
  const isEmailAvailable = await Company.isEmailAvailable(companyData.email);
  if (!isEmailAvailable) {
    throw createError('Email is already taken by another company', 400);
  }

  // Create company
  const company = await Company.create(companyData);

  res.status(201).json({
    success: true,
    message: 'Company created successfully',
    data: {
      company: company.toJSON()
    }
  });
});

export const updateCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.validatedData;

  const company = await Company.findById(id);
  
  if (!company) {
    throw createError('Company not found', 404);
  }

  // Check if email is being changed and is available
  if (updateData.email && updateData.email !== company.email) {
    const isEmailAvailable = await Company.isEmailAvailable(updateData.email, id);
    if (!isEmailAvailable) {
      throw createError('Email is already taken by another company', 400);
    }
  }

  // Update company
  const updatedCompany = await Company.updateById(id, updateData);

  res.json({
    success: true,
    message: 'Company updated successfully',
    data: {
      company: updatedCompany.toJSON()
    }
  });
});

export const deleteCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await Company.findById(id);
  
  if (!company) {
    throw createError('Company not found', 404);
  }

  try {
    const deleted = await Company.deleteById(id);
    
    if (!deleted) {
      throw createError('Failed to delete company', 500);
    }

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('Cannot delete company with existing users')) {
      throw createError('Cannot delete company with existing users. Remove all users first.', 400);
    }
    throw error;
  }
});

export const getGlobalStats = asyncHandler(async (req, res) => {
  const stats = await Company.getStats();

  res.json({
    success: true,
    data: {
      stats: {
        totalCompanies: parseInt(stats.total_companies),
        activeCompanies: parseInt(stats.active_companies),
        premiumCompanies: parseInt(stats.premium_companies),
        newCompanies: parseInt(stats.new_companies)
      }
    }
  });
});
