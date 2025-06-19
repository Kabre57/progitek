import { z } from 'zod';
export declare const createMissionSchema: z.ZodObject<{
    nature_intervention: z.ZodString;
    objectif_du_contrat: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    date_sortie_fiche_intervention: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    client_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    client_id: number;
    nature_intervention: string;
    objectif_du_contrat?: string | undefined;
    description?: string | undefined;
    date_sortie_fiche_intervention?: string | undefined;
}, {
    client_id: number;
    nature_intervention: string;
    objectif_du_contrat?: string | undefined;
    description?: string | undefined;
    date_sortie_fiche_intervention?: string | undefined;
}>;
export declare const updateMissionSchema: z.ZodObject<{
    nature_intervention: z.ZodOptional<z.ZodString>;
    objectif_du_contrat: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    date_sortie_fiche_intervention: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    client_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    client_id?: number | undefined;
    nature_intervention?: string | undefined;
    objectif_du_contrat?: string | undefined;
    description?: string | undefined;
    date_sortie_fiche_intervention?: string | undefined;
}, {
    client_id?: number | undefined;
    nature_intervention?: string | undefined;
    objectif_du_contrat?: string | undefined;
    description?: string | undefined;
    date_sortie_fiche_intervention?: string | undefined;
}>;
//# sourceMappingURL=mission.d.ts.map