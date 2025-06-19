import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { getAuditLogs, getAuditStats } from '../services/auditService';

/**
 * @swagger
 * /audit/logs:
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
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logs d'audit
 */
export const getAuditLogsController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  
  const filters = {
    userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
    actionType: req.query.actionType as string,
    entityType: req.query.entityType as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string
  };

  const result = await getAuditLogs(page, limit, filters);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @swagger
 * /audit/stats:
 *   get:
 *     summary: Récupérer les statistiques d'audit
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques d'audit
 */
export const getAuditStatsController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await getAuditStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});