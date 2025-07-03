import { z } from 'zod';

export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Le titre est requis'),
    type: z.string().min(1, 'Le type est requis'),
    url: z.string().url('URL invalide'),
    missionId: z.number().int().positive('ID de mission invalide'),
  }),
});

export const updateDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Le titre est requis').optional(),
    type: z.string().min(1, 'Le type est requis').optional(),
  }),
});