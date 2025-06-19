import { z } from 'zod';

export const generateReportSchema = z.object({
  report_type: z
    .enum(['activity', 'interventions', 'clients', 'technicians', 'performance'], {
      errorMap: () => ({ message: 'Type de rapport invalide' })
    }),
  start_date: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date invalide'),
  end_date: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date invalide')
});