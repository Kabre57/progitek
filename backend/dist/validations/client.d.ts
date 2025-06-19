import { z } from 'zod';
export declare const createClientSchema: z.ZodObject<{
    nom: z.ZodString;
    email: z.ZodString;
    telephone: z.ZodOptional<z.ZodString>;
    entreprise: z.ZodOptional<z.ZodString>;
    type_de_carte: z.ZodOptional<z.ZodString>;
    numero_de_carte: z.ZodOptional<z.ZodString>;
    statut: z.ZodOptional<z.ZodString>;
    localisation: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nom: string;
    theme?: string | undefined;
    statut?: string | undefined;
    telephone?: string | undefined;
    entreprise?: string | undefined;
    type_de_carte?: string | undefined;
    numero_de_carte?: string | undefined;
    localisation?: string | undefined;
}, {
    email: string;
    nom: string;
    theme?: string | undefined;
    statut?: string | undefined;
    telephone?: string | undefined;
    entreprise?: string | undefined;
    type_de_carte?: string | undefined;
    numero_de_carte?: string | undefined;
    localisation?: string | undefined;
}>;
export declare const updateClientSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    telephone: z.ZodOptional<z.ZodString>;
    entreprise: z.ZodOptional<z.ZodString>;
    type_de_carte: z.ZodOptional<z.ZodString>;
    numero_de_carte: z.ZodOptional<z.ZodString>;
    statut: z.ZodOptional<z.ZodString>;
    localisation: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    nom?: string | undefined;
    theme?: string | undefined;
    statut?: string | undefined;
    telephone?: string | undefined;
    entreprise?: string | undefined;
    type_de_carte?: string | undefined;
    numero_de_carte?: string | undefined;
    localisation?: string | undefined;
}, {
    email?: string | undefined;
    nom?: string | undefined;
    theme?: string | undefined;
    statut?: string | undefined;
    telephone?: string | undefined;
    entreprise?: string | undefined;
    type_de_carte?: string | undefined;
    numero_de_carte?: string | undefined;
    localisation?: string | undefined;
}>;
//# sourceMappingURL=client.d.ts.map