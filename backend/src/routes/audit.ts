import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/audit/logs:
 *   get:
 *     summary: Récupérer les logs d'audit
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrer par utilisateur
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *         description: Filtrer par type d'action
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filtrer par type d'entité
 */
router.get('/logs', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const actionType = req.query.actionType as string;
    const entityType = req.query.entityType as string;

    const result = await auditService.getAuditLogs({
      page,
      limit,
      userId,
      actionType,
      entityType,
    });

    res.json({
      success: true,
      message: 'Logs d\'audit récupérés avec succès',
      data: result.logs,
      pagination: result.pagination,
    } as PaginatedResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs d\'audit',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/audit/stats:
 *   get:
 *     summary: Récupérer les statistiques d'audit
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const stats = await auditService.getAuditStats();

    res.json({
      success: true,
      message: 'Statistiques d\'audit récupérées avec succès',
      data: stats,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques d\'audit',
    } as ApiResponse);
  }
});

export { router as auditRouter };