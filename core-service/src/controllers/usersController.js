import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { query } from '../utils/database.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const { page = 1, limit = 20, role, isActive } = req.query;

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

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  const user = await User.findById(id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if user belongs to the same company (unless requesting own profile)
  if (user.company_id !== companyId && user.id !== req.user.id) {
    throw createError('Access denied', 403);
  }

  res.json({
    success: true,
    data: {
      user: user.toJSON()
    }
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;
  const { email, password, firstName, lastName, phone, role = 'user', permissions = [] } = req.validatedData;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    companyId,
    role,
    permissions
  });

  // Create user profile
  await User.createProfile(user.id, {
    preferences: {},
    notificationsSettings: { email: true, push: true }
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: user.toJSON()
    }
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;
  const updateData = req.validatedData;

  const user = await User.findById(id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if user belongs to the same company
  if (user.company_id !== companyId) {
    throw createError('Access denied', 403);
  }

  // Prevent users from updating their own role/permissions unless they are admin
  if (user.id === req.user.id && (updateData.role || updateData.permissions) && req.user.role !== 'admin') {
    throw createError('Cannot modify your own role or permissions', 403);
  }

  // Update user
  const updatedUser = await User.updateById(id, updateData);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  const user = await User.findById(id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if user belongs to the same company
  if (user.company_id !== companyId) {
    throw createError('Access denied', 403);
  }

  // Prevent users from deleting themselves
  if (user.id === req.user.id) {
    throw createError('Cannot delete your own account', 403);
  }

  // Check if this is the last admin
  if (user.role === 'admin') {
    const adminUsers = await User.findByCompany(companyId, { role: 'admin' });
    if (adminUsers.length === 1) {
      throw createError('Cannot delete the last admin user', 403);
    }
  }

  // Delete user
  const deleted = await User.deleteById(id);
  
  if (!deleted) {
    throw createError('Failed to delete user', 500);
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  const user = await User.findById(id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if user belongs to the same company
  if (user.company_id !== companyId) {
    throw createError('Access denied', 403);
  }

  // Prevent users from deactivating themselves
  if (user.id === req.user.id) {
    throw createError('Cannot deactivate your own account', 403);
  }

  // Deactivate user
  const updatedUser = await User.updateById(id, { isActive: false });

  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
});

export const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.company_id;

  const user = await User.findById(id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if user belongs to the same company
  if (user.company_id !== companyId) {
    throw createError('Access denied', 403);
  }

  // Activate user
  const updatedUser = await User.updateById(id, { isActive: true });

  res.json({
    success: true,
    message: 'User activated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const companyId = req.user.company_id;

  const stats = await User.getStats(companyId);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers: parseInt(stats.total_users),
        activeUsers: parseInt(stats.active_users),
        verifiedUsers: parseInt(stats.verified_users),
        adminUsers: parseInt(stats.admin_users),
        recentLogins: parseInt(stats.recent_logins)
      }
    }
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, permissions } = req.body;
  const companyId = req.user.company_id;

  if (!role) {
    throw createError('Role is required', 400);
  }

  const user = await User.findById(id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if user belongs to the same company
  if (user.company_id !== companyId) {
    throw createError('Access denied', 403);
  }

  // Prevent users from updating their own role
  if (user.id === req.user.id) {
    throw createError('Cannot modify your own role', 403);
  }

  // If demoting the last admin, prevent it
  if (user.role === 'admin' && role !== 'admin') {
    const adminUsers = await User.findByCompany(companyId, { role: 'admin' });
    if (adminUsers.length === 1) {
      throw createError('Cannot demote the last admin user', 403);
    }
  }

  // Update user role and permissions
  const updatedUser = await User.updateById(id, { 
    role, 
    permissions: permissions || [] 
  });

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
});