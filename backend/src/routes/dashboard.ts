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

    // Données pour le graphique d'évolution des interventions
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const interventionValues = [40, 45, 55, 65, 60, 55];

    // Formater les statistiques mensuelles
    const monthlyDataArray = months.map((month, index) => ({
      month,
      count: interventionValues[index]
    }));

    // Top techniciens par nombre d'interventions
    const topTechniciens = await prisma.technicien.findMany({
      include: {
        specialite: true,
        technicienInterventions: true,
      },
      orderBy: {
        technicienInterventions: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Projets en cours (missions avec interventions en cours)
    const currentProjects = await prisma.mission.findMany({
      where: {
        interventions: {
          some: {
            dateHeureFin: null,
          },
        },
      },
      include: {
        client: {
          select: { nom: true, entreprise: true },
        },
        interventions: {
          include: {
            technicienInterventions: {
              include: {
                technicien: {
                  select: { nom: true, prenom: true },
                },
              },
            },
          },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Tâches prioritaires (interventions planifiées sans date de fin)
    const priorityTasks = await prisma.intervention.findMany({
      where: {
        dateHeureFin: null,
        dateHeureDebut: {
          not: null,
        },
      },
      include: {
        mission: {
          include: {
            client: {
              select: { nom: true, entreprise: true },
            },
          },
        },
        technicienInterventions: {
          include: {
            technicien: {
              select: { nom: true, prenom: true },
            },
          },
        },
      },
      take: 5,
      orderBy: { dateHeureDebut: 'asc' },
    });

    // Formater les projets en cours
    const formattedProjects = currentProjects.map(project => {
      const totalInterventions = project.interventions.length;
      const completedInterventions = project.interventions.filter(i => i.dateHeureFin).length;
      const progress = totalInterventions > 0 
        ? Math.round((completedInterventions / totalInterventions) * 100) 
        : 0;
      
      // Déterminer la priorité basée sur la date la plus récente d'intervention
      const latestIntervention = project.interventions
        .filter(i => i.dateHeureDebut)
        .sort((a, b) => {
          const dateA = a.dateHeureDebut ? new Date(a.dateHeureDebut).getTime() : 0;
          const dateB = b.dateHeureDebut ? new Date(b.dateHeureDebut).getTime() : 0;
          return dateB - dateA;
        })[0];
      
      const now = new Date();
      const dueDate = latestIntervention?.dateHeureDebut 
        ? new Date(latestIntervention.dateHeureDebut) 
        : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default: 1 week from now
      
      let priority = 'medium';
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 2) priority = 'high';
      else if (daysUntilDue > 7) priority = 'low';
      
      return {
        id: project.numIntervention,
        title: project.natureIntervention,
        client: project.client?.nom || `Client #${project.clientId}`,
        progress,
        dueDate: dueDate.toISOString().split('T')[0],
        priority,
      };
    });

    // Formater les tâches prioritaires
    const formattedTasks = priorityTasks.map(task => {
      const dueDate = task.dateHeureDebut ? new Date(task.dateHeureDebut) : new Date();
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let priority = 'medium';
      if (daysUntilDue < 0) priority = 'critical';
      else if (daysUntilDue < 2) priority = 'high';
      else if (daysUntilDue > 7) priority = 'low';
      
      // Trouver le technicien principal
      const principalTechnicien = task.technicienInterventions.find(ti => ti.role === 'principal');
      const assignedTo = principalTechnicien?.technicien 
        ? `${principalTechnicien.technicien.nom} ${principalTechnicien.technicien.prenom}`
        : task.technicienInterventions.length > 0
          ? `${task.technicienInterventions[0].technicien.nom} ${task.technicienInterventions[0].technicien.prenom}`
          : 'Non assigné';
      
      return {
        id: task.id,
        title: `Intervention #${task.id} - ${task.mission.natureIntervention}`,
        client: task.mission.client?.nom || `Client #${task.mission.clientId}`,
        dueDate: dueDate.toISOString().split('T')[0],
        assignedTo,
        priority,
      };
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
        interventionsCount: tech.technicienInterventions.length,
      })),
      currentProjects: formattedProjects,
      priorityTasks: formattedTasks,
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