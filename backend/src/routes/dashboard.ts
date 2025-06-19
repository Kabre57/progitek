import { Router } from 'express';
import { getDashboardData } from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Données du tableau de bord
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Route pour les données du dashboard
router.get('/stats', getDashboardData);

export default router;