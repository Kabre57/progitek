import { Router } from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clientController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createClientSchema, updateClientSchema } from '../validations/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestion des clients
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes CRUD
router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', validateBody(createClientSchema), createClient);
router.put('/:id', validateBody(updateClientSchema), updateClient);
router.delete('/:id', authorizeRoles('Administrator'), deleteClient);

export default router;