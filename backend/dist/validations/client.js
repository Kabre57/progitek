"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientSchema = exports.createClientSchema = void 0;
const zod_1 = require("zod");
exports.createClientSchema = zod_1.z.object({
    nom: zod_1.z
        .string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
    email: zod_1.z
        .string()
        .email('Format d\'email invalide'),
    telephone: zod_1.z
        .string()
        .optional(),
    entreprise: zod_1.z
        .string()
        .optional(),
    type_de_carte: zod_1.z
        .string()
        .optional(),
    numero_de_carte: zod_1.z
        .string()
        .optional(),
    statut: zod_1.z
        .string()
        .optional(),
    localisation: zod_1.z
        .string()
        .optional(),
    theme: zod_1.z
        .string()
        .optional()
});
exports.updateClientSchema = zod_1.z.object({
    nom: zod_1.z
        .string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(255, 'Le nom ne peut pas dépasser 255 caractères')
        .optional(),
    email: zod_1.z
        .string()
        .email('Format d\'email invalide')
        .optional(),
    telephone: zod_1.z
        .string()
        .optional(),
    entreprise: zod_1.z
        .string()
        .optional(),
    type_de_carte: zod_1.z
        .string()
        .optional(),
    numero_de_carte: zod_1.z
        .string()
        .optional(),
    statut: zod_1.z
        .string()
        .optional(),
    localisation: zod_1.z
        .string()
        .optional(),
    theme: zod_1.z
        .string()
        .optional()
});
//# sourceMappingURL=client.js.map