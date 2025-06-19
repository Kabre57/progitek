import { z } from 'zod';

export const createClientSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  email: z
    .string()
    .email('Format d\'email invalide'),
  telephone: z
    .string()
    .optional(),
  entreprise: z
    .string()
    .optional(),
  type_de_carte: z
    .string()
    .optional(),
  numero_de_carte: z
    .string()
    .optional(),
  statut: z
    .string()
    .optional(),
  localisation: z
    .string()
    .optional(),
  theme: z
    .string()
    .optional()
});

export const updateClientSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .optional(),
  email: z
    .string()
    .email('Format d\'email invalide')
    .optional(),
  telephone: z
    .string()
    .optional(),
  entreprise: z
    .string()
    .optional(),
  type_de_carte: z
    .string()
    .optional(),
  numero_de_carte: z
    .string()
    .optional(),
  statut: z
    .string()
    .optional(),
  localisation: z
    .string()
    .optional(),
  theme: z
    .string()
    .optional()
});