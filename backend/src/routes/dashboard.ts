import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../models';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Récupérer les données du tableau de bord
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Statistiques générales
    const [
      totalClients,
      totalTechniciens,
      totalMissions,
      totalInterventions,
      missionsEnCours,
      interventionsEnCours,
      recentActivities,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.technicien.count(),
      prisma.mission.count(),
      prisma.intervention.count(),
      prisma.mission.count({
        where: {
          interventions: {
            some: {
              dateHeureFin: null,
            },
          },
        },
      }),
      prisma.intervention.count({
        where: {
          dateHeureFin: null,
        },
      }),
      prisma.auditLogs.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { nom: true, prenom: true },
          },
        },
      }),
    ]);

    // Statistiques par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await prisma.mission.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        numIntervention: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Formater les statistiques mensuelles
    const formattedMonthlyStats = monthlyStats.map(stat => {
      const date = new Date(stat.createdAt);
      return {
        month: date.toLocaleString('fr-FR', { month: 'short' }),
        year: date.getFullYear(),
        count: stat._count.numIntervention
      };
    });

    // Regrouper par mois (au cas où il y aurait plusieurs entrées pour le même mois)
    const monthlyData: Record<string, number> = {};
    formattedMonthlyStats.forEach(stat => {
      const key = `${stat.month} ${stat.year}`;
      monthlyData[key] = (monthlyData[key] || 0) + stat.count;
    });

    // Convertir en tableau pour le graphique
    const monthlyDataArray = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count
    }));

    // Top techniciens par nombre d'interventions
    const topTechniciens = await prisma.technicien.findMany({
      include: {
        specialite: true,
        interventions: true,
      },
      orderBy: {
        interventions: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const dashboardData = {
      stats: {
        totalClients,
        totalTechniciens,
        totalMissions,
        totalInterventions,
        missionsEnCours,
        interventionsEnCours,
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        action: activity.actionType,
        entity: activity.entityType,
        user: activity.user ? `${activity.user.nom} ${activity.user.prenom}` : 'Système',
        timestamp: activity.timestamp,
        details: activity.details,
      })),
      monthlyStats: monthlyDataArray,
      topTechniciens: topTechniciens.map(tech => ({
        id: tech.id,
        nom: tech.nom,
        prenom: tech.prenom,
        specialite: tech.specialite?.libelle,
        interventionsCount: tech.interventions.length,
      })),
    };

    res.json({
      success: true,
      message: 'Données du tableau de bord récupérées avec succès',
      data: dashboardData,
    } as ApiResponse);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données du tableau de bord',
    } as ApiResponse);
  }
});

export { router as dashboardRouter };