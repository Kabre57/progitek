import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { ApiResponse } from '../models';
import { generateReportSchema } from '../validations/report';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Récupérer la liste des rapports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: { nom: true, prenom: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Rapports récupérés avec succès',
      data: reports,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rapports',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/reports/generate:
 *   post:
 *     summary: Générer un nouveau rapport
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.post('/generate', validateRequest(generateReportSchema), async (req: Request, res: Response) => {
  try {
    const { reportType, startDate, endDate, filters } = req.body;

    let reportData: any = {};

    switch (reportType) {
      case 'clients':
        reportData = await generateClientsReport(startDate, endDate, filters);
        break;
      case 'missions':
        reportData = await generateMissionsReport(startDate, endDate, filters);
        break;
      case 'interventions':
        reportData = await generateInterventionsReport(startDate, endDate, filters);
        break;
      case 'techniciens':
        reportData = await generateTechniciensReport(startDate, endDate, filters);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Type de rapport non supporté',
        } as ApiResponse);
    }

    const report = await prisma.report.create({
      data: {
        reportType,
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      message: 'Rapport généré avec succès',
      data: {
        report,
        data: reportData,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Récupérer les données du dashboard
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboardData = await generateDashboardReport();

    res.json({
      success: true,
      message: 'Données du dashboard récupérées avec succès',
      data: dashboardData,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données du dashboard',
    } as ApiResponse);
  }
});

// Fonctions de génération de rapports
async function generateClientsReport(startDate?: string, endDate?: string, filters?: any) {
  const where: any = {};
  
  if (startDate && endDate) {
    where.dateDInscription = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (filters?.statut) {
    where.statut = filters.statut;
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      missions: {
        include: {
          interventions: true,
        },
      },
    },
  });

  return {
    totalClients: clients.length,
    clientsParStatut: clients.reduce((acc, client) => {
      acc[client.statut] = (acc[client.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    clients: clients.map(client => ({
      ...client,
      totalMissions: client.missions.length,
      totalInterventions: client.missions.reduce((sum, mission) => sum + mission.interventions.length, 0),
    })),
  };
}

async function generateMissionsReport(startDate?: string, endDate?: string, filters?: any) {
  const where: any = {};
  
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const missions = await prisma.mission.findMany({
    where,
    include: {
      client: true,
      interventions: {
        include: {
          technicienInterventions: {
            include: {
              technicien: true
            }
          }
        }
      },
    },
  });

  return {
    totalMissions: missions.length,
    missionsParClient: missions.reduce((acc, mission) => {
      const clientNom = mission.client?.nom || 'Sans client';
      acc[clientNom] = (acc[clientNom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    missions,
  };
}

async function generateInterventionsReport(startDate?: string, endDate?: string, filters?: any) {
  const where: any = {};
  
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const interventions = await prisma.intervention.findMany({
    where,
    include: {
      mission: {
        include: { client: true },
      },
      technicienInterventions: {
        include: {
          technicien: {
            include: { specialite: true }
          }
        }
      },
    },
  });

  return {
    totalInterventions: interventions.length,
    interventionsParTechnicien: interventions.reduce((acc, intervention) => {
      const technicien = intervention.technicienInterventions[0]?.technicien;
      const technicienNom = technicien ? 
        `${technicien.nom} ${technicien.prenom}` : 
        'Non assigné';
      acc[technicienNom] = (acc[technicienNom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    dureeTotal: interventions.reduce((sum: number, intervention) => sum + (intervention.duree || 0), 0),
    interventions,
  };
}

async function generateTechniciensReport(startDate?: string, endDate?: string, filters?: any) {
  const techniciens = await prisma.technicien.findMany({
    include: {
      specialite: true,
      technicienInterventions: {
        where: startDate && endDate ? {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        } : undefined,
        include: {
          intervention: {
            include: {
              mission: {
                include: { client: true }
              }
            }
          }
        },
      },
    },
  });

  return {
    totalTechniciens: techniciens.length,
    techniciensParSpecialite: techniciens.reduce((acc, technicien) => {
      const specialite = technicien.specialite?.libelle || 'Sans spécialité';
      acc[specialite] = (acc[specialite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    techniciens: techniciens.map(technicien => ({
      ...technicien,
      totalInterventions: technicien.technicienInterventions.length,
      dureeTotal: technicien.technicienInterventions.reduce(
        (sum: number, ti) => sum + (ti.intervention.duree || 0), 
        0
      ),
    })),
  };
}

async function generateDashboardReport() {
  const [
    totalClients,
    totalTechniciens,
    totalMissions,
    totalInterventions,
    recentMissions,
    recentInterventions,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.technicien.count(),
    prisma.mission.count(),
    prisma.intervention.count(),
    prisma.mission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }),
    prisma.intervention.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        mission: { include: { client: true } },
        technicienInterventions: {
          include: {
            technicien: true
          }
        }
      },
    }),
  ]);

  return {
    stats: {
      totalClients,
      totalTechniciens,
      totalMissions,
      totalInterventions,
    },
    recentMissions,
    recentInterventions: recentInterventions.map(intervention => ({
      ...intervention,
      technicien: intervention.technicienInterventions[0]?.technicien
    })),
  };
}

export { router as reportRouter };