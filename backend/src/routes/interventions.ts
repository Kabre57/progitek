import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { ApiResponse, PaginatedResponse } from '../models';
import { createInterventionSchema, updateInterventionSchema, addTechnicienSchema } from '../validations/intervention';
import { interventionController } from '../controllers/interventionController';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/interventions:
 *   get:
 *     summary: Récupérer la liste des interventions
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', interventionController.getInterventions);

/**
 * @swagger
 * /api/interventions/technicien/{technicienId}:
 *   get:
 *     summary: Récupérer les interventions d'un technicien
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/technicien/:technicienId', async (req: Request, res: Response) => {
  try {
    const technicienId = parseInt(req.params.technicienId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [interventions, total] = await Promise.all([
      prisma.intervention.findMany({
        skip,
        take: limit,
        where: {
          technicienInterventions: {
            some: {
              technicienId: technicienId
            }
          }
        },
        include: {
          mission: {
            include: { 
              client: { 
                select: { nom: true, entreprise: true } 
              }
            },
          },
          technicienInterventions: {
            include: {
              technicien: {
                include: { 
                  specialite: true
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.intervention.count({
        where: {
          technicienInterventions: {
            some: {
              technicienId: technicienId
            }
          }
        }
      }),
    ]);

    const formattedInterventions = interventions.map(intervention => {
      const principalTechnicien = intervention.technicienInterventions.find(ti => 
        ti.role === 'principal'
      )?.technicien || intervention.technicienInterventions[0]?.technicien;

      return {
        ...intervention,
        technicien: principalTechnicien,
        techniciens: intervention.technicienInterventions.map(ti => ({
          ...ti.technicien,
          role: ti.role,
          commentaire: ti.commentaire
        }))
      };
    });

    res.json({
      success: true,
      message: 'Interventions du technicien récupérées avec succès',
      data: formattedInterventions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedResponse);
  } catch (error) {
    console.error('Error fetching technicien interventions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des interventions du technicien',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/interventions:
 *   post:
 *     summary: Créer une nouvelle intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateRequest(createInterventionSchema), interventionController.createIntervention);

/**
 * @swagger
 * /api/interventions/{id}:
 *   get:
 *     summary: Récupérer une intervention par ID
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', interventionController.getInterventionById);

/**
 * @swagger
 * /api/interventions/{id}:
 *   put:
 *     summary: Modifier une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validateRequest(updateInterventionSchema), interventionController.updateIntervention);

/**
 * @swagger
 * /api/interventions/{id}/techniciens:
 *   post:
 *     summary: Ajouter un technicien à une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/techniciens', validateRequest(addTechnicienSchema), interventionController.addTechnicien);

/**
 * @swagger
 * /api/interventions/{id}/techniciens/{technicienId}:
 *   delete:
 *     summary: Retirer un technicien d'une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/techniciens/:technicienId', interventionController.removeTechnicien);

/**
 * @swagger
 * /api/interventions/{id}:
 *   delete:
 *     summary: Supprimer une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', interventionController.deleteIntervention);

export { router as interventionRouter };