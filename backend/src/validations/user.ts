import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    nom: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    prenom: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
    email: z
      .string()
      .email('Format d\'email invalide'),
    mot_de_passe: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    role_id: z
      .number()
      .int('L\'ID du rôle doit être un entier')
      .positive('L\'ID du rôle doit être positif'),
    phone: z
      .string()
      .optional(),
    theme: z
      .string()
      .optional(),
    display_name: z
      .string()
      .optional()
  })
});

export const updateUserSchema = z.object({
  body: z.object({
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
    email: z
      .string()
      .email('Format d\'email invalide')
      .optional(),
    role_id: z
      .number()
      .int('L\'ID du rôle doit être un entier')
      .positive('L\'ID du rôle doit être positif')
      .optional(),
    phone: z
      .string()
      .optional(),
    theme: z
      .string()
      .optional(),
    display_name: z
      .string()
      .optional(),
    status: z
      .string()
      .optional(),
    address: z
      .string()
      .optional(),
    state: z
      .string()
      .optional(),
    country: z
      .string()
      .optional(),
    designation: z
      .string()
      .optional()
  })
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val) : 1),
    limit: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val) : 10),
    search: z
      .string()
      .optional(),
    role: z
      .string()
      .optional(),
    status: z
      .string()
      .optional()
  })
});