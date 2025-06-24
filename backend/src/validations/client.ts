import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Format d\'email invalide'),
    telephone: z.string().optional(),
    entreprise: z.string().optional(),
    typeDeCart: z.string().optional(),
    numeroDeCarte: z.string().optional(),
    statut: z.enum(['active', 'inactive']).default('active'),
    image: z.string().optional(),
    localisation: z.string().optional(),
    theme: z.string().optional(),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    nom: z.string().min(1).optional(),
    email: z.string().email().optional(),
    telephone: z.string().optional(),
    entreprise: z.string().optional(),
    typeDeCart: z.string().optional(),
    numeroDeCarte: z.string().optional(),
    statut: z.enum(['active', 'inactive']).optional(),
    image: z.string().optional(),
    localisation: z.string().optional(),
    theme: z.string().optional(),
  }),
});