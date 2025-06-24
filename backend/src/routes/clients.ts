import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createClientSchema, updateClientSchema } from '../validations/client';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Récupérer la liste des clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { entreprise: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateDInscription: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Clients récupérés avec succès',
      data: clients,
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
      message: 'Erreur lors de la récupération des clients',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Créer un nouveau client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateRequest(createClientSchema), async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.create({
      data: req.body,
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'CLIENT',
      entityId: client.id,
      details: `Client ${client.nom} créé`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Client créé avec succès',
      data: client,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du client',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Récupérer un client par ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        missions: {
          include: {
            interventions: true,
          },
        },
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Client récupéré avec succès',
      data: client,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du client',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Modifier un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validateRequest(updateClientSchema), async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    
    const client = await prisma.client.update({
      where: { id: clientId },
      data: req.body,
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'CLIENT',
      entityId: client.id,
      details: `Client ${client.nom} modifié`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Client modifié avec succès',
      data: client,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du client',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Supprimer un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    
    const client = await prisma.client.delete({
      where: { id: clientId },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'CLIENT',
      entityId: client.id,
      details: `Client ${client.nom} supprimé`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Client supprimé avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du client',
    } as ApiResponse);
  }
});

export { router as clientRouter };