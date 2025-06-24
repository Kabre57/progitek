import { z } from 'zod';

export const generateReportSchema = z.object({
  body: z.object({
    reportType: z.enum(['clients', 'missions', 'interventions', 'techniciens']),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    filters: z.any().optional(),
  }),
});