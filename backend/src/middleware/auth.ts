import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/config';
import { ApiResponse } from '../models';

// Interface pour le payload JWT
interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

// Étendre l'interface Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

// Middleware d'authentification
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis',
      } as ApiResponse);
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      } as ApiResponse);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.libelle,
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token invalide',
    } as ApiResponse);
  }
};

// Middleware de vérification des rôles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      } as ApiResponse);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
      } as ApiResponse);
    }

    next();
  };
};