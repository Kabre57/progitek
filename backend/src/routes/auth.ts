import { Router } from 'express';
import {
  login,
  register,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
} from '../controllers/authController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../validations/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Gestion de l'authentification
 */

// Routes publiques
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

// Routes protégées
router.get("/me", authenticateToken, getMe);
router.post('/change-password', authenticateToken, validateRequest(changePasswordSchema), changePassword);
router.post('/logout', authenticateToken, logout);

// Route d'inscription (réservée aux administrateurs)
router.post('/register', 
  authenticateToken, 
  authorizeRoles('Administrator'), 
  validateRequest(registerSchema), 
  register
);

export default router;