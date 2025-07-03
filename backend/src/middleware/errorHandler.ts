import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../models';

export const errorHandler = (
  _error: any, // <-- renommé pour indiquer qu'il n'est pas lu (optionnel)
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', _error);

  // Erreur de validation Prisma
  if (_error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Cette ressource existe déjà',
      errors: [{
        field: _error.meta?.target?.[0] || 'unknown',
        message: 'Valeur déjà utilisée'
      }]
    } as ApiResponse);
  }

  // Erreur de contrainte de clé étrangère
  if (_error.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide',
    } as ApiResponse);
  }

  // Erreur de validation Zod
  if (_error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: _error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      }))
    } as ApiResponse);
  }

  // Erreur JWT
  if (_error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    } as ApiResponse);
  }

  // Erreur par défaut
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
  } as ApiResponse);
};