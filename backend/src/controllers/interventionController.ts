import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { InterventionWithDetails, CreateInterventionRequest, UpdateInterventionRequest } from '../models/Intervention';
import { logAudit } from '../services/auditService';

/**
 * @swagger
 * /interventions:
 *   get:
 *     summary: Récupérer la liste des interventions
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des interventions
 */
export const getInterventions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const technicien_id = req.query.technicien_id as string;
  const mission_id = req.query.mission_id as string;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: any[] = [];
  let paramIndex = 1;

  const conditions: string[] = [];

  if (search) {
    conditions.push(`(m.nature_intervention ILIKE $${paramIndex} OR t.nom ILIKE $${paramIndex} OR t.prenom ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (technicien_id) {
    conditions.push(`i.technicien_id = $${paramIndex}`);
    params.push(parseInt(technicien_id));
    paramIndex++;
  }

  if (mission_id) {
    conditions.push(`i.mission_id = $${paramIndex}`);
    params.push(parseInt(mission_id));
    paramIndex++;
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  const dataQuery = `
    SELECT 
      i.id, i.date_heure_debut, i.date_heure_fin, i.duree, i.mission_id, i.technicien_id,
      m.num_intervention, m.nature_intervention, m.objectif_du_contrat,
      t.nom as technicien_nom, t.prenom as technicien_prenom, t.contact as technicien_contact,
      s.libelle as specialite_libelle,
      c.nom as client_nom, c.entreprise as client_entreprise
    FROM intervention i
    LEFT JOIN mission m ON i.mission_id = m.num_intervention
    LEFT JOIN client c ON m.client_id = c.id
    LEFT JOIN technicien t ON i.technicien_id = t.id
    LEFT JOIN specialite s ON t.specialite_id = s.id
    ${whereClause}
    ORDER BY i.date_heure_debut DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM intervention i
    LEFT JOIN mission m ON i.mission_id = m.num_intervention
    LEFT JOIN client c ON m.client_id = c.id
    LEFT JOIN technicien t ON i.technicien_id = t.id
    ${whereClause}
  `;
  const countParams = params.slice(0, -2);

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, params),
    query(countQuery, countParams)
  ]);

  const interventions: InterventionWithDetails[] = dataResult.rows.map((row: any) => ({
    id: row.id,
    date_heure_debut: row.date_heure_debut,
    date_heure_fin: row.date_heure_fin,
    duree: row.duree,
    mission_id: row.mission_id,
    technicien_id: row.technicien_id,
    mission: row.mission_id ? {
      num_intervention: row.num_intervention,
      nature_intervention: row.nature_intervention,
      objectif_du_contrat: row.objectif_du_contrat,
      client: { id: row.client_id, nom: row.client_nom, email: row.client_email, entreprise: row.client_entreprise, date_d_inscription: row.date_d_inscription }
    } : undefined,
    technicien: row.technicien_id ? {
      id: row.technicien_id,
      nom: row.technicien_nom,
      prenom: row.technicien_prenom,
      contact: row.technicien_contact,
      specialite: row.specialite_libelle ? {
        id: 0,
        libelle: row.specialite_libelle
      } : undefined
    } : undefined
  }));

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      interventions,
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
 * /interventions/{id}:
 *   get:
 *     summary: Récupérer une intervention par ID
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails de l'intervention
 */
export const getInterventionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(`
    SELECT 
      i.id, i.date_heure_debut, i.date_heure_fin, i.duree, i.mission_id, i.technicien_id,
      m.num_intervention, m.nature_intervention, m.objectif_du_contrat, m.description,
      t.nom as technicien_nom, t.prenom as technicien_prenom, t.contact as technicien_contact,
      s.libelle as specialite_libelle,
      c.nom as client_nom, c.email as client_email, c.entreprise as client_entreprise
    FROM intervention i
    LEFT JOIN mission m ON i.mission_id = m.num_intervention
    LEFT JOIN client c ON m.client_id = c.id
    LEFT JOIN technicien t ON i.technicien_id = t.id
    LEFT JOIN specialite s ON t.specialite_id = s.id
    WHERE i.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw createError('Intervention non trouvée', 404);
  }

  const row = result.rows[0];
  const intervention: InterventionWithDetails = {
    id: row.id,
    date_heure_debut: row.date_heure_debut,
    date_heure_fin: row.date_heure_fin,
    duree: row.duree,
    mission_id: row.mission_id,
    technicien_id: row.technicien_id,
    mission: row.mission_id ? {
      num_intervention: row.num_intervention,
      nature_intervention: row.nature_intervention,
      objectif_du_contrat: row.objectif_du_contrat,
      description: row.description,
      client: {
        id: 0,
        nom: row.client_nom,
        email: row.client_email,
        entreprise: row.client_entreprise,
        date_d_inscription: new Date()
      }
    } : undefined,
    technicien: row.technicien_id ? {
      id: row.technicien_id,
      nom: row.technicien_nom,
      prenom: row.technicien_prenom,
      contact: row.technicien_contact,
      specialite: row.specialite_libelle ? {
        id: 0,
        libelle: row.specialite_libelle
      } : undefined
    } : undefined
  };

  res.status(200).json({
    success: true,
    data: { intervention }
  });
});

/**
 * @swagger
 * /interventions:
 *   post:
 *     summary: Créer une nouvelle intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Intervention créée avec succès
 */
export const createIntervention = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date_heure_debut, date_heure_fin, mission_id, technicien_id }: CreateInterventionRequest = req.body;

  // Vérifier si la mission existe
  const missionCheck = await query('SELECT num_intervention, nature_intervention FROM mission WHERE num_intervention = $1', [mission_id]);
  if (missionCheck.rows.length === 0) {
    throw createError('Mission invalide', 400);
  }

  // Vérifier si le technicien existe (optionnel)
  if (technicien_id) {
    const technicienCheck = await query('SELECT id FROM technicien WHERE id = $1', [technicien_id]);
    if (technicienCheck.rows.length === 0) {
      throw createError('Technicien invalide', 400);
    }
  }

  // Calculer la durée si les deux dates sont fournies
  let duree = null;
  if (date_heure_debut && date_heure_fin) {
    const debut = new Date(date_heure_debut);
    const fin = new Date(date_heure_fin);
    duree = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60); // en heures
  }

  const result = await query(`
    INSERT INTO intervention (date_heure_debut, date_heure_fin, duree, mission_id, technicien_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [date_heure_debut, date_heure_fin, duree, mission_id, technicien_id]);

  const newIntervention = result.rows[0];

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'CREATE',
      'Intervention',
      newIntervention.id,
      `Création d'une nouvelle intervention pour la mission #${mission_id}`,
      req.ip
    );
  }

  res.status(201).json({
    success: true,
    message: 'Intervention créée avec succès',
    data: { intervention: newIntervention }
  });
});

/**
 * @swagger
 * /interventions/{id}:
 *   put:
 *     summary: Modifier une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Intervention modifiée avec succès
 */
export const updateIntervention = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateInterventionRequest = req.body;

  // Vérifier si l'intervention existe
  const existingIntervention = await query('SELECT * FROM intervention WHERE id = $1', [id]);
  if (existingIntervention.rows.length === 0) {
    throw createError('Intervention non trouvée', 404);
  }

  // Vérifier la mission si modifiée
  if (updateData.mission_id) {
    const missionCheck = await query('SELECT num_intervention FROM mission WHERE num_intervention = $1', [updateData.mission_id]);
    if (missionCheck.rows.length === 0) {
      throw createError('Mission invalide', 400);
    }
  }

  // Vérifier le technicien si modifié
  if (updateData.technicien_id) {
    const technicienCheck = await query('SELECT id FROM technicien WHERE id = $1', [updateData.technicien_id]);
    if (technicienCheck.rows.length === 0) {
      throw createError('Technicien invalide', 400);
    }
  }

  // Recalculer la durée si nécessaire
  const current = existingIntervention.rows[0];
  const newDebut = updateData.date_heure_debut || current.date_heure_debut;
  const newFin = updateData.date_heure_fin || current.date_heure_fin;

  if (newDebut && newFin) {
    const debut = new Date(newDebut);
    const fin = new Date(newFin);
    updateData.duree = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
  }

  // Construire la requête de mise à jour
  const fields = Object.keys(updateData).filter(key => updateData[key as keyof UpdateInterventionRequest] !== undefined);
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const values = fields.map(field => updateData[field as keyof UpdateInterventionRequest]);

  const updateQuery = `
    UPDATE intervention 
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(updateQuery, [id, ...values]);
  const updatedIntervention = result.rows[0];

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'UPDATE',
      'Intervention',
      parseInt(id),
      `Modification de l'intervention #${id}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Intervention modifiée avec succès',
    data: { intervention: updatedIntervention }
  });
});

/**
 * @swagger
 * /interventions/{id}:
 *   delete:
 *     summary: Supprimer une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Intervention supprimée avec succès
 */
export const deleteIntervention = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Vérifier si l'intervention existe
  const existingIntervention = await query('SELECT id FROM intervention WHERE id = $1', [id]);
  if (existingIntervention.rows.length === 0) {
    throw createError('Intervention non trouvée', 404);
  }

  // Supprimer l'intervention
  await query('DELETE FROM intervention WHERE id = $1', [id]);

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'DELETE',
      'Intervention',
      parseInt(id),
      `Suppression de l'intervention #${id}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Intervention supprimée avec succès'
  });
});