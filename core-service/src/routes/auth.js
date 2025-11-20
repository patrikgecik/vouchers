import express from 'express';
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  logoutAll, 
  getProfile, 
  updateProfile, 
  changePassword,
  forgotPassword,
  resetPassword 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, registerSchema, loginSchema, updateUserSchema, changePasswordSchema } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', logout);
router.post('/logout-all', authenticateToken, logoutAll);

// Profile management
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateRequest(updateUserSchema), updateProfile);
router.put('/change-password', authenticateToken, validateRequest(changePasswordSchema), changePassword);

export default router;