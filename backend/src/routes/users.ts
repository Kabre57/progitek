import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles
} from '../controllers/userController';
import { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createUserSchema, updateUserSchema, getUsersQuerySchema } from '../validations/user';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les rôles
router.get('/roles', getRoles);

// Routes CRUD pour les utilisateurs
router.get('/', validateRequest(getUsersQuerySchema), getUsers);
router.get('/:id', getUserById);

// Routes réservées aux administrateurs
router.post('/', 
  authorizeRoles('Administrator'), 
  validateRequest(createUserSchema), 
  createUser
);

// Routes avec autorisation propriétaire ou admin
router.put('/:id', 
  authorizeOwnerOrAdmin,
  validateRequest(updateUserSchema), 
  updateUser
);

router.delete('/:id', 
  authorizeRoles('Administrator'), 
  deleteUser
);

export default router;