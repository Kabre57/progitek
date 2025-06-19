import { Router } from 'express';
import {
  getInterventions,
  getInterventionById,
  createIntervention,
  updateIntervention,
  deleteIntervention
} from '../controllers/interventionController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createInterventionSchema, updateInterventionSchema } from '../validations/intervention';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Interventions
 *   description: Gestion des interventions
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes CRUD
router.get('/', getInterventions);
router.get('/:id', getInterventionById);
router.post('/', validateBody(createInterventionSchema), createIntervention);
router.put('/:id', validateBody(updateInterventionSchema), updateIntervention);
router.delete('/:id', authorizeRoles('Administrator'), deleteIntervention);

export default router;