import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/Client';
import { logAudit } from '../services/auditService';

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Récupérer la liste des clients
 *     tags: [Clients]
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
 *         name: statut
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des clients
 */
export const getClients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const statut = req.query.statut as string;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: any[] = [];
  let paramIndex = 1;

  const conditions: string[] = [];

  if (search) {
    conditions.push(`(nom ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR entreprise ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (statut) {
    conditions.push(`statut = $${paramIndex}`);
    params.push(statut);
    paramIndex++;
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  // Requête pour les données
  const dataQuery = `
    SELECT * FROM client
    ${whereClause}
    ORDER BY date_d_inscription DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  // Requête pour le total
  const countQuery = `SELECT COUNT(*) as total FROM client ${whereClause}`;
  const countParams = params.slice(0, -2);

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, params),
    query(countQuery, countParams)
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      clients: dataResult.rows,
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
 * /clients/{id}:
 *   get:
 *     summary: Récupérer un client par ID
 *     tags: [Clients]
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
 *         description: Détails du client
 *       404:
 *         description: Client non trouvé
 */
export const getClientById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('SELECT * FROM client WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw createError('Client non trouvé', 404);
  }

  res.status(200).json({
    success: true,
    data: { client: result.rows[0] }
  });
});

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Créer un nouveau client
 *     tags: [Clients]
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
 *               - email
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               entreprise:
 *                 type: string
 *               type_de_carte:
 *                 type: string
 *               statut:
 *                 type: string
 *               localisation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client créé avec succès
 */
export const createClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clientData: CreateClientRequest = req.body;

  // Vérifier si l'email existe déjà
  const existingClient = await query('SELECT id FROM client WHERE email = $1', [clientData.email]);
  if (existingClient.rows.length > 0) {
    throw createError('Cet email est déjà utilisé', 409);
  }

  const result = await query(`
    INSERT INTO client (nom, email, telephone, entreprise, type_de_carte, numero_de_carte, statut, localisation, theme)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    clientData.nom,
    clientData.email,
    clientData.telephone,
    clientData.entreprise,
    clientData.type_de_carte,
    clientData.numero_de_carte,
    clientData.statut || 'active',
    clientData.localisation,
    clientData.theme
  ]);

  const newClient = result.rows[0];

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'CREATE',
      'Client',
      newClient.id,
      `Création d'un nouveau client: ${clientData.nom}`,
      req.ip
    );
  }

  res.status(201).json({
    success: true,
    message: 'Client créé avec succès',
    data: { client: newClient }
  });
});

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Modifier un client
 *     tags: [Clients]
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
 *         description: Client modifié avec succès
 */
export const updateClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateClientRequest = req.body;

  // Vérifier si le client existe
  const existingClient = await query('SELECT * FROM client WHERE id = $1', [id]);
  if (existingClient.rows.length === 0) {
    throw createError('Client non trouvé', 404);
  }

  // Vérifier l'email unique si modifié
  if (updateData.email) {
    const emailCheck = await query('SELECT id FROM client WHERE email = $1 AND id != $2', [updateData.email, id]);
    if (emailCheck.rows.length > 0) {
      throw createError('Cet email est déjà utilisé', 409);
    }
  }

  // Construire la requête de mise à jour
  const fields = Object.keys(updateData).filter(key => updateData[key as keyof UpdateClientRequest] !== undefined);
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const values = fields.map(field => updateData[field as keyof UpdateClientRequest]);

  const updateQuery = `
    UPDATE client 
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(updateQuery, [id, ...values]);
  const updatedClient = result.rows[0];

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'UPDATE',
      'Client',
      parseInt(id),
      `Modification du client: ${updatedClient.nom}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Client modifié avec succès',
    data: { client: updatedClient }
  });
});

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Supprimer un client
 *     tags: [Clients]
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
 *         description: Client supprimé avec succès
 */
export const deleteClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Vérifier si le client existe
  const existingClient = await query('SELECT nom FROM client WHERE id = $1', [id]);
  if (existingClient.rows.length === 0) {
    throw createError('Client non trouvé', 404);
  }

  const client = existingClient.rows[0];

  // Supprimer le client (les missions seront supprimées en cascade)
  await query('DELETE FROM client WHERE id = $1', [id]);

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'DELETE',
      'Client',
      parseInt(id),
      `Suppression du client: ${client.nom}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Client supprimé avec succès'
  });
});