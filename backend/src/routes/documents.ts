import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createDocumentSchema, updateDocumentSchema } from '../validations/document';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Récupérer la liste des documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: missionId
 *         schema:
 *           type: integer
 *         description: Filtrer par mission
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type de document
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const missionId = req.query.missionId ? parseInt(req.query.missionId as string) : undefined;
    const type = req.query.type as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (missionId) {
      where.missionId = missionId;
    }
    if (type) {
      where.type = type;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        include: {
          mission: {
            select: { numIntervention: true, natureIntervention: true },
          },
          createdBy: {
            select: { id: true, nom: true, prenom: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Documents récupérés avec succès',
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedResponse);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/documents/mission/{missionId}:
 *   get:
 *     summary: Récupérer les documents d'une mission
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mission
 */
router.get('/mission/:missionId', async (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.missionId);
    
    const documents = await prisma.document.findMany({
      where: { missionId },
      include: {
        createdBy: {
          select: { id: true, nom: true, prenom: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Documents récupérés avec succès',
      data: documents,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching mission documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Créer un nouveau document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateRequest(createDocumentSchema), async (req: Request, res: Response) => {
  try {
    const { title, type, url, missionId } = req.body;

    const document = await prisma.document.create({
      data: {
        title,
        type,
        url,
        missionId,
        createdById: req.user!.id,
      },
      include: {
        mission: {
          select: { numIntervention: true, natureIntervention: true },
        },
        createdBy: {
          select: { id: true, nom: true, prenom: true },
        },
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'DOCUMENT',
      entityId: document.id,
      details: `Document "${document.title}" créé pour la mission #${document.missionId}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Document créé avec succès',
      data: document,
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du document',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Récupérer un document par ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        mission: {
          select: { numIntervention: true, natureIntervention: true },
        },
        createdBy: {
          select: { id: true, nom: true, prenom: true },
        },
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Document récupéré avec succès',
      data: document,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Modifier un document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validateRequest(updateDocumentSchema), async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const { title, type } = req.body;
    
    // Vérifier que le document existe
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé',
      } as ApiResponse);
    }

    // Mettre à jour le document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        title,
        type,
      },
      include: {
        mission: {
          select: { numIntervention: true, natureIntervention: true },
        },
        createdBy: {
          select: { id: true, nom: true, prenom: true },
        },
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'DOCUMENT',
      entityId: document.id,
      details: `Document "${document.title}" modifié`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Document modifié avec succès',
      data: document,
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du document',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Supprimer un document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    
    // Vérifier que le document existe
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé',
      } as ApiResponse);
    }

    // Supprimer le document
    await prisma.document.delete({
      where: { id: documentId },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'DOCUMENT',
      entityId: documentId,
      details: `Document "${document.title}" supprimé`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Document supprimé avec succès',
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
    } as ApiResponse);
  }
});

export { router as documentRouter };