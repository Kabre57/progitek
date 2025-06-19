import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        mot_de_passe: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        mot_de_passe: string;
    }, {
        email: string;
        mot_de_passe: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        mot_de_passe: string;
    };
}, {
    body: {
        email: string;
        mot_de_passe: string;
    };
}>;
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        nom: z.ZodString;
        prenom: z.ZodString;
        email: z.ZodString;
        mot_de_passe: z.ZodString;
        role_id: z.ZodNumber;
        phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        role_id: number;
        nom: string;
        prenom: string;
        mot_de_passe: string;
        phone?: string | undefined;
    }, {
        email: string;
        role_id: number;
        nom: string;
        prenom: string;
        mot_de_passe: string;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        role_id: number;
        nom: string;
        prenom: string;
        mot_de_passe: string;
        phone?: string | undefined;
    };
}, {
    body: {
        email: string;
        role_id: number;
        nom: string;
        prenom: string;
        mot_de_passe: string;
        phone?: string | undefined;
    };
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
    };
}, {
    body: {
        email: string;
    };
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        token: z.ZodString;
        mot_de_passe: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        mot_de_passe: string;
        token: string;
    }, {
        mot_de_passe: string;
        token: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        mot_de_passe: string;
        token: string;
    };
}, {
    body: {
        mot_de_passe: string;
        token: string;
    };
}>;
export declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        current_password: z.ZodString;
        new_password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        current_password: string;
        new_password: string;
    }, {
        current_password: string;
        new_password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        current_password: string;
        new_password: string;
    };
}, {
    body: {
        current_password: string;
        new_password: string;
    };
}>;
//# sourceMappingURL=auth.d.ts.map