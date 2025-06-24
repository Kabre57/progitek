import { z } from 'zod';

export const createDevisSchema = z.object({
  body: z.object({
    clientId: z.number().int().positive(),
    missionId: z.number().int().positive().optional(),
    titre: z.string().min(1, 'Le titre est requis'),
    description: z.string().optional(),
    dateValidite: z.string().datetime(),
    tauxTVA: z.number().min(0).max(100).default(18),
    lignes: z.array(z.object({
      designation: z.string().min(1, 'La désignation est requise'),
      quantite: z.number().positive(),
      prixUnitaire: z.number().positive(),
    })).min(1, 'Au moins une ligne est requise'),
  }),
});

export const updateDevisSchema = z.object({
  body: z.object({
    titre: z.string().min(1).optional(),
    description: z.string().optional(),
    dateValidite: z.string().datetime().optional(),
    tauxTVA: z.number().min(0).max(100).optional(),
    lignes: z.array(z.object({
      id: z.number().optional(),
      designation: z.string().min(1, 'La désignation est requise'),
      quantite: z.number().positive(),
      prixUnitaire: z.number().positive(),
    })).optional(),
  }),
});

export const validateDevisSchema = z.object({
  body: z.object({
    statut: z.enum(['valide_dg', 'refuse_dg']),
    commentaireDG: z.string().optional(),
  }),
});

export const responseDevisSchema = z.object({
  body: z.object({
    statut: z.enum(['accepte_client', 'refuse_client']),
    commentaireClient: z.string().optional(),
  }),
});