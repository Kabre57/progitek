"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .email('Format d\'email invalide')
            .min(1, 'L\'email est requis'),
        mot_de_passe: zod_1.z
            .string()
            .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    })
});
exports.registerSchema = zod_1.z.object({
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
            .email('Format d\'email invalide')
            .min(1, 'L\'email est requis'),
        mot_de_passe: zod_1.z
            .string()
            .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
        role_id: zod_1.z
            .number()
            .int('L\'ID du rôle doit être un entier')
            .positive('L\'ID du rôle doit être positif'),
        phone: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val), 'Format de téléphone invalide')
    })
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .email('Format d\'email invalide')
            .min(1, 'L\'email est requis')
    })
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z
            .string()
            .min(1, 'Le token est requis'),
        mot_de_passe: zod_1.z
            .string()
            .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
    })
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        current_password: zod_1.z
            .string()
            .min(1, 'Le mot de passe actuel est requis'),
        new_password: zod_1.z
            .string()
            .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
    })
});
//# sourceMappingURL=auth.js.map