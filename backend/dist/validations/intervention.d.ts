import { z } from 'zod';
export declare const createInterventionSchema: z.ZodObject<{
    date_heure_debut: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    date_heure_fin: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    mission_id: z.ZodNumber;
    technicien_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    mission_id: number;
    technicien_id?: number | undefined;
    date_heure_debut?: string | undefined;
    date_heure_fin?: string | undefined;
}, {
    mission_id: number;
    technicien_id?: number | undefined;
    date_heure_debut?: string | undefined;
    date_heure_fin?: string | undefined;
}>;
export declare const updateInterventionSchema: z.ZodObject<{
    date_heure_debut: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    date_heure_fin: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    mission_id: z.ZodOptional<z.ZodNumber>;
    technicien_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    technicien_id?: number | undefined;
    mission_id?: number | undefined;
    date_heure_debut?: string | undefined;
    date_heure_fin?: string | undefined;
}, {
    technicien_id?: number | undefined;
    mission_id?: number | undefined;
    date_heure_debut?: string | undefined;
    date_heure_fin?: string | undefined;
}>;
//# sourceMappingURL=intervention.d.ts.map