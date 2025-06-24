import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { 
  createFactureFromDevisSchema, 
  updateFactureSchema,
  payFactureSchema 
} from '../validations/facture';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/factures:
 *   get:
 *     summary: Récupérer la liste des factures
 *     tags: [Factures]
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

    const [factures, total] = await Promise.all([
      prisma.facture.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: { nom: true, email: true, entreprise: true },
          },
          devis: {
            select: { numero: true, titre: true },
          },
          lignes: {
            orderBy: { ordre: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.facture.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Factures récupérées avec succès',
      data: factures,
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
      message: 'Erreur lors de la récupération des factures',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/factures/from-devis:
 *   post:
 *     summary: Créer une facture à partir d'un devis accepté
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 */
router.post('/from-devis', validateRequest(createFactureFromDevisSchema), async (req: Request, res: Response) => {
  try {
    const { devisId, dateEcheance } = req.body;

    // Vérifier que le devis existe et est accepté par le client
    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: {
        client: true,
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

    if (devis.statut !== 'accepte_client') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les devis acceptés par le client peuvent être transformés en facture',
      } as ApiResponse);
    }

    if (devis.factureId) {
      return res.status(400).json({
        success: false,
        message: 'Ce devis a déjà été transformé en facture',
      } as ApiResponse);
    }

    // Générer le numéro de facture
    const year = new Date().getFullYear();
    const count = await prisma.facture.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });
    const numero = `FAC-${year}-${String(count + 1).padStart(4, '0')}`;

    // Créer la facture
    const facture = await prisma.facture.create({
      data: {
        numero,
        devisId,
        clientId: devis.clientId,
        montantHT: devis.montantHT,
        tauxTVA: devis.tauxTVA,
        montantTTC: devis.montantTTC,
        statut: 'emise',
        dateEmission: new Date(),
        dateEcheance: new Date(dateEcheance),
        lignes: {
          create: devis.lignes.map(ligne => ({
            designation: ligne.designation,
            quantite: ligne.quantite,
            prixUnitaire: ligne.prixUnitaire,
            montantHT: ligne.montantHT,
            ordre: ligne.ordre,
          })),
        },
      },
      include: {
        client: true,
        devis: true,
        lignes: true,
      },
    });

    // Mettre à jour le devis
    await prisma.devis.update({
      where: { id: devisId },
      data: {
        statut: 'facture',
        factureId: facture.id,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'FACTURE',
      entityId: facture.id,
      details: `Facture ${facture.numero} créée à partir du devis ${devis.numero}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: facture,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la facture',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/factures/{id}:
 *   get:
 *     summary: Récupérer une facture par ID
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const factureId = parseInt(req.params.id);
    
    const facture = await prisma.facture.findUnique({
      where: { id: factureId },
      include: {
        client: true,
        devis: true,
        lignes: {
          orderBy: { ordre: 'asc' },
        },
      },
    });

    if (!facture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Facture récupérée avec succès',
      data: facture,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/factures/{id}:
 *   put:
 *     summary: Modifier une facture
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validateRequest(updateFactureSchema), async (req: Request, res: Response) => {
  try {
    const factureId = parseInt(req.params.id);

    const existingFacture = await prisma.facture.findUnique({
      where: { id: factureId },
    });

    if (!existingFacture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      } as ApiResponse);
    }

    if (existingFacture.statut === 'payee') {
      return res.status(400).json({
        success: false,
        message: 'Une facture payée ne peut plus être modifiée',
      } as ApiResponse);
    }

    const facture = await prisma.facture.update({
      where: { id: factureId },
      data: req.body,
      include: {
        client: true,
        devis: true,
        lignes: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'FACTURE',
      entityId: facture.id,
      details: `Facture ${facture.numero} modifiée`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Facture modifiée avec succès',
      data: facture,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la facture',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/factures/{id}/send:
 *   post:
 *     summary: Envoyer une facture au client
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const factureId = parseInt(req.params.id);

    const facture = await prisma.facture.findUnique({
      where: { id: factureId },
    });

    if (!facture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      } as ApiResponse);
    }

    if (facture.statut !== 'emise') {
      return res.status(400).json({
        success: false,
        message: 'Seules les factures émises peuvent être envoyées',
      } as ApiResponse);
    }

    const updatedFacture = await prisma.facture.update({
      where: { id: factureId },
      data: { statut: 'envoyee' },
      include: {
        client: true,
        devis: true,
        lignes: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'FACTURE',
      entityId: facture.id,
      details: `Facture ${facture.numero} envoyée au client`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Facture envoyée avec succès',
      data: updatedFacture,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la facture',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/factures/{id}/pay:
 *   post:
 *     summary: Marquer une facture comme payée
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/pay', validateRequest(payFactureSchema), async (req: Request, res: Response) => {
  try {
    const factureId = parseInt(req.params.id);
    const { modePaiement, referenceTransaction, datePaiement } = req.body;

    const facture = await prisma.facture.findUnique({
      where: { id: factureId },
    });

    if (!facture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      } as ApiResponse);
    }

    if (facture.statut === 'payee') {
      return res.status(400).json({
        success: false,
        message: 'Cette facture est déjà payée',
      } as ApiResponse);
    }

    const updatedFacture = await prisma.facture.update({
      where: { id: factureId },
      data: {
        statut: 'payee',
        modePaiement,
        referenceTransaction,
        datePaiement: datePaiement ? new Date(datePaiement) : new Date(),
      },
      include: {
        client: true,
        devis: true,
        lignes: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'FACTURE',
      entityId: facture.id,
      details: `Facture ${facture.numero} marquée comme payée`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Facture marquée comme payée',
      data: updatedFacture,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de paiement',
    } as ApiResponse);
  }
});

export { router as factureRouter };