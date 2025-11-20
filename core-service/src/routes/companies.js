import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getCompanyPublicProfile,
  getCompany,
  updateCompany,
  getCompanySettings,
  updateCompanySettings,
  uploadLogo,
  removeLogo,
  getCompanyUsers,
  getCompanyStats,
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompanyById,
  deleteCompanyById,
  getGlobalStats
} from '../controllers/companiesController.js';
import { authenticateToken, requireRole, requireCompany } from '../middleware/auth.js';
import { validateRequest, createCompanySchema, updateCompanySchema } from '../utils/validators.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logos/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Public company info (client-facing)
router.get('/public/:slug', getCompanyPublicProfile);

// Routes for system administrators
router.get('/all', authenticateToken, requireRole('system_admin'), getAllCompanies);
router.get('/stats/global', authenticateToken, requireRole('system_admin'), getGlobalStats);
router.get('/:id', authenticateToken, requireRole('system_admin'), getCompanyById);
router.post('/', authenticateToken, requireRole('system_admin'), validateRequest(createCompanySchema), createCompany);
router.put('/:id', authenticateToken, requireRole('system_admin'), validateRequest(updateCompanySchema), updateCompanyById);
router.delete('/:id', authenticateToken, requireRole('system_admin'), deleteCompanyById);

// Company-specific routes (require company association)
router.use(authenticateToken);
router.use(requireCompany);

// Get current company
router.get('/', getCompany);

// Update company (admin only)
router.put('/', requireRole(['admin', 'manager']), validateRequest(updateCompanySchema), updateCompany);

// Company settings
router.get('/settings', getCompanySettings);
router.put('/settings', requireRole(['admin', 'manager']), updateCompanySettings);

// Logo management
router.post('/logo', requireRole(['admin', 'manager']), upload.single('logo'), uploadLogo);
router.delete('/logo', requireRole(['admin', 'manager']), removeLogo);

// Company users
router.get('/users', getCompanyUsers);

// Company statistics
router.get('/stats', getCompanyStats);

export default router;
