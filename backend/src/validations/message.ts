import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.object({
    receiverId: z.number().int().positive('ID du destinataire invalide'),
    contenu: z.string().min(1, 'Le contenu du message est requis'),
  }),
});