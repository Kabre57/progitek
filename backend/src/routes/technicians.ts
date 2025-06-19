import { Router } from 'express';
import {
  getTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  getSpecialites
} from '../controllers/technicianController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createTechnicianSchema, updateTechnicianSchema } from '../validations/technician';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Technicians
 *   description: Gestion des techniciens
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les spécialités
router.get('/specialites', getSpecialites);

// Routes CRUD
router.get('/', getTechnicians);
router.get('/:id', getTechnicianById);
router.post('/', validateBody(createTechnicianSchema), createTechnician);
router.put('/:id', validateBody(updateTechnicianSchema), updateTechnician);
router.delete('/:id', authorizeRoles('Administrator'), deleteTechnician);

export default router;