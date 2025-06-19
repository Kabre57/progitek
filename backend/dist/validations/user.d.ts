import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        nom: z.ZodString;
        prenom: z.ZodString;
        email: z.ZodString;
        mot_de_passe: z.ZodString;
        role_id: z.ZodNumber;
        phone: z.ZodOptional<z.ZodString>;
        theme: z.ZodOptional<z.ZodString>;
        display_name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        role_id: number;
        nom: string;
        prenom: string;
        mot_de_passe: string;
        theme?: string | undefined;
        display_name?: string | undefined;
        phone?: string | undefined;
    }, {
        email: string;
        role_id: number;
        nom: string;
        prenom: string;
        mot_de_passe: string;
        theme?: string | undefined;
        display_name?: string | undefined;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        role_id: number;
        nom: string;
        prenom: string;
        mot_de_passe: string;
        theme?: string | undefined;
        display_name?: string | undefined;
        phone?: string | undefined;
    };
}, {
    body: {
        email: string;
        role_id: number;
        nom: string;
        prenom: string;
        mot_de_passe: string;
        theme?: string | undefined;
        display_name?: string | undefined;
        phone?: string | undefined;
    };
}>;
export declare const updateUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        nom: z.ZodOptional<z.ZodString>;
        prenom: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        role_id: z.ZodOptional<z.ZodNumber>;
        phone: z.ZodOptional<z.ZodString>;
        theme: z.ZodOptional<z.ZodString>;
        display_name: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        designation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        status?: string | undefined;
        role_id?: number | undefined;
        nom?: string | undefined;
        prenom?: string | undefined;
        theme?: string | undefined;
        display_name?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        designation?: string | undefined;
    }, {
        email?: string | undefined;
        status?: string | undefined;
        role_id?: number | undefined;
        nom?: string | undefined;
        prenom?: string | undefined;
        theme?: string | undefined;
        display_name?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        designation?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email?: string | undefined;
        status?: string | undefined;
        role_id?: number | undefined;
        nom?: string | undefined;
        prenom?: string | undefined;
        theme?: string | undefined;
        display_name?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        designation?: string | undefined;
    };
}, {
    body: {
        email?: string | undefined;
        status?: string | undefined;
        role_id?: number | undefined;
        nom?: string | undefined;
        prenom?: string | undefined;
        theme?: string | undefined;
        display_name?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
        designation?: string | undefined;
    };
}>;
export declare const getUsersQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        search: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        role?: string | undefined;
        status?: string | undefined;
        search?: string | undefined;
    }, {
        role?: string | undefined;
        status?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        search?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        role?: string | undefined;
        status?: string | undefined;
        search?: string | undefined;
    };
}, {
    query: {
        role?: string | undefined;
        status?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        search?: string | undefined;
    };
}>;
//# sourceMappingURL=user.d.ts.map