"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTechnicianSchema = exports.createTechnicianSchema = void 0;
const zod_1 = require("zod");
exports.createTechnicianSchema = zod_1.z.object({
    nom: zod_1.z
        .string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    prenom: zod_1.z
        .string()
        .min(2, 'Le prénom doit contenir au moins 2 caractères')
        .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
    contact: zod_1.z
        .string()
        .optional(),
    specialite_id: zod_1.z
        .number()
        .int('L\'ID de la spécialité doit être un entier')
        .positive('L\'ID de la spécialité doit être positif')
});
exports.updateTechnicianSchema = zod_1.z.object({
    nom: zod_1.z
        .string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .optional(),
    prenom: zod_1.z
        .string()
        .min(2, 'Le prénom doit contenir au moins 2 caractères')
        .max(100, 'Le prénom ne peut pas dépasser 100 caractères')
        .optional(),
    contact: zod_1.z
        .string()
        .optional(),
    specialite_id: zod_1.z
        .number()
        .int('L\'ID de la spécialité doit être un entier')
        .positive('L\'ID de la spécialité doit être positif')
        .optional()
});
//# sourceMappingURL=technician.js.map