import { z } from 'zod';

export const createInterventionSchema = z.object({
  body: z.object({
    dateHeureDebut: z.string().datetime().optional(),
    dateHeureFin: z.string().datetime().optional(),
    duree: z.number().positive().optional(),
    missionId: z.number().int().positive(),
    technicienId: z.number().int().positive().optional(),
  }),
});

export const updateInterventionSchema = z.object({
  body: z.object({
    dateHeureDebut: z.string().datetime().optional(),
    dateHeureFin: z.string().datetime().optional(),
    duree: z.number().positive().optional(),
    missionId: z.number().int().positive().optional(),
    technicienId: z.number().int().positive().optional(),
  }),
});