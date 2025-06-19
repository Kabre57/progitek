import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { MissionWithClient, CreateMissionRequest, UpdateMissionRequest } from '../models/Mission';
import { logAudit } from '../services/auditService';

/**
 * @swagger
 * /missions:
 *   get:
 *     summary: Récupérer la liste des missions
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des missions
 */
export const getMissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const client_id = req.query.client_id as string;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: any[] = [];
  let paramIndex = 1;

  const conditions: string[] = [];

  if (search) {
    conditions.push(`(m.nature_intervention ILIKE $${paramIndex} OR m.objectif_du_contrat ILIKE $${paramIndex} OR c.nom ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (client_id) {
    conditions.push(`m.client_id = $${paramIndex}`);
    params.push(parseInt(client_id));
    paramIndex++;
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  const dataQuery = `
    SELECT 
      m.num_intervention, m.nature_intervention, m.objectif_du_contrat, 
      m.description, m.date_sortie_fiche_intervention, m.client_id,
      c.nom as client_nom, c.email as client_email, c.entreprise as client_entreprise
    FROM mission m
    LEFT JOIN client c ON m.client_id = c.id
    ${whereClause}
    ORDER BY m.date_sortie_fiche_intervention DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM mission m
    LEFT JOIN client c ON m.client_id = c.id
    ${whereClause}
  `;
  const countParams = params.slice(0, -2);

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, params),
    query(countQuery, countParams)
  ]);

  const missions: MissionWithClient[] = dataResult.rows.map((row: any) => ({
    num_intervention: row.num_intervention,
    nature_intervention: row.nature_intervention,
    objectif_du_contrat: row.objectif_du_contrat,
    description: row.description,
    date_sortie_fiche_intervention: row.date_sortie_fiche_intervention,
    client_id: row.client_id,
    client: row.client_id ? {
      id: row.client_id,
      nom: row.client_nom,
      email: row.client_email,
      entreprise: row.client_entreprise,
      date_d_inscription: new Date()
    } : undefined
  }));

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      missions,
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
 * /missions/{id}:
 *   get:
 *     summary: Récupérer une mission par ID
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails de la mission
 */
export const getMissionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(`
    SELECT 
      m.num_intervention, m.nature_intervention, m.objectif_du_contrat, 
      m.description, m.date_sortie_fiche_intervention, m.client_id,
      c.nom as client_nom, c.email as client_email, c.entreprise as client_entreprise,
      c.telephone as client_telephone, c.localisation as client_localisation
    FROM mission m
    LEFT JOIN client c ON m.client_id = c.id
    WHERE m.num_intervention = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw createError('Mission non trouvée', 404);
  }

  const row = result.rows[0];
  const mission: MissionWithClient = {
    num_intervention: row.num_intervention,
    nature_intervention: row.nature_intervention,
    objectif_du_contrat: row.objectif_du_contrat,
    description: row.description,
    date_sortie_fiche_intervention: row.date_sortie_fiche_intervention,
    client_id: row.client_id,
    client: row.client_id ? {
      id: row.client_id,
      nom: row.client_nom,
      email: row.client_email,
      entreprise: row.client_entreprise,
      telephone: row.client_telephone,
      localisation: row.client_localisation,
      date_d_inscription: new Date()
    } : undefined
  };

  res.status(200).json({
    success: true,
    data: { mission }
  });
});

/**
 * @swagger
 * /missions:
 *   post:
 *     summary: Créer une nouvelle mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Mission créée avec succès
 */
export const createMission = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nature_intervention, objectif_du_contrat, description, date_sortie_fiche_intervention, client_id }: CreateMissionRequest = req.body;

  // Vérifier si le client existe
  const clientCheck = await query('SELECT id, nom FROM client WHERE id = $1', [client_id]);
  if (clientCheck.rows.length === 0) {
    throw createError('Client invalide', 400);
  }

  const result = await query(`
    INSERT INTO mission (nature_intervention, objectif_du_contrat, description, date_sortie_fiche_intervention, client_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [nature_intervention, objectif_du_contrat, description, date_sortie_fiche_intervention, client_id]);

  const newMission = result.rows[0];

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'CREATE',
      'Mission',
      newMission.num_intervention,
      `Création d'une nouvelle mission: ${nature_intervention}`,
      req.ip
    );
  }

  res.status(201).json({
    success: true,
    message: 'Mission créée avec succès',
    data: { mission: newMission }
  });
});

/**
 * @swagger
 * /missions/{id}:
 *   put:
 *     summary: Modifier une mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mission modifiée avec succès
 */
export const updateMission = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateMissionRequest = req.body;

  // Vérifier si la mission existe
  const existingMission = await query('SELECT * FROM mission WHERE num_intervention = $1', [id]);
  if (existingMission.rows.length === 0) {
    throw createError('Mission non trouvée', 404);
  }

  // Vérifier le client si modifié
  if (updateData.client_id) {
    const clientCheck = await query('SELECT id FROM client WHERE id = $1', [updateData.client_id]);
    if (clientCheck.rows.length === 0) {
      throw createError('Client invalide', 400);
    }
  }

  // Construire la requête de mise à jour
  const fields = Object.keys(updateData).filter(key => updateData[key as keyof UpdateMissionRequest] !== undefined);
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const values = fields.map(field => updateData[field as keyof UpdateMissionRequest]);

  const updateQuery = `
    UPDATE mission 
    SET ${setClause}
    WHERE num_intervention = $1
    RETURNING *
  `;

  const result = await query(updateQuery, [id, ...values]);
  const updatedMission = result.rows[0];

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'UPDATE',
      'Mission',
      parseInt(id),
      `Modification de la mission: ${updatedMission.nature_intervention}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Mission modifiée avec succès',
    data: { mission: updatedMission }
  });
});

/**
 * @swagger
 * /missions/{id}:
 *   delete:
 *     summary: Supprimer une mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mission supprimée avec succès
 */
export const deleteMission = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Vérifier si la mission existe
  const existingMission = await query('SELECT nature_intervention FROM mission WHERE num_intervention = $1', [id]);
  if (existingMission.rows.length === 0) {
    throw createError('Mission non trouvée', 404);
  }

  const mission = existingMission.rows[0];

  // Supprimer la mission (les interventions seront supprimées en cascade)
  await query('DELETE FROM mission WHERE num_intervention = $1', [id]);

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'DELETE',
      'Mission',
      parseInt(id),
      `Suppression de la mission: ${mission.nature_intervention}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Mission supprimée avec succès'
  });
});