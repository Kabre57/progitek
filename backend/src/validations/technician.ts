import { z } from 'zod';

export const createTechnicianSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  prenom: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  contact: z
    .string()
    .optional(),
  specialite_id: z
    .number()
    .int('L\'ID de la spécialité doit être un entier')
    .positive('L\'ID de la spécialité doit être positif')
});

export const updateTechnicianSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),
  prenom: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères')
    .optional(),
  contact: z
    .string()
    .optional(),
  specialite_id: z
    .number()
    .int('L\'ID de la spécialité doit être un entier')
    .positive('L\'ID de la spécialité doit être positif')
    .optional()
});