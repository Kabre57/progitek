import { Router } from 'express';
import { getAuditLogsController, getAuditStatsController } from '../controllers/auditController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Logs et audit du système
 */

// Toutes les routes nécessitent une authentification et des droits admin
router.use(authenticateToken);
router.use(authorizeRoles('Administrator'));

// Routes d'audit
router.get('/logs', getAuditLogsController);
router.get('/stats', getAuditStatsController);

export default router;