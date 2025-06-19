"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportSchema = void 0;
const zod_1 = require("zod");
exports.generateReportSchema = zod_1.z.object({
    report_type: zod_1.z
        .enum(['activity', 'interventions', 'clients', 'technicians', 'performance'], {
        errorMap: () => ({ message: 'Type de rapport invalide' })
    }),
    start_date: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date invalide'),
    end_date: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date invalide')
});
//# sourceMappingURL=report.js.map