import { z } from 'zod';

export const createTechnicianSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    prenom: z.string().min(1, 'Le prénom est requis'),
    contact: z.string().optional(),
    specialiteId: z.number().int().positive().optional(),
  }),
});

export const updateTechnicianSchema = z.object({
  body: z.object({
    nom: z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
    contact: z.string().optional(),
    specialiteId: z.number().int().positive().optional(),
  }),
});