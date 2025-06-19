"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMissionSchema = exports.createMissionSchema = void 0;
const zod_1 = require("zod");
exports.createMissionSchema = zod_1.z.object({
    nature_intervention: zod_1.z
        .string()
        .min(2, 'La nature de l\'intervention doit contenir au moins 2 caractères')
        .max(255, 'La nature de l\'intervention ne peut pas dépasser 255 caractères'),
    objectif_du_contrat: zod_1.z
        .string()
        .optional(),
    description: zod_1.z
        .string()
        .optional(),
    date_sortie_fiche_intervention: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date invalide'),
    client_id: zod_1.z
        .number()
        .int('L\'ID du client doit être un entier')
        .positive('L\'ID du client doit être positif')
});
exports.updateMissionSchema = zod_1.z.object({
    nature_intervention: zod_1.z
        .string()
        .min(2, 'La nature de l\'intervention doit contenir au moins 2 caractères')
        .max(255, 'La nature de l\'intervention ne peut pas dépasser 255 caractères')
        .optional(),
    objectif_du_contrat: zod_1.z
        .string()
        .optional(),
    description: zod_1.z
        .string()
        .optional(),
    date_sortie_fiche_intervention: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Format de date invalide'),
    client_id: zod_1.z
        .number()
        .int('L\'ID du client doit être un entier')
        .positive('L\'ID du client doit être positif')
        .optional()
});
//# sourceMappingURL=mission.js.map