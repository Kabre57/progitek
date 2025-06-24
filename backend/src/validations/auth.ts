import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    prenom: z.string().min(1, 'Le prénom est requis'),
    email: z.string().email('Format d\'email invalide'),
    motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    phone: z.string().optional(),
    roleId: z.number().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Format d\'email invalide'),
    motDePasse: z.string().min(1, 'Le mot de passe est requis'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Le token de rafraîchissement est requis'),
  }),
});

export const resetPasswordRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Format d\'email invalide'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Le token de réinitialisation est requis'),
    newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  }),
});