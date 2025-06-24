import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    prenom: z.string().min(1, 'Le prénom est requis'),
    email: z.string().email('Format d\'email invalide'),
    motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    phone: z.string().optional(),
    roleId: z.number().int().positive(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    nom: z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
    email: z.string().email().optional(),
    motDePasse: z.string().min(6).optional(),
    phone: z.string().optional(),
    theme: z.string().optional(),
    displayName: z.string().optional(),
    address: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    designation: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    roleId: z.number().int().positive().optional(),
  }),
});