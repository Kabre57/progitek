import { z } from 'zod';

export const createTechnicienSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    prenom: z.string().min(1, 'Le prénom est requis'),
    contact: z.string().optional(),
    specialiteId: z.number().int().positive().optional(),
    utilisateurId: z.number().int().positive().optional(),
  }),
});

export const updateTechnicienSchema = z.object({
  body: z.object({
    nom: z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
    contact: z.string().optional(),
    specialiteId: z.number().int().positive().optional(),
    utilisateurId: z.number().int().positive().optional(),
  }),
});