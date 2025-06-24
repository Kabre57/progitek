import { z } from 'zod';

export const createSpecialiteSchema = z.object({
  body: z.object({
    libelle: z.string().min(1, 'Le libellé est requis'),
    description: z.string().optional(),
  }),
});

export const updateSpecialiteSchema = z.object({
  body: z.object({
    libelle: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
});