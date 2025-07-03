import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';

export const interventionController = {
  // Récupérer toutes les interventions
  async getInterventions(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const technicienId = req.query.technicienId ? parseInt(req.query.technicienId as string) : undefined;
      const skip = (page - 1) * limit;

      // Construire la requête en fonction des filtres
      const where: any = {};
      
      // Si un technicienId est fourni, filtrer par technicien
      if (technicienId) {
        where.technicienInterventions = {
          some: {
            technicienId: technicienId
          }
        };
      }

      const [interventions, total] = await Promise.all([
        prisma.intervention.findMany({
          skip,
          take: limit,
          where,
          include: {
            mission: {
              select: { 
                numIntervention: true, 
                natureIntervention: true,
                description: true,
                client: { 
                  select: { nom: true, entreprise: true } 
                }
              },
            },
            technicienInterventions: {
              include: {
                technicien: {
                  select: { 
                    id: true, 
                    nom: true, 
                    prenom: true, 
                    contact: true,
                    specialite: true
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.intervention.count({ where }),
      ]);

      // Transformer les données pour maintenir la compatibilité avec l'ancienne structure
      const formattedInterventions = interventions.map(intervention => {
        // Récupérer le technicien principal (premier de la liste ou avec le rôle "principal")
        const principalTechnicien = intervention.technicienInterventions.find(ti => 
          ti.role === 'principal'
        ) || intervention.technicienInterventions[0];

        return {
          ...intervention,
          technicien: principalTechnicien?.technicien || null,
          // Ajouter tous les techniciens dans un nouvel attribut
          techniciens: intervention.technicienInterventions.map(ti => ({
            ...ti.technicien,
            role: ti.role,
            commentaire: ti.commentaire
          }))
        };
      });

      res.json({
        success: true,
        message: 'Interventions récupérées avec succès',
        data: formattedInterventions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse);
    } catch (error) {
      console.error('Error fetching interventions:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des interventions',
      } as ApiResponse);
    }
  },

  // Créer une intervention
  async createIntervention(req: Request, res: Response) {
    try {
      const { dateHeureDebut, dateHeureFin, duree, missionId, technicienId, techniciens } = req.body;

      // Créer l'intervention
      const intervention = await prisma.intervention.create({
        data: {
          dateHeureDebut: dateHeureDebut ? new Date(dateHeureDebut) : undefined,
          dateHeureFin: dateHeureFin ? new Date(dateHeureFin) : undefined,
          duree,
          missionId,
        },
      });

      // Ajouter le technicien principal s'il est spécifié
      if (technicienId) {
        await prisma.technicienIntervention.create({
          data: {
            technicienId,
            interventionId: intervention.id,
            role: 'principal',
            utilisateurId: req.user?.id,
          },
        });
      }

      // Ajouter les techniciens supplémentaires s'ils sont spécifiés
      if (techniciens && techniciens.length > 0) {
        await Promise.all(
          techniciens.map(async (tech: any) => {
            // Éviter d'ajouter le technicien principal en double
            if (tech.id !== technicienId) {
              await prisma.technicienIntervention.create({
                data: {
                  technicienId: tech.id,
                  interventionId: intervention.id,
                  role: tech.role || 'assistant',
                  commentaire: tech.commentaire,
                  utilisateurId: req.user?.id,
                },
              });
            }
          })
        );
      }

      // Récupérer l'intervention complète avec ses relations
      const completeIntervention = await prisma.intervention.findUnique({
        where: { id: intervention.id },
        include: {
          mission: {
            include: { client: true },
          },
          technicienInterventions: {
            include: {
              technicien: {
                include: { specialite: true },
              },
            },
          },
        },
      });

      // Transformer les données pour maintenir la compatibilité
      const principalTechnicien = completeIntervention?.technicienInterventions.find(ti => 
        ti.role === 'principal'
      ) || completeIntervention?.technicienInterventions[0];

      const formattedIntervention = {
        ...completeIntervention,
        technicien: principalTechnicien?.technicien || null,
        techniciens: completeIntervention?.technicienInterventions.map(ti => ({
          ...ti.technicien,
          role: ti.role,
          commentaire: ti.commentaire
        })) || []
      };

      await auditService.logAction({
        userId: req.user?.id,
        actionType: 'CREATE',
        entityType: 'INTERVENTION',
        entityId: intervention.id,
        details: `Intervention créée pour la mission ${formattedIntervention.mission?.natureIntervention}`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Intervention créée avec succès',
        data: formattedIntervention,
      } as ApiResponse);
    } catch (error) {
      console.error('Error creating intervention:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'intervention',
      } as ApiResponse);
    }
  },

  // Récupérer une intervention par ID
  async getInterventionById(req: Request, res: Response) {
    try {
      const interventionId = parseInt(req.params.id);
      
      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
        include: {
          mission: {
            include: { client: true },
          },
          technicienInterventions: {
            include: {
              technicien: {
                include: { specialite: true },
              },
            },
          },
        },
      });

      if (!intervention) {
        return res.status(404).json({
          success: false,
          message: 'Intervention non trouvée',
        } as ApiResponse);
      }

      // Transformer les données pour maintenir la compatibilité
      const principalTechnicien = intervention.technicienInterventions.find(ti => 
        ti.role === 'principal'
      ) || intervention.technicienInterventions[0];

      const formattedIntervention = {
        ...intervention,
        technicien: principalTechnicien?.technicien || null,
        techniciens: intervention.technicienInterventions.map(ti => ({
          ...ti.technicien,
          role: ti.role,
          commentaire: ti.commentaire
        }))
      };

      res.json({
        success: true,
        message: 'Intervention récupérée avec succès',
        data: formattedIntervention,
      } as ApiResponse);
    } catch (error) {
      console.error('Error fetching intervention:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'intervention',
      } as ApiResponse);
    }
  },

  // Mettre à jour une intervention
  async updateIntervention(req: Request, res: Response) {
    try {
      const interventionId = parseInt(req.params.id);
      const { dateHeureDebut, dateHeureFin, duree, missionId, technicienId, techniciens } = req.body;
      
      // Mettre à jour l'intervention
      const intervention = await prisma.intervention.update({
        where: { id: interventionId },
        data: {
          dateHeureDebut: dateHeureDebut ? new Date(dateHeureDebut) : undefined,
          dateHeureFin: dateHeureFin ? new Date(dateHeureFin) : undefined,
          duree,
          missionId,
        },
      });

      // Si un nouveau technicien principal est spécifié
      if (technicienId) {
        // Vérifier si ce technicien est déjà associé à l'intervention
        const existingTechnicien = await prisma.technicienIntervention.findFirst({
          where: {
            interventionId,
            technicienId,
          },
        });

        if (existingTechnicien) {
          // Mettre à jour son rôle comme principal
          await prisma.technicienIntervention.update({
            where: { id: existingTechnicien.id },
            data: { role: 'principal' },
          });

          // Mettre à jour les autres techniciens pour ne plus être principaux
          await prisma.technicienIntervention.updateMany({
            where: {
              interventionId,
              technicienId: { not: technicienId },
              role: 'principal',
            },
            data: { role: 'assistant' },
          });
        } else {
          // Ajouter le nouveau technicien principal
          await prisma.technicienIntervention.create({
            data: {
              technicienId,
              interventionId,
              role: 'principal',
              utilisateurId: req.user?.id,
            },
          });

          // Mettre à jour les autres techniciens pour ne plus être principaux
          await prisma.technicienIntervention.updateMany({
            where: {
              interventionId,
              technicienId: { not: technicienId },
              role: 'principal',
            },
            data: { role: 'assistant' },
          });
        }
      }

      // Si des techniciens supplémentaires sont spécifiés
      if (techniciens && techniciens.length > 0) {
        // Récupérer les techniciens existants
        const existingTechniciens = await prisma.technicienIntervention.findMany({
          where: { interventionId },
        });
        
        // Identifier les techniciens à ajouter, mettre à jour ou supprimer
        const existingTechnicienIds = existingTechniciens.map(t => t.technicienId);
        const newTechnicienIds = techniciens.map((t: any) => t.id);
        
        // Techniciens à supprimer (existants mais pas dans la nouvelle liste)
        const technicienIdsToRemove = existingTechnicienIds.filter(
          id => !newTechnicienIds.includes(id) && id !== technicienId // Ne pas supprimer le technicien principal
        );
        
        // Supprimer les techniciens qui ne sont plus associés
        if (technicienIdsToRemove.length > 0) {
          await prisma.technicienIntervention.deleteMany({
            where: {
              interventionId,
              technicienId: { in: technicienIdsToRemove },
            },
          });
        }
        
        // Ajouter ou mettre à jour les techniciens
        for (const tech of techniciens) {
          const existingTech = existingTechniciens.find(t => t.technicienId === tech.id);
          
          if (existingTech) {
            // Mettre à jour le technicien existant
            await prisma.technicienIntervention.update({
              where: { id: existingTech.id },
              data: {
                role: tech.id === technicienId ? 'principal' : (tech.role || 'assistant'),
                commentaire: tech.commentaire,
              },
            });
          } else if (tech.id !== technicienId) { // Ne pas ajouter en double le technicien principal
            // Ajouter un nouveau technicien
            await prisma.technicienIntervention.create({
              data: {
                technicienId: tech.id,
                interventionId,
                role: tech.role || 'assistant',
                commentaire: tech.commentaire,
                utilisateurId: req.user?.id,
              },
            });
          }
        }
      }

      // Récupérer l'intervention mise à jour avec toutes ses relations
      const updatedIntervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
        include: {
          mission: {
            include: { client: true },
          },
          technicienInterventions: {
            include: {
              technicien: {
                include: { specialite: true },
              },
            },
          },
        },
      });

      // Transformer les données pour maintenir la compatibilité
      const principalTechnicien = updatedIntervention?.technicienInterventions.find(ti => 
        ti.role === 'principal'
      ) || updatedIntervention?.technicienInterventions[0];

      const formattedIntervention = {
        ...updatedIntervention,
        technicien: principalTechnicien?.technicien || null,
        techniciens: updatedIntervention?.technicienInterventions.map(ti => ({
          ...ti.technicien,
          role: ti.role,
          commentaire: ti.commentaire
        })) || []
      };

      await auditService.logAction({
        userId: req.user?.id,
        actionType: 'UPDATE',
        entityType: 'INTERVENTION',
        entityId: intervention.id,
        details: `Intervention modifiée`,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Intervention modifiée avec succès',
        data: formattedIntervention,
      } as ApiResponse);
    } catch (error) {
      console.error('Error updating intervention:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la modification de l\'intervention',
      } as ApiResponse);
    }
  },

  // Supprimer une intervention
  async deleteIntervention(req: Request, res: Response) {
    try {
      const interventionId = parseInt(req.params.id);
      
      // Supprimer d'abord les associations technicien-intervention
      await prisma.technicienIntervention.deleteMany({
        where: { interventionId },
      });
      
      // Puis supprimer l'intervention
      const intervention = await prisma.intervention.delete({
        where: { id: interventionId },
      });

      await auditService.logAction({
        userId: req.user?.id,
        actionType: 'DELETE',
        entityType: 'INTERVENTION',
        entityId: intervention.id,
        details: `Intervention supprimée`,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Intervention supprimée avec succès',
      } as ApiResponse);
    } catch (error) {
      console.error('Error deleting intervention:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'intervention',
      } as ApiResponse);
    }
  },

  // Ajouter un technicien à une intervention
  async addTechnicien(req: Request, res: Response) {
    try {
      const interventionId = parseInt(req.params.id);
      const { technicienId, role, commentaire } = req.body;

      // Vérifier si l'intervention existe
      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
      });

      if (!intervention) {
        return res.status(404).json({
          success: false,
          message: 'Intervention non trouvée',
        } as ApiResponse);
      }

      // Vérifier si le technicien existe
      const technicien = await prisma.technicien.findUnique({
        where: { id: technicienId },
      });

      if (!technicien) {
        return res.status(404).json({
          success: false,
          message: 'Technicien non trouvé',
        } as ApiResponse);
      }

      // Vérifier si le technicien est déjà associé à l'intervention
      const existingAssociation = await prisma.technicienIntervention.findFirst({
        where: {
          interventionId,
          technicienId,
        },
      });

      if (existingAssociation) {
        return res.status(409).json({
          success: false,
          message: 'Ce technicien est déjà associé à cette intervention',
        } as ApiResponse);
      }

      // Si le rôle est "principal", mettre à jour les autres techniciens pour ne plus être principaux
      if (role === 'principal') {
        await prisma.technicienIntervention.updateMany({
          where: {
            interventionId,
            role: 'principal',
          },
          data: { role: 'assistant' },
        });
      }

      // Créer l'association
      const technicienIntervention = await prisma.technicienIntervention.create({
        data: {
          technicienId,
          interventionId,
          role: role || 'assistant',
          commentaire,
          utilisateurId: req.user?.id,
        },
        include: {
          technicien: {
            include: { specialite: true },
          },
        },
      });

      await auditService.logAction({
        userId: req.user?.id,
        actionType: 'CREATE',
        entityType: 'TECHNICIEN_INTERVENTION',
        entityId: technicienIntervention.id,
        details: `Technicien ${technicien.nom} ${technicien.prenom} ajouté à l'intervention #${interventionId}`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Technicien ajouté à l\'intervention avec succès',
        data: technicienIntervention,
      } as ApiResponse);
    } catch (error) {
      console.error('Error adding technicien to intervention:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout du technicien à l\'intervention',
      } as ApiResponse);
    }
  },

  // Retirer un technicien d'une intervention
  async removeTechnicien(req: Request, res: Response) {
    try {
      const interventionId = parseInt(req.params.id);
      const technicienId = parseInt(req.params.technicienId);

      // Vérifier si l'association existe
      const association = await prisma.technicienIntervention.findFirst({
        where: {
          interventionId,
          technicienId,
        },
        include: {
          technicien: true,
        },
      });

      if (!association) {
        return res.status(404).json({
          success: false,
          message: 'Association technicien-intervention non trouvée',
        } as ApiResponse);
      }

      // Supprimer l'association
      await prisma.technicienIntervention.delete({
        where: { id: association.id },
      });

      await auditService.logAction({
        userId: req.user?.id,
        actionType: 'DELETE',
        entityType: 'TECHNICIEN_INTERVENTION',
        entityId: association.id,
        details: `Technicien ${association.technicien.nom} ${association.technicien.prenom} retiré de l'intervention #${interventionId}`,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Technicien retiré de l\'intervention avec succès',
      } as ApiResponse);
    } catch (error) {
      console.error('Error removing technicien from intervention:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du retrait du technicien de l\'intervention',
      } as ApiResponse);
    }
  },
};