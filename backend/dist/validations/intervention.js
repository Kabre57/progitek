"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInterventionSchema = exports.createInterventionSchema = void 0;
const zod_1 = require("zod");
exports.createInterventionSchema = zod_1.z.object({
    date_heure_debut: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date/heure invalide'),
    date_heure_fin: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date/heure invalide'),
    mission_id: zod_1.z
        .number()
        .int('L\'ID de la mission doit être un entier')
        .positive('L\'ID de la mission doit être positif'),
    technicien_id: zod_1.z
        .number()
        .int('L\'ID du technicien doit être un entier')
        .positive('L\'ID du technicien doit être positif')
        .optional()
});
exports.updateInterventionSchema = zod_1.z.object({
    date_heure_debut: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date/heure invalide'),
    date_heure_fin: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date/heure invalide'),
    mission_id: zod_1.z
        .number()
        .int('L\'ID de la mission doit être un entier')
        .positive('L\'ID de la mission doit être positif')
        .optional(),
    technicien_id: zod_1.z
        .number()
        .int('L\'ID du technicien doit être un entier')
        .positive('L\'ID du technicien doit être positif')
        .optional()
});
//# sourceMappingURL=intervention.js.map