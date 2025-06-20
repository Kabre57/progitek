import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logAudit } from '../services/auditService';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - mot_de_passe
 *             properties:
 *               email:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    throw createError('Email et mot de passe requis', 400);
  }

  // Rechercher l'utilisateur avec son rôle
  const { data: users, error } = await supabase
    .from('utilisateur')
    .select(`
      id, nom, prenom, email, mot_de_passe, role_id, status, last_login,
      theme, display_name, phone,
      role:role_id (
        id, libelle
      )
    `)
    .eq('email', email)
    .single();

  if (error || !users) {
    throw createError('Identifiants invalides', 401);
  }

  // Vérifier le statut du compte
  if (users.status !== 'active') {
    throw createError('Compte désactivé', 401);
  }

  // Vérifier le mot de passe
  const isValidPassword = await bcrypt.compare(mot_de_passe, users.mot_de_passe);
  if (!isValidPassword) {
    throw createError('Identifiants invalides', 401);
  }

  // Mettre à jour la dernière connexion
  await supabase
    .from('utilisateur')
    .update({ last_login: new Date().toISOString() })
    .eq('id', users.id);

  // Générer le token JWT
  const token = jwt.sign(
    { 
      id: users.id, 
      email: users.email, 
      role: users.role && users.role.length > 0 ? users.role[0].libelle : undefined 
    } as object,
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
  );

  // Logger l'audit
  await logAudit(
    users.id,
    users.email,
    'LOGIN',
    'Auth',
    users.id,
    'Connexion utilisateur',
    req.ip
  );

  // Enregistrer l'activité
  await supabase
    .from('activity_log')
    .insert({
      user_id: users.id,
      ip: req.ip,
      browser: req.get('User-Agent')
    });

  const userResponse = {
    id: users.id,
    nom: users.nom,
    prenom: users.prenom,
    email: users.email,
    role_id: users.role_id,
    theme: users.theme,
    display_name: users.display_name,
    phone: users.phone,
    status: users.status,
    last_login: users.last_login,
    role: users.role
  };

  res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: userResponse,
      token
    }
  });
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - email
 *               - mot_de_passe
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inscription réussie
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { nom, prenom, email, mot_de_passe } = req.body;

  if (!nom || !prenom || !email || !mot_de_passe) {
    throw createError('Tous les champs sont requis', 400);
  }

  // Vérifier si l'email existe déjà
  const { data: existingUser } = await supabase
    .from('utilisateur')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw createError('Cet email est déjà utilisé', 409);
  }

  // Récupérer le rôle par défaut (utilisateur)
  const { data: defaultRole } = await supabase
    .from('role')
    .select('id')
    .eq('libelle', 'Client')
    .single();

  if (!defaultRole) {
    throw createError('Erreur de configuration des rôles', 500);
  }

  // Hasher le mot de passe
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

  // Créer l'utilisateur
  const { data: newUser, error } = await supabase
    .from('utilisateur')
    .insert({
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      role_id: defaultRole.id,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    throw createError('Erreur lors de la création du compte', 500);
  }

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: {
      user: {
        id: newUser.id,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email
      }
    }
  });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 */
export const getMe = asyncHandler(async (req: any, res: Response) => {
  if (!req.user) {
    throw createError('Utilisateur non authentifié', 401);
  }

  const { data: user, error } = await supabase
    .from('utilisateur')
    .select(`
      id, nom, prenom, email, role_id, status, last_login,
      theme, display_name, phone, address, state, country, designation,
      role:role_id (id, libelle)
    `)
    .eq('id', req.user.id)
    .single();

  if (error || !user) {
    throw createError('Utilisateur non trouvé', 404);
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
export const logout = asyncHandler(async (req: any, res: Response) => {
  if (req.user) {
    // Logger l'audit
    await logAudit(
      req.user.id,
      req.user.email,
      'LOGOUT',
      'Auth',
      req.user.id,
      'Déconnexion utilisateur',
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});


/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Demander la réinitialisation du mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé
 */export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email requis" });
  }

  const { data: user, error } = await supabase
    .from("utilisateur")
    .select("id, email")
    .eq("email", email)
    .single();

  if (error || !user) {
    // Pour des raisons de développeur web, ne pas indiquer si l'email existe ou non
    return res.status(200).json({
      success: true,
      message: "Si l'email existe, un lien de réinitialisation a été envoyé."
    });
  }

  // Générer un token de réinitialisation (simplifié pour l'exemple)
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '1h' });

  // Envoyer l'email de réinitialisation
  // Dans une vraie application, vous enverriez un lien avec le resetToken
  // await sendEmail(user.email, "Réinitialisation de votre mot de passe", `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);

  await logAudit(
    user.id,
    user.email,
    'FORGOT_PASSWORD',
    'Auth',
    user.id,
    'Demande de réinitialisation de mot de passe',
    req.ip
  );

  return res.status(200).json({
    success: true,
    message: "Si l'email existe, un lien de réinitialisation a été envoyé."
  });
});





/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou expiré
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: "Token et nouveau mot de passe requis" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    const userId = decoded.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from("utilisateur")
      .update({ mot_de_passe: hashedPassword })
      .eq("id", userId);

    if (error) {
      return next(createError("Erreur lors de la réinitialisation du mot de passe", 500));
    }

    await logAudit(
      userId,
      "", // Email non disponible ici, à améliorer si nécessaire
      'RESET_PASSWORD',
      'Auth',
      userId,
      'Mot de passe réinitialisé via token',
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès."
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError("Token invalide ou expiré", 400);
    }
    throw error;
  }
});





/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Changer le mot de passe de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *       400:
 *         description: Ancien mot de passe incorrect
 *       401:
 *         description: Non authentifié
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  const { data: user, error } = await supabase
    .from("utilisateur")
    .select("mot_de_passe")
    .eq("id", req.user.id)
    .single();

  if (error || !user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.mot_de_passe);
  if (!isValidPassword) {
    throw createError("Ancien mot de passe incorrect", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("utilisateur")
    .update({ mot_de_passe: hashedPassword })
    .eq("id", req.user.id);

  if (updateError) {
    throw createError("Erreur lors du changement de mot de passe", 500);
  }

  await logAudit(
    req.user.id,
    req.user.email,
    'CHANGE_PASSWORD',
    'Auth',
    req.user.id,
    'Mot de passe changé',
    req.ip
  );

  res.status(200).json({
    success: true,
    message: "Mot de passe changé avec succès."
  });
});


