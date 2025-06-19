import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erreur interne du serveur';

  // Erreurs de validation Zod
  if (error.name === 'ZodError') {
    statusCode = 400;
    message = 'Données de validation invalides';
  }

  // Erreurs JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expiré';
  }

  // Erreurs PostgreSQL
  if (error.name === 'DatabaseError') {
    statusCode = 500;
    message = 'Erreur de base de données';
  }

  // Erreur de contrainte unique (email déjà utilisé, etc.)
  if (error.message?.includes('duplicate key value')) {
    statusCode = 409;
    message = 'Cette ressource existe déjà';
  }

  // Erreur de contrainte de clé étrangère
  if (error.message?.includes('foreign key constraint')) {
    statusCode = 400;
    message = 'Référence invalide vers une ressource inexistante';
  }

  // Log de l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Erreur capturée:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  // Réponse d'erreur
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack
    })
  });
};

// Fonction utilitaire pour créer des erreurs personnalisées
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Wrapper pour les fonctions async
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};