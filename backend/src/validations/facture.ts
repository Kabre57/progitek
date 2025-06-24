import { z } from 'zod';

export const createFactureFromDevisSchema = z.object({
  body: z.object({
    devisId: z.number().int().positive(),
    dateEcheance: z.string().datetime(),
  }),
});

export const updateFactureSchema = z.object({
  body: z.object({
    statut: z.enum(['emise', 'envoyee', 'payee', 'annulee']).optional(),
    dateEcheance: z.string().datetime().optional(),
    datePaiement: z.string().datetime().optional(),
    modePaiement: z.string().optional(),
    referenceTransaction: z.string().optional(),
  }),
});

export const payFactureSchema = z.object({
  body: z.object({
    modePaiement: z.string().min(1, 'Le mode de paiement est requis'),
    referenceTransaction: z.string().optional(),
    datePaiement: z.string().datetime().optional(),
  }),
});