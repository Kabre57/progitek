import { z } from 'zod';

export const createRapportSchema = z.object({
  body: z.object({
    titre: z.string().min(1, 'Le titre est requis'),
    contenu: z.string().min(1, 'Le contenu est requis'),
    interventionId: z.number().int().positive('ID d\'intervention invalide'),
    technicienId: z.number().int().positive('ID de technicien invalide'),
    missionId: z.number().int().positive('ID de mission invalide'),
    images: z.array(
      z.object({
        url: z.string().url('URL invalide'),
        description: z.string().optional(),
      })
    ).optional(),
  }),
});

export const updateRapportSchema = z.object({
  body: z.object({
    titre: z.string().min(1, 'Le titre est requis').optional(),
    contenu: z.string().min(1, 'Le contenu est requis').optional(),
    images: z.array(
      z.object({
        url: z.string().url('URL invalide'),
        description: z.string().optional(),
      })
    ).optional(),
  }),
});

export const validateRapportSchema = z.object({
  body: z.object({
    statut: z.enum(['validé', 'rejeté'], {
      errorMap: () => ({ message: 'Le statut doit être "validé" ou "rejeté"' }),
    }),
    commentaire: z.string().optional(),
  }),
});