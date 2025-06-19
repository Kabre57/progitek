import { z } from 'zod';

export const createMissionSchema = z.object({
  nature_intervention: z
    .string()
    .min(2, 'La nature de l\'intervention doit contenir au moins 2 caractères')
    .max(255, 'La nature de l\'intervention ne peut pas dépasser 255 caractères'),
  objectif_du_contrat: z
    .string()
    .optional(),
  description: z
    .string()
    .optional(),
  date_sortie_fiche_intervention: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date invalide'),
  client_id: z
    .number()
    .int('L\'ID du client doit être un entier')
    .positive('L\'ID du client doit être positif')
});

export const updateMissionSchema = z.object({
  nature_intervention: z
    .string()
    .min(2, 'La nature de l\'intervention doit contenir au moins 2 caractères')
    .max(255, 'La nature de l\'intervention ne peut pas dépasser 255 caractères')
    .optional(),
  objectif_du_contrat: z
    .string()
    .optional(),
  description: z
    .string()
    .optional(),
  date_sortie_fiche_intervention: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date invalide'),
  client_id: z
    .number()
    .int('L\'ID du client doit être un entier')
    .positive('L\'ID du client doit être positif')
    .optional()
});