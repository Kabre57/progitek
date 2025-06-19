import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { UserWithRole, CreateUserRequest, UpdateUserRequest } from '../models/User';
import { logAudit } from '../services/auditService';
import { sendWelcomeEmail } from '../services/emailService';

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer la liste des utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: any[] = [];
  let paramIndex = 1;

  const conditions: string[] = [];

  if (search) {
    conditions.push(`(u.nom ILIKE $${paramIndex} OR u.prenom ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (role) {
    conditions.push(`r.libelle = $${paramIndex}`);
    params.push(role);
    paramIndex++;
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  // Requête pour les données
  const dataQuery = `
    SELECT 
      u.id, u.nom, u.prenom, u.email, u.role_id, u.created_at, u.updated_at,
      u.theme, u.display_name, u.phone, u.status, u.last_login,
      r.libelle as role_libelle
    FROM utilisateur u
    LEFT JOIN role r ON u.role_id = r.id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  // Requête pour le total
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM utilisateur u
    LEFT JOIN role r ON u.role_id = r.id
    ${whereClause}
  `;
  const countParams = params.slice(0, -2);

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, params),
    query(countQuery, countParams)
  ]);

  const users: UserWithRole[] = dataResult.rows.map((row: any) => ({
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    role_id: row.role_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    theme: row.theme,
    display_name: row.display_name,
    phone: row.phone,
    status: row.status,
    last_login: row.last_login,
    role: row.role_id ? {
      id: row.role_id,
      libelle: row.role_libelle
    } : undefined
  }));

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 */
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(`
    SELECT 
      u.id, u.nom, u.prenom, u.email, u.role_id, u.created_at, u.updated_at,
      u.theme, u.display_name, u.phone, u.status, u.last_login, u.address,
      u.state, u.country, u.designation,
      r.libelle as role_libelle
    FROM utilisateur u
    LEFT JOIN role r ON u.role_id = r.id
    WHERE u.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw createError('Utilisateur non trouvé', 404);
  }

  const row = result.rows[0];
  const user: UserWithRole = {
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    role_id: row.role_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    theme: row.theme,
    display_name: row.display_name,
    phone: row.phone,
    status: row.status,
    last_login: row.last_login,
    address: row.address,
    state: row.state,
    country: row.country,
    designation: row.designation,
    role: row.role_id ? {
      id: row.role_id,
      libelle: row.role_libelle
    } : undefined
  };

  res.status(200).json({
    success: true,
    data: { user }
  });
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               - role_id
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nom, prenom, email, mot_de_passe, role_id, phone, theme, display_name }: CreateUserRequest = req.body;

  // Vérifier si l'email existe déjà
  const existingUser = await query('SELECT id FROM utilisateur WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw createError('Cet email est déjà utilisé', 409);
  }

  // Vérifier si le rôle existe
  const roleResult = await query('SELECT id, libelle FROM role WHERE id = $1', [role_id]);
  if (roleResult.rows.length === 0) {
    throw createError('Rôle invalide', 400);
  }

  // Hasher le mot de passe
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

  // Créer l'utilisateur
  const result = await query(`
    INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role_id, phone, theme, display_name, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
    RETURNING id, nom, prenom, email, role_id, created_at, updated_at, phone, theme, display_name, status
  `, [nom, prenom, email, hashedPassword, role_id, phone, theme, display_name]);

  const newUser = result.rows[0];

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'CREATE',
      'User',
      newUser.id,
      `Création d'un nouvel utilisateur: ${prenom} ${nom}`,
      req.ip
    );
  }

  // Envoyer email de bienvenue
  try {
    await sendWelcomeEmail(email, `${prenom} ${nom}`);
  } catch (error) {
    console.error('Erreur envoi email de bienvenue:', error);
  }

  const userResponse: UserWithRole = {
    ...newUser,
    role: {
      id: role_id,
      libelle: roleResult.rows[0].libelle
    }
  };

  res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès',
    data: { user: userResponse }
  });
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
 */
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateUserRequest = req.body;

  // Vérifier si l'utilisateur existe
  const existingUser = await query('SELECT * FROM utilisateur WHERE id = $1', [id]);
  if (existingUser.rows.length === 0) {
    throw createError('Utilisateur non trouvé', 404);
  }

  // Vérifier l'email unique si modifié
  if (updateData.email) {
    const emailCheck = await query('SELECT id FROM utilisateur WHERE email = $1 AND id != $2', [updateData.email, id]);
    if (emailCheck.rows.length > 0) {
      throw createError('Cet email est déjà utilisé', 409);
    }
  }

  // Vérifier le rôle si modifié
  if (updateData.role_id) {
    const roleCheck = await query('SELECT id FROM role WHERE id = $1', [updateData.role_id]);
    if (roleCheck.rows.length === 0) {
      throw createError('Rôle invalide', 400);
    }
  }

  // Construire la requête de mise à jour
  const fields = Object.keys(updateData).filter(key => updateData[key as keyof UpdateUserRequest] !== undefined);
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const values = fields.map(field => updateData[field as keyof UpdateUserRequest]);

  const updateQuery = `
    UPDATE utilisateur 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, nom, prenom, email, role_id, created_at, updated_at, phone, theme, display_name, status
  `;

  const result = await query(updateQuery, [id, ...values]);
  const updatedUser = result.rows[0];

  // Récupérer les informations du rôle
  const roleResult = await query('SELECT libelle FROM role WHERE id = $1', [updatedUser.role_id]);

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'UPDATE',
      'User',
      parseInt(id),
      `Modification de l'utilisateur: ${updatedUser.prenom} ${updatedUser.nom}`,
      req.ip
    );
  }

  const userResponse: UserWithRole = {
    ...updatedUser,
    role: updatedUser.role_id ? {
      id: updatedUser.role_id,
      libelle: roleResult.rows[0]?.libelle
    } : undefined
  };

  res.status(200).json({
    success: true,
    message: 'Utilisateur modifié avec succès',
    data: { user: userResponse }
  });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 */
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Vérifier si l'utilisateur existe
  const existingUser = await query('SELECT nom, prenom FROM utilisateur WHERE id = $1', [id]);
  if (existingUser.rows.length === 0) {
    throw createError('Utilisateur non trouvé', 404);
  }

  // Empêcher la suppression de son propre compte
  if (req.user && req.user.id === parseInt(id)) {
    throw createError('Vous ne pouvez pas supprimer votre propre compte', 400);
  }

  const user = existingUser.rows[0];

  // Supprimer l'utilisateur
  await query('DELETE FROM utilisateur WHERE id = $1', [id]);

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'DELETE',
      'User',
      parseInt(id),
      `Suppression de l'utilisateur: ${user.prenom} ${user.nom}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Utilisateur supprimé avec succès'
  });
});

/**
 * @swagger
 * /users/roles:
 *   get:
 *     summary: Récupérer la liste des rôles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rôles
 */
export const getRoles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query('SELECT * FROM role ORDER BY libelle');

  res.status(200).json({
    success: true,
    data: { roles: result.rows }
  });
});