import { Router } from 'express';
import {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission
} from '../controllers/missionController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createMissionSchema, updateMissionSchema } from '../validations/mission';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Missions
 *   description: Gestion des missions
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes CRUD
router.get('/', getMissions);
router.get('/:id', getMissionById);
router.post('/', validateBody(createMissionSchema), createMission);
router.put('/:id', validateBody(updateMissionSchema), updateMission);
router.delete('/:id', authorizeRoles('Administrator'), deleteMission);

export default router;