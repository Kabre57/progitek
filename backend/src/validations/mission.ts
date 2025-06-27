import { z } from 'zod';

export const createMissionSchema = z.object({
  body: z.object({
    natureIntervention: z.string().min(1, 'La nature de l\'intervention est requise'),
    objectifDuContrat: z.string().optional(),
    description: z.string().optional(),
    dateSortieFicheIntervention: z.string().optional(),
  }),
});

export const updateMissionSchema = z.object({
  body: z.object({
    natureIntervention: z.string().min(1).optional(),
    objectifDuContrat: z.string().optional(),
    description: z.string().optional(),
    dateSortieFicheIntervention: z.string().optional(),
    clientId: z.number().int().positive().optional(),
  }),
});