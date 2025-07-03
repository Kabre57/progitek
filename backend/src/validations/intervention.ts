import { z } from 'zod';

export const createInterventionSchema = z.object({
  body: z.object({
    dateHeureDebut: z.string().datetime().optional(),
    dateHeureFin: z.string().datetime().optional(),
    duree: z.number().positive().optional(),
    missionId: z.number().int().positive(),
    technicienId: z.number().int().positive().optional(),
    techniciens: z.array(
      z.object({
        id: z.number().int().positive(),
        role: z.string().optional(),
        commentaire: z.string().optional(),
      })
    ).optional(),
  }),
});

export const updateInterventionSchema = z.object({
  body: z.object({
    dateHeureDebut: z.string().datetime().optional(),
    dateHeureFin: z.string().datetime().optional(),
    duree: z.number().positive().optional(),
    missionId: z.number().int().positive().optional(),
    technicienId: z.number().int().positive().optional(),
    techniciens: z.array(
      z.object({
        id: z.number().int().positive(),
        role: z.string().optional(),
        commentaire: z.string().optional(),
      })
    ).optional(),
  }),
});

export const addTechnicienSchema = z.object({
  body: z.object({
    technicienId: z.number().int().positive('ID du technicien invalide'),
    role: z.string().optional(),
    commentaire: z.string().optional(),
  }),
});