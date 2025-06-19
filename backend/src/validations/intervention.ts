import { z } from 'zod';

export const createInterventionSchema = z.object({
  date_heure_debut: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date/heure invalide'),
  date_heure_fin: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date/heure invalide'),
  mission_id: z
    .number()
    .int('L\'ID de la mission doit être un entier')
    .positive('L\'ID de la mission doit être positif'),
  technicien_id: z
    .number()
    .int('L\'ID du technicien doit être un entier')
    .positive('L\'ID du technicien doit être positif')
    .optional()
});

export const updateInterventionSchema = z.object({
  date_heure_debut: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date/heure invalide'),
  date_heure_fin: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date/heure invalide'),
  mission_id: z
    .number()
    .int('L\'ID de la mission doit être un entier')
    .positive('L\'ID de la mission doit être positif')
    .optional(),
  technicien_id: z
    .number()
    .int('L\'ID du technicien doit être un entier')
    .positive('L\'ID du technicien doit être positif')
    .optional()
});