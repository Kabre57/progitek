"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersQuerySchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        nom: zod_1.z
            .string()
            .min(2, 'Le nom doit contenir au moins 2 caractères')
            .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
        prenom: zod_1.z
            .string()
            .min(2, 'Le prénom doit contenir au moins 2 caractères')
            .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
        email: zod_1.z
            .string()
            .email('Format d\'email invalide'),
        mot_de_passe: zod_1.z
            .string()
            .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
        role_id: zod_1.z
            .number()
            .int('L\'ID du rôle doit être un entier')
            .positive('L\'ID du rôle doit être positif'),
        phone: zod_1.z
            .string()
            .optional(),
        theme: zod_1.z
            .string()
            .optional(),
        display_name: zod_1.z
            .string()
            .optional()
    })
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
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
        email: zod_1.z
            .string()
            .email('Format d\'email invalide')
            .optional(),
        role_id: zod_1.z
            .number()
            .int('L\'ID du rôle doit être un entier')
            .positive('L\'ID du rôle doit être positif')
            .optional(),
        phone: zod_1.z
            .string()
            .optional(),
        theme: zod_1.z
            .string()
            .optional(),
        display_name: zod_1.z
            .string()
            .optional(),
        status: zod_1.z
            .string()
            .optional(),
        address: zod_1.z
            .string()
            .optional(),
        state: zod_1.z
            .string()
            .optional(),
        country: zod_1.z
            .string()
            .optional(),
        designation: zod_1.z
            .string()
            .optional()
    })
});
exports.getUsersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseInt(val) : 1),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseInt(val) : 10),
        search: zod_1.z
            .string()
            .optional(),
        role: zod_1.z
            .string()
            .optional(),
        status: zod_1.z
            .string()
            .optional()
    })
});
//# sourceMappingURL=user.js.map