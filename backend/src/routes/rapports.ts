import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createRapportSchema, updateRapportSchema, validateRapportSchema } from '../validations/rapport';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/rapports:
 *   get:
 *     summary: Récupérer la liste des rapports de mission
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const missionId = req.query.missionId ? parseInt(req.query.missionId as string) : undefined;
    const technicienId = req.query.technicienId ? parseInt(req.query.technicienId as string) : undefined;
    const statut = req.query.statut as string;
    const skip = (page - 1) * limit;

    // Construire la condition de recherche
    const where: any = {};
    if (missionId) where.missionId = missionId;
    if (technicienId) where.technicienId = technicienId;
    if (statut) where.statut = statut;

    const [rapports, total] = await Promise.all([
      prisma.rapportMission.findMany({
        where,
        skip,
        take: limit,
        include: {
          mission: {
            select: { 
              numIntervention: true, 
              natureIntervention: true,
              client: {
                select: { nom: true, entreprise: true }
              }
            },
          },
          intervention: {
            select: { 
              id: true, 
              dateHeureDebut: true, 
              dateHeureFin: true 
            },
          },
          technicien: {
            select: { 
              id: true, 
              nom: true, 
              prenom: true,
              specialite: {
                select: { libelle: true }
              }
            },
          },
          createdBy: {
            select: { 
              id: true, 
              nom: true, 
              prenom: true 
            },
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rapportMission.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Rapports récupérés avec succès',
      data: rapports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedResponse);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rapports',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/rapports/technicien/{technicienId}:
 *   get:
 *     summary: Récupérer les rapports d'un technicien
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/technicien/:technicienId', async (req: Request, res: Response) => {
  try {
    const technicienId = parseInt(req.params.technicienId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [rapports, total] = await Promise.all([
      prisma.rapportMission.findMany({
        where: { technicienId },
        skip,
        take: limit,
        include: {
          mission: {
            select: { 
              numIntervention: true, 
              natureIntervention: true,
              client: {
                select: { nom: true, entreprise: true }
              }
            },
          },
          intervention: {
            select: { 
              id: true, 
              dateHeureDebut: true, 
              dateHeureFin: true 
            },
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rapportMission.count({ where: { technicienId } }),
    ]);

    res.json({
      success: true,
      message: 'Rapports du technicien récupérés avec succès',
      data: rapports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedResponse);
  } catch (error) {
    console.error('Error fetching technician reports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rapports du technicien',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/rapports/mission/{missionId}:
 *   get:
 *     summary: Récupérer les rapports d'une mission
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/mission/:missionId', async (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.missionId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [rapports, total] = await Promise.all([
      prisma.rapportMission.findMany({
        where: { missionId },
        skip,
        take: limit,
        include: {
          technicien: {
            select: { 
              id: true, 
              nom: true, 
              prenom: true,
              specialite: {
                select: { libelle: true }
              }
            },
          },
          intervention: {
            select: { 
              id: true, 
              dateHeureDebut: true, 
              dateHeureFin: true 
            },
          },
          createdBy: {
            select: { 
              id: true, 
              nom: true, 
              prenom: true 
            },
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rapportMission.count({ where: { missionId } }),
    ]);

    res.json({
      success: true,
      message: 'Rapports de la mission récupérés avec succès',
      data: rapports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedResponse);
  } catch (error) {
    console.error('Error fetching mission reports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rapports de la mission',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/rapports:
 *   post:
 *     summary: Créer un nouveau rapport de mission
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateRequest(createRapportSchema), async (req: Request, res: Response) => {
  try {
    const { titre, contenu, interventionId, technicienId, missionId, images } = req.body;

    // Vérifier que l'intervention existe et appartient à la mission
    const intervention = await prisma.intervention.findFirst({
      where: {
        id: interventionId,
        missionId
      }
    });

    if (!intervention) {
      return res.status(404).json({
        success: false,
        message: 'Intervention non trouvée ou n\'appartient pas à la mission spécifiée',
      } as ApiResponse);
    }

    // Vérifier que le technicien existe et est associé à l'intervention
    const technicienIntervention = await prisma.technicienIntervention.findFirst({
      where: {
        technicienId,
        interventionId
      }
    });

    if (!technicienIntervention) {
      return res.status(404).json({
        success: false,
        message: 'Le technicien n\'est pas associé à cette intervention',
      } as ApiResponse);
    }

    // Créer le rapport
    const rapport = await prisma.rapportMission.create({
      data: {
        titre,
        contenu,
        interventionId,
        technicienId,
        missionId,
        createdById: req.user!.id,
        images: {
          create: images?.map((image: any, index: number) => ({
            url: image.url,
            description: image.description,
            ordre: index
          })) || []
        }
      },
      include: {
        mission: {
          select: { 
            numIntervention: true, 
            natureIntervention: true 
          },
        },
        technicien: {
          select: { 
            id: true, 
            nom: true, 
            prenom: true 
          },
        },
        intervention: true,
        images: true
      }
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'RAPPORT',
      entityId: rapport.id,
      details: `Rapport "${rapport.titre}" créé pour la mission #${rapport.missionId}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Rapport créé avec succès',
      data: rapport,
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rapport',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/rapports/{id}:
 *   get:
 *     summary: Récupérer un rapport par ID
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rapportId = parseInt(req.params.id);
    
    const rapport = await prisma.rapportMission.findUnique({
      where: { id: rapportId },
      include: {
        mission: {
          select: { 
            numIntervention: true, 
            natureIntervention: true,
            client: {
              select: { nom: true, entreprise: true }
            }
          },
        },
        intervention: {
          select: { 
            id: true, 
            dateHeureDebut: true, 
            dateHeureFin: true 
          },
        },
        technicien: {
          select: { 
            id: true, 
            nom: true, 
            prenom: true,
            specialite: {
              select: { libelle: true }
            }
          },
        },
        createdBy: {
          select: { 
            id: true, 
            nom: true, 
            prenom: true 
          },
        },
        images: true
      },
    });

    if (!rapport) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Rapport récupéré avec succès',
      data: rapport,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rapport',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/rapports/{id}:
 *   put:
 *     summary: Modifier un rapport
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validateRequest(updateRapportSchema), async (req: Request, res: Response) => {
  try {
    const rapportId = parseInt(req.params.id);
    const { titre, contenu, images } = req.body;
    
    // Vérifier que le rapport existe
    const existingRapport = await prisma.rapportMission.findUnique({
      where: { id: rapportId },
      include: { images: true }
    });

    if (!existingRapport) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé',
      } as ApiResponse);
    }

    // Vérifier que l'utilisateur est le créateur du rapport ou un admin
    if (existingRapport.createdById !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce rapport',
      } as ApiResponse);
    }

    // Vérifier que le rapport n'est pas déjà validé
    if (existingRapport.statut === 'validé') {
      return res.status(400).json({
        success: false,
        message: 'Ce rapport a déjà été validé et ne peut plus être modifié',
      } as ApiResponse);
    }

    // Mettre à jour le rapport
    const rapport = await prisma.rapportMission.update({
      where: { id: rapportId },
      data: {
        titre,
        contenu,
        updatedAt: new Date()
      },
      include: {
        mission: {
          select: { 
            numIntervention: true, 
            natureIntervention: true 
          },
        },
        technicien: {
          select: { 
            id: true, 
            nom: true, 
            prenom: true 
          },
        },
        intervention: true,
        images: true
      }
    });

    // Si des images sont fournies, mettre à jour les images
    if (images) {
      // Supprimer les images existantes
      await prisma.rapportImage.deleteMany({
        where: { rapportId }
      });

      // Ajouter les nouvelles images
      await Promise.all(
        images.map(async (image: any, index: number) => {
          await prisma.rapportImage.create({
            data: {
              rapportId,
              url: image.url,
              description: image.description,
              ordre: index
            }
          });
        })
      );

      // Récupérer le rapport avec les nouvelles images
      const updatedRapport = await prisma.rapportMission.findUnique({
        where: { id: rapportId },
        include: {
          mission: {
            select: { 
              numIntervention: true, 
              natureIntervention: true 
            },
          },
          technicien: {
            select: { 
              id: true, 
              nom: true, 
              prenom: true 
            },
          },
          intervention: true,
          images: true
        }
      });

      if (updatedRapport) {
        rapport.images = updatedRapport.images;
      }
    }

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'RAPPORT',
      entityId: rapport.id,
      details: `Rapport "${rapport.titre}" modifié`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Rapport modifié avec succès',
      data: rapport,
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du rapport',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/rapports/{id}/validate:
 *   patch:
 *     summary: Valider ou rejeter un rapport
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/validate', validateRequest(validateRapportSchema), async (req: Request, res: Response) => {
  try {
    const rapportId = parseInt(req.params.id);
    const { statut, commentaire } = req.body;
    
    // Vérifier que le rapport existe
    const existingRapport = await prisma.rapportMission.findUnique({
      where: { id: rapportId }
    });

    if (!existingRapport) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé',
      } as ApiResponse);
    }

    // Vérifier que l'utilisateur est un admin ou un manager
    if (req.user!.role !== 'admin' && req.user!.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à valider ou rejeter des rapports',
      } as ApiResponse);
    }

    // Mettre à jour le statut du rapport
    const rapport = await prisma.rapportMission.update({
      where: { id: rapportId },
      data: {
        statut,
        commentaire,
        dateValidation: new Date()
      },
      include: {
        mission: {
          select: { 
            numIntervention: true, 
            natureIntervention: true 
          },
        },
        technicien: {
          select: { 
            id: true, 
            nom: true, 
            prenom: true 
          },
        },
        intervention: true,
        images: true
      }
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'RAPPORT',
      entityId: rapport.id,
      details: `Rapport "${rapport.titre}" ${statut === 'validé' ? 'validé' : 'rejeté'}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Rapport ${statut === 'validé' ? 'validé' : 'rejeté'} avec succès`,
      data: rapport,
    } as ApiResponse);
  } catch (error) {
    console.error('Error validating report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du rapport',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/rapports/{id}:
 *   delete:
 *     summary: Supprimer un rapport
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const rapportId = parseInt(req.params.id);
    
    // Vérifier que le rapport existe
    const rapport = await prisma.rapportMission.findUnique({
      where: { id: rapportId }
    });

    if (!rapport) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé',
      } as ApiResponse);
    }

    // Vérifier que l'utilisateur est le créateur du rapport ou un admin
    if (rapport.createdById !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce rapport',
      } as ApiResponse);
    }

    // Vérifier que le rapport n'est pas déjà validé
    if (rapport.statut === 'validé') {
      return res.status(400).json({
        success: false,
        message: 'Ce rapport a déjà été validé et ne peut plus être supprimé',
      } as ApiResponse);
    }

    // Supprimer d'abord les images du rapport
    await prisma.rapportImage.deleteMany({
      where: { rapportId }
    });

    // Puis supprimer le rapport
    await prisma.rapportMission.delete({
      where: { id: rapportId }
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'RAPPORT',
      entityId: rapportId,
      details: `Rapport "${rapport.titre}" supprimé`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Rapport supprimé avec succès',
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du rapport',
    } as ApiResponse);
  }
});

export { router as rapportRouter };