import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createMessageSchema } from '../validations/message';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Récupérer les messages de l'utilisateur
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const contactId = req.query.contactId ? parseInt(req.query.contactId as string) : undefined;

    // Si un contactId est fourni, récupérer la conversation avec ce contact
    if (contactId) {
      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId, receiverId: contactId },
              { senderId: contactId, receiverId: userId }
            ]
          },
          include: {
            sender: {
              select: { id: true, nom: true, prenom: true, email: true }
            },
            receiver: {
              select: { id: true, nom: true, prenom: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.message.count({
          where: {
            OR: [
              { senderId: userId, receiverId: contactId },
              { senderId: contactId, receiverId: userId }
            ]
          }
        })
      ]);

      // Marquer les messages non lus comme lus
      await prisma.message.updateMany({
        where: {
          senderId: contactId,
          receiverId: userId,
          lu: false
        },
        data: {
          lu: true,
          dateLecture: new Date()
        }
      });

      return res.json({
        success: true,
        message: 'Messages récupérés avec succès',
        data: messages.reverse(), // Inverser pour avoir les plus anciens en premier
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      } as PaginatedResponse);
    }

    // Sinon, récupérer la liste des contacts avec le dernier message
    const contacts = await prisma.$queryRaw`
      SELECT 
        u.id, 
        u.nom, 
        u.prenom, 
        u.email,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.senderId = u.id 
          AND m.receiverId = ${userId} 
          AND m.lu = 0
        ) as unreadCount,
        (
          SELECT m.contenu 
          FROM messages m 
          WHERE (m.senderId = ${userId} AND m.receiverId = u.id) 
          OR (m.senderId = u.id AND m.receiverId = ${userId}) 
          ORDER BY m.createdAt DESC 
          LIMIT 1
        ) as lastMessage,
        (
          SELECT m.createdAt 
          FROM messages m 
          WHERE (m.senderId = ${userId} AND m.receiverId = u.id) 
          OR (m.senderId = u.id AND m.receiverId = ${userId}) 
          ORDER BY m.createdAt DESC 
          LIMIT 1
        ) as lastMessageDate
      FROM utilisateurs u
      WHERE u.id != ${userId}
      AND EXISTS (
        SELECT 1 
        FROM messages m 
        WHERE (m.senderId = ${userId} AND m.receiverId = u.id) 
        OR (m.senderId = u.id AND m.receiverId = ${userId})
      )
      ORDER BY lastMessageDate DESC
    `;

    res.json({
      success: true,
      message: 'Contacts récupérés avec succès',
      data: contacts
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/messages/contacts:
 *   get:
 *     summary: Récupérer la liste des contacts disponibles
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.get('/contacts', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const search = req.query.search as string;

    // Construire la condition de recherche
    const whereCondition: any = {
      id: { not: userId } // Exclure l'utilisateur courant
    };

    if (search) {
      whereCondition.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Récupérer tous les utilisateurs (sauf l'utilisateur courant)
    const contacts = await prisma.utilisateur.findMany({
      where: whereCondition,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: {
          select: { libelle: true }
        }
      },
      orderBy: { nom: 'asc' }
    });

    // Pour chaque contact, compter les messages non lus
    const contactsWithUnreadCount = await Promise.all(
      contacts.map(async (contact) => {
        const unreadCount = await prisma.message.count({
          where: {
            senderId: contact.id,
            receiverId: userId,
            lu: false
          }
        });

        return {
          ...contact,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      message: 'Contacts récupérés avec succès',
      data: contactsWithUnreadCount
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contacts',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     summary: Récupérer le nombre de messages non lus
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.get('/unread', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        lu: false
      }
    });

    res.json({
      success: true,
      message: 'Nombre de messages non lus récupéré avec succès',
      data: { unreadCount }
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du nombre de messages non lus',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Envoyer un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateRequest(createMessageSchema), async (req: Request, res: Response) => {
  try {
    const { receiverId, contenu } = req.body;
    const senderId = req.user!.id;

    // Vérifier que le destinataire existe
    const receiver = await prisma.utilisateur.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Destinataire non trouvé',
      } as ApiResponse);
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        contenu,
        senderId,
        receiverId
      },
      include: {
        sender: {
          select: { id: true, nom: true, prenom: true, email: true }
        },
        receiver: {
          select: { id: true, nom: true, prenom: true, email: true }
        }
      }
    });

    await auditService.logAction({
      userId: senderId,
      actionType: 'CREATE',
      entityType: 'MESSAGE',
      entityId: message.id,
      details: `Message envoyé à ${receiver.nom} ${receiver.prenom}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: message
    } as ApiResponse);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/messages/{id}/read:
 *   patch:
 *     summary: Marquer un message comme lu
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = req.user!.id;

    // Vérifier que le message existe et appartient à l'utilisateur
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: userId
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé ou vous n\'êtes pas le destinataire',
      } as ApiResponse);
    }

    // Marquer comme lu
    await prisma.message.update({
      where: { id: messageId },
      data: {
        lu: true,
        dateLecture: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Message marqué comme lu',
    } as ApiResponse);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage du message comme lu',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/messages/mark-all-read:
 *   patch:
 *     summary: Marquer tous les messages comme lus
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/mark-all-read', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const contactId = req.query.contactId ? parseInt(req.query.contactId as string) : undefined;

    const whereCondition: any = {
      receiverId: userId,
      lu: false
    };

    if (contactId) {
      whereCondition.senderId = contactId;
    }

    // Marquer tous les messages comme lus
    await prisma.message.updateMany({
      where: whereCondition,
      data: {
        lu: true,
        dateLecture: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Tous les messages ont été marqués comme lus',
    } as ApiResponse);
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de tous les messages comme lus',
    } as ApiResponse);
  }
});

export { router as messageRouter };