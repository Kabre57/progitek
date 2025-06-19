import { Router } from 'express';
import { getReports, generateReport, getDashboardData } from '../controllers/reportController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { generateReportSchema } from '../validations/report';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Génération et gestion des rapports
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les rapports
router.get('/', getReports);
router.post('/generate', validateBody(generateReportSchema), generateReport);

export default router;