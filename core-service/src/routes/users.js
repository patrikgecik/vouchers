import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getUserStats,
  updateUserRole
} from '../controllers/usersController.js';
import { authenticateToken, requireRole, requireCompany } from '../middleware/auth.js';
import { validateRequest, registerSchema, updateUserSchema } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication and company association
router.use(authenticateToken);
router.use(requireCompany);

// Get all users in company (admin only for full list, users can see limited info)
router.get('/', getUsers);

// Get user statistics (admin/manager only)
router.get('/stats', requireRole(['admin', 'manager']), getUserStats);

// Get specific user by ID
router.get('/:id', getUserById);

// Create new user (admin only)
router.post('/', requireRole('admin'), validateRequest(registerSchema), createUser);

// Update user (admin can update any user, users can update themselves)
router.put('/:id', updateUser);

// Update user role and permissions (admin only)
router.put('/:id/role', requireRole('admin'), updateUserRole);

// Deactivate/Activate user (admin only)
router.put('/:id/deactivate', requireRole('admin'), deactivateUser);
router.put('/:id/activate', requireRole('admin'), activateUser);

// Delete user (admin only)
router.delete('/:id', requireRole('admin'), deleteUser);

export default router;