import { z } from 'zod';
export declare const createTechnicianSchema: z.ZodObject<{
    nom: z.ZodString;
    prenom: z.ZodString;
    contact: z.ZodOptional<z.ZodString>;
    specialite_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    nom: string;
    prenom: string;
    specialite_id: number;
    contact?: string | undefined;
}, {
    nom: string;
    prenom: string;
    specialite_id: number;
    contact?: string | undefined;
}>;
export declare const updateTechnicianSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    prenom: z.ZodOptional<z.ZodString>;
    contact: z.ZodOptional<z.ZodString>;
    specialite_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    prenom?: string | undefined;
    contact?: string | undefined;
    specialite_id?: number | undefined;
}, {
    nom?: string | undefined;
    prenom?: string | undefined;
    contact?: string | undefined;
    specialite_id?: number | undefined;
}>;
//# sourceMappingURL=technician.d.ts.map