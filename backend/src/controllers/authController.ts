import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/config';
import { auditService } from '../services/auditService';
import { ApiResponse } from '../models';

export const authController = {
  // Connexion
  async login(req: Request, res: Response) {
    try {
      const { email, motDePasse } = req.body;

      const user = await prisma.utilisateur.findUnique({
        where: { email },
        include: { role: true },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
        } as ApiResponse);
      }

      const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
        } as ApiResponse);
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role.libelle },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn } as SignOptions
      );

      await prisma.utilisateur.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      await auditService.logAction({
        userId: user.id,
        actionType: 'LOGIN',
        entityType: 'USER',
        details: 'Connexion réussie',
        ipAddress: req.ip,
      });

      const userResponse = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        phone: user.phone,
        theme: user.theme,
        displayName: user.displayName,
        address: user.address,
        state: user.state,
        country: user.country,
        designation: user.designation,
        balance: user.balance,
        emailStatus: user.emailStatus,
        kycStatus: user.kycStatus,
        lastLogin: user.lastLogin,
        status: user.status,
        createdAt: user.createdAt,
        role: {
          id: user.role.id,
          libelle: user.role.libelle,
          description: user.role.description,
        },
      };

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      } as ApiResponse);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion',
      } as ApiResponse);
    }
  },

  // Inscription
  async register(req: Request, res: Response) {
    try {
      const { nom, prenom, email, motDePasse, phone, roleId } = req.body;

      const existingUser = await prisma.utilisateur.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà',
        } as ApiResponse);
      }

      const hashedPassword = await bcrypt.hash(motDePasse, config.security.bcryptRounds);

      let finalRoleId = roleId;
      if (!finalRoleId) {
        const userRole = await prisma.role.findUnique({ where: { libelle: 'user' } });
        finalRoleId = userRole?.id || 2;
      }

      const user = await prisma.utilisateur.create({
        data: {
          nom,
          prenom,
          email,
          motDePasse: hashedPassword,
          phone,
          roleId: finalRoleId,
          emailStatus: 'verified',
          status: 'active',
        },
        include: { role: true },
      });

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role.libelle },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn } as SignOptions
      );

      await auditService.logAction({
        userId: user.id,
        actionType: 'REGISTER',
        entityType: 'USER',
        details: 'Inscription réussie',
        ipAddress: req.ip,
      });

      const userResponse = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
        role: {
          id: user.role.id,
          libelle: user.role.libelle,
          description: user.role.description,
        },
      };

      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      } as ApiResponse);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'inscription',
      } as ApiResponse);
    }
  },

  // Déconnexion
  async logout(req: Request, res: Response) {
    try {
      if (req.user) {
        await auditService.logAction({
          userId: req.user.id,
          actionType: 'LOGOUT',
          entityType: 'USER',
          details: 'Déconnexion',
          ipAddress: req.ip,
        });
      }

      res.json({
        success: true,
        message: 'Déconnexion réussie',
      } as ApiResponse);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la déconnexion',
      } as ApiResponse);
    }
  },

  // Rafraîchir le token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token requis',
        } as ApiResponse);
      }

      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: number };

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

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role.libelle },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      res.json({
        success: true,
        message: 'Token rafraîchi avec succès',
        data: {
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      } as ApiResponse);
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Refresh token invalide',
      } as ApiResponse);
    }
  },

  // Demande de réinitialisation de mot de passe
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await prisma.utilisateur.findUnique({
        where: { email },
      });

      res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      } as ApiResponse);

      if (user) {
        // TODO: Implémenter envoi d'email avec token
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la demande de réinitialisation',
      } as ApiResponse);
    }
  },

  // Réinitialisation de mot de passe
  async resetPassword(req: Request, res: Response) {
    try {
      const { token: _token, newPassword: _newPassword } = req.body;

      // TODO: Implémenter la vérification du token et mise à jour mot de passe

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      } as ApiResponse);
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation du mot de passe',
      } as ApiResponse);
    }
  },
};
