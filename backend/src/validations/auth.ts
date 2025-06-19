import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Format d\'email invalide')
      .min(1, 'L\'email est requis'),
    mot_de_passe: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
  })
});

export const registerSchema = z.object({
  body: z.object({
    nom: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    prenom: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
    email: z
      .string()
      .email('Format d\'email invalide')
      .min(1, 'L\'email est requis'),
    mot_de_passe: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      ),
    role_id: z
      .number()
      .int('L\'ID du rôle doit être un entier')
      .positive('L\'ID du rôle doit être positif'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val),
        'Format de téléphone invalide'
      )
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Format d\'email invalide')
      .min(1, 'L\'email est requis')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(1, 'Le token est requis'),
    mot_de_passe: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      )
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    current_password: z
      .string()
      .min(1, 'Le mot de passe actuel est requis'),
    new_password: z
      .string()
      .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      )
  })
});