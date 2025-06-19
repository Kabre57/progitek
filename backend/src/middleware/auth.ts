import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(createError("Token d'accès requis", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    // Vérifier que l'utilisateur existe toujours et est actif
    const { data: user, error } = await supabase
      .from('utilisateur')
      .select('id, email, status, role:role_id(libelle)')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return next(createError("Utilisateur non trouvé", 401));
    }

    if (user.status !== 'active') {
      return next(createError('Compte désactivé', 401));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role && user.role.length > 0 ? user.role[0].libelle : 'utilisateur'
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    next(error);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    return next();
  };
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    return next();
  };
};

export const authorizeOwnerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  const userId = parseInt(req.params.id);
  
  if (req.user.role === 'Administrator' || req.user.id === userId) {
    return next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Permissions insuffisantes'
    });
  }
};