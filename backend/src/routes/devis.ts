import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { 
  createDevisSchema, 
  updateDevisSchema, 
  validateDevisSchema,
  responseDevisSchema 
} from '../validations/devis';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/devis:
 *   get:
 *     summary: Récupérer la liste des devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const statut = req.query.statut as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (statut) {
      where.statut = statut;
    }

    const [devis, total] = await Promise.all([
      prisma.devis.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: { nom: true, email: true, entreprise: true },
          },
          mission: {
            select: { numIntervention: true, natureIntervention: true },
          },
          validateur: {
            select: { nom: true, prenom: true },
          },
          facture: {
            select: { id: true, numero: true, statut: true },
          },
          lignes: {
            orderBy: { ordre: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.devis.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Devis récupérés avec succès',
      data: devis,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devis',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/devis:
 *   post:
 *     summary: Créer un nouveau devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateRequest(createDevisSchema), async (req: Request, res: Response) => {
  try {
    const { lignes, ...devisData } = req.body;

    // Calculer les montants
    let montantHT = 0;
    const lignesWithMontant = lignes.map((ligne: any, index: number) => {
      const montantLigne = ligne.quantite * ligne.prixUnitaire;
      montantHT += montantLigne;
      return {
        ...ligne,
        montantHT: montantLigne,
        ordre: index + 1,
      };
    });

    const montantTTC = montantHT * (1 + devisData.tauxTVA / 100);

    // Générer le numéro de devis
    const year = new Date().getFullYear();
    const count = await prisma.devis.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });
    const numero = `DEV-${year}-${String(count + 1).padStart(4, '0')}`;

    const devis = await prisma.devis.create({
      data: {
        numero,
        ...devisData,
        montantHT,
        montantTTC,
        statut: 'brouillon',
        dateCreation: new Date(),
        lignes: {
          create: lignesWithMontant,
        },
      },
      include: {
        client: true,
        mission: true,
        lignes: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'DEVIS',
      entityId: devis.id,
      details: `Devis ${devis.numero} créé`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Devis créé avec succès',
      data: devis,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du devis',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/devis/{id}:
 *   get:
 *     summary: Récupérer un devis par ID
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const devisId = parseInt(req.params.id);
    
    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: {
        client: true,
        mission: true,
        validateur: {
          select: { nom: true, prenom: true },
        },
        facture: true,
        lignes: {
          orderBy: { ordre: 'asc' },
        },
      },
    });

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Devis récupéré avec succès',
      data: devis,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du devis',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/devis/{id}:
 *   put:
 *     summary: Modifier un devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validateRequest(updateDevisSchema), async (req: Request, res: Response) => {
  try {
    const devisId = parseInt(req.params.id);
    const { lignes, ...devisData } = req.body;

    // Vérifier que le devis peut être modifié
    const existingDevis = await prisma.devis.findUnique({
      where: { id: devisId },
    });

    if (!existingDevis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé',
      } as ApiResponse);
    }

    if (!['brouillon', 'refuse_dg', 'refuse_client'].includes(existingDevis.statut)) {
      return res.status(400).json({
        success: false,
        message: 'Ce devis ne peut plus être modifié',
      } as ApiResponse);
    }

    let updateData: any = { ...devisData };

    // Si des lignes sont fournies, recalculer les montants
    if (lignes) {
      let montantHT = 0;
      const lignesWithMontant = lignes.map((ligne: any, index: number) => {
        const montantLigne = ligne.quantite * ligne.prixUnitaire;
        montantHT += montantLigne;
        return {
          ...ligne,
          montantHT: montantLigne,
          ordre: index + 1,
        };
      });

      const tauxTVA = devisData.tauxTVA || existingDevis.tauxTVA;
      const montantTTC = montantHT * (1 + tauxTVA / 100);

      updateData = {
        ...updateData,
        montantHT,
        montantTTC,
      };

      // Supprimer les anciennes lignes et créer les nouvelles
      await prisma.devisLigne.deleteMany({
        where: { devisId },
      });
    }

    const devis = await prisma.devis.update({
      where: { id: devisId },
      data: {
        ...updateData,
        ...(lignes && {
          lignes: {
            create: lignes.map((ligne: any, index: number) => ({
              ...ligne,
              montantHT: ligne.quantite * ligne.prixUnitaire,
              ordre: index + 1,
            })),
          },
        }),
      },
      include: {
        client: true,
        mission: true,
        lignes: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'DEVIS',
      entityId: devis.id,
      details: `Devis ${devis.numero} modifié`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Devis modifié avec succès',
      data: devis,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du devis',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/devis/{id}/send:
 *   post:
 *     summary: Envoyer un devis pour validation DG
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const devisId = parseInt(req.params.id);

    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
    });

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé',
      } as ApiResponse);
    }

    if (devis.statut !== 'brouillon') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les devis en brouillon peuvent être envoyés',
      } as ApiResponse);
    }

    const updatedDevis = await prisma.devis.update({
      where: { id: devisId },
      data: { statut: 'envoye' },
      include: {
        client: true,
        mission: true,
        lignes: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'DEVIS',
      entityId: devis.id,
      details: `Devis ${devis.numero} envoyé pour validation DG`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Devis envoyé pour validation DG',
      data: updatedDevis,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du devis',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/devis/{id}/validate:
 *   post:
 *     summary: Valider ou refuser un devis (DG uniquement)
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/validate', requireRole(['admin']), validateRequest(validateDevisSchema), async (req: Request, res: Response) => {
  try {
    const devisId = parseInt(req.params.id);
    const { statut, commentaireDG } = req.body;

    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
    });

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé',
      } as ApiResponse);
    }

    if (devis.statut !== 'envoye') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les devis envoyés peuvent être validés',
      } as ApiResponse);
    }

    const updatedDevis = await prisma.devis.update({
      where: { id: devisId },
      data: {
        statut,
        commentaireDG,
        dateValidationDG: new Date(),
        validePar: req.user!.id,
      },
      include: {
        client: true,
        mission: true,
        validateur: {
          select: { nom: true, prenom: true },
        },
        lignes: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'DEVIS',
      entityId: devis.id,
      details: `Devis ${devis.numero} ${statut === 'valide_dg' ? 'validé' : 'refusé'} par DG`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Devis ${statut === 'valide_dg' ? 'validé' : 'refusé'} avec succès`,
      data: updatedDevis,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du devis',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/devis/{id}/response:
 *   post:
 *     summary: Réponse client au devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/response', validateRequest(responseDevisSchema), async (req: Request, res: Response) => {
  try {
    const devisId = parseInt(req.params.id);
    const { statut, commentaireClient } = req.body;

    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
    });

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé',
      } as ApiResponse);
    }

    if (devis.statut !== 'valide_dg') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les devis validés par la DG peuvent recevoir une réponse client',
      } as ApiResponse);
    }

    const updatedDevis = await prisma.devis.update({
      where: { id: devisId },
      data: {
        statut,
        commentaireClient,
        dateReponseClient: new Date(),
      },
      include: {
        client: true,
        mission: true,
        validateur: {
          select: { nom: true, prenom: true },
        },
        lignes: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'DEVIS',
      entityId: devis.id,
      details: `Devis ${devis.numero} ${statut === 'accepte_client' ? 'accepté' : 'refusé'} par le client`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Devis ${statut === 'accepte_client' ? 'accepté' : 'refusé'} par le client`,
      data: updatedDevis,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réponse au devis',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/devis/{id}:
 *   delete:
 *     summary: Supprimer un devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const devisId = parseInt(req.params.id);

    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
    });

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé',
      } as ApiResponse);
    }

    if (!['brouillon', 'refuse_dg', 'refuse_client'].includes(devis.statut)) {
      return res.status(400).json({
        success: false,
        message: 'Ce devis ne peut pas être supprimé',
      } as ApiResponse);
    }

    await prisma.devis.delete({
      where: { id: devisId },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'DEVIS',
      entityId: devis.id,
      details: `Devis ${devis.numero} supprimé`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Devis supprimé avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du devis',
    } as ApiResponse);
  }
});

export { router as devisRouter };