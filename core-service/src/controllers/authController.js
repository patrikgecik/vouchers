import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, createTokenPayload } from '../utils/jwt.js';
import { query } from '../utils/database.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

export const register = asyncHandler(async (req, res) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    phone, 
    companyName, 
    companySlug 
  } = req.validatedData;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }

  let company = null;
  let isNewCompany = false;

  // If company data provided, create new company
  if (companyName && companySlug) {
    // Check if company slug is available
    const isSlugAvailable = await Company.isSlugAvailable(companySlug);
    if (!isSlugAvailable) {
      throw createError('Company slug is already taken', 400);
    }

    // Create new company
    company = await Company.create({
      name: companyName,
      slug: companySlug,
      email: email, // Use user's email as company email initially
    });
    
    isNewCompany = true;
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    companyId: company?.id,
    role: isNewCompany ? 'admin' : 'user', // First user of new company becomes admin
    permissions: isNewCompany ? ['*'] : []
  });

  // Create user profile
  await User.createProfile(user.id, {
    preferences: {},
    notificationsSettings: { email: true, push: true }
  });

  // Generate tokens
  const tokenPayload = createTokenPayload(user, company);
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days
  );

  // Update last login
  await User.updateLastLogin(user.id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: user.toJSON(),
      company: company?.toJSON() || null,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, companySlug } = req.validatedData;
  const normalizedSlug = companySlug?.trim().toLowerCase();

  // Find user with company info scoped to slug
  const userResult = await query(
    `SELECT u.*, c.slug as company_slug, c.name as company_name, c.settings as company_settings
     FROM users u 
     JOIN companies c ON u.company_id = c.id 
     WHERE u.email = $1 AND c.slug = $2`,
    [email, normalizedSlug]
  );

  if (userResult.rows.length === 0) {
    throw createError('Invalid email, password or company identifier', 401);
  }

  const userData = userResult.rows[0];
  const user = new User(userData);

  // Validate password
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.is_active) {
    throw createError('Account is deactivated', 401);
  }

  // Get company data if exists
  let company = null;
  if (user.company_id) {
    company = await Company.findById(user.company_id);
    if (company && company.status !== 'active') {
      throw createError('Company account is not active', 401);
    }
  }

  // Generate tokens
  const tokenPayload = createTokenPayload(user, company);
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Clean old refresh tokens
  await query(
    'DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()',
    [user.id]
  );

  // Store new refresh token
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
  );

  // Update last login
  await User.updateLastLogin(user.id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      company: company?.toJSON() || null,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    }
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Check if refresh token exists and is valid
  const tokenResult = await query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW() AND is_revoked = false',
    [refreshToken, decoded.userId]
  );

  if (tokenResult.rows.length === 0) {
    throw createError('Invalid or expired refresh token', 401);
  }

  // Get user and company data
  const userResult = await query(
    `SELECT u.*, c.slug as company_slug, c.name as company_name 
     FROM users u 
     LEFT JOIN companies c ON u.company_id = c.id 
     WHERE u.id = $1 AND u.is_active = true`,
    [decoded.userId]
  );

  if (userResult.rows.length === 0) {
    throw createError('User not found or inactive', 401);
  }

  const userData = userResult.rows[0];
  const user = new User(userData);

  let company = null;
  if (user.company_id) {
    company = await Company.findById(user.company_id);
  }

  // Generate new access token
  const tokenPayload = createTokenPayload(user, company);
  const newAccessToken = generateAccessToken(tokenPayload);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: newAccessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Revoke refresh token
    await query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
      [refreshToken]
    );
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Revoke all refresh tokens for user
  await query(
    'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
    [userId]
  );

  res.json({
    success: true,
    message: 'Logged out from all devices successfully'
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  let company = null;
  if (user.company_id) {
    company = await Company.findById(user.company_id);
  }

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      company: company?.toJSON() || null
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.validatedData;

  // Separate user and profile data
  const userData = {};
  const profileData = {};

  if (updateData.firstName !== undefined) userData.firstName = updateData.firstName;
  if (updateData.lastName !== undefined) userData.lastName = updateData.lastName;
  if (updateData.phone !== undefined) userData.phone = updateData.phone;

  if (updateData.bio !== undefined) profileData.bio = updateData.bio;
  if (updateData.position !== undefined) profileData.position = updateData.position;
  if (updateData.department !== undefined) profileData.department = updateData.department;
  if (updateData.preferences !== undefined) profileData.preferences = updateData.preferences;
  if (updateData.notificationsSettings !== undefined) profileData.notificationsSettings = updateData.notificationsSettings;

  // Update user data if any
  let user = null;
  if (Object.keys(userData).length > 0) {
    user = await User.updateById(userId, userData);
  } else {
    user = await User.findById(userId);
  }

  // Update profile data if any
  if (Object.keys(profileData).length > 0) {
    await User.createProfile(userId, profileData);
  }

  // Get updated user with profile
  const updatedUser = await User.findById(userId);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.validatedData;

  const user = await User.findById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.validatePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Update password
  await User.updatePassword(userId, newPassword);

  // Revoke all refresh tokens (force re-login on all devices)
  await query(
    'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
    [userId]
  );

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again on all devices.'
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw createError('Email is required', 400);
  }

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

  // Save reset token
  await query(
    'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
    [resetToken, resetTokenExpires, user.id]
  );

  // TODO: Send email with reset link
  // const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  res.json({
    success: true,
    message: 'If an account with that email exists, we have sent a password reset link.',
    // In development, include the token
    ...(process.env.NODE_ENV === 'development' && { resetToken })
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw createError('Token and new password are required', 400);
  }

  // Find user with valid reset token
  const userResult = await query(
    'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
    [token]
  );

  if (userResult.rows.length === 0) {
    throw createError('Invalid or expired reset token', 400);
  }

  const user = new User(userResult.rows[0]);

  // Update password and clear reset token
  await User.updatePassword(user.id, newPassword);
  await query(
    'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
    [user.id]
  );

  // Revoke all refresh tokens
  await query(
    'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
    [user.id]
  );

  res.json({
    success: true,
    message: 'Password reset successful. Please login with your new password.'
  });
});
