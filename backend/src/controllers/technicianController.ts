import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { TechnicienWithSpecialite, CreateTechnicienRequest, UpdateTechnicienRequest } from '../models/Technician';
import { logAudit } from '../services/auditService';

/**
 * @swagger
 * /technicians:
 *   get:
 *     summary: Récupérer la liste des techniciens
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des techniciens
 */
export const getTechnicians = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const specialite = req.query.specialite as string;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: any[] = [];
  let paramIndex = 1;

  const conditions: string[] = [];

  if (search) {
    conditions.push(`(t.nom ILIKE $${paramIndex} OR t.prenom ILIKE $${paramIndex} OR t.contact ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (specialite) {
    conditions.push(`s.libelle = $${paramIndex}`);
    params.push(specialite);
    paramIndex++;
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  const dataQuery = `
    SELECT 
      t.id, t.nom, t.prenom, t.contact, t.specialite_id,
      s.libelle as specialite_libelle
    FROM technicien t
    LEFT JOIN specialite s ON t.specialite_id = s.id
    ${whereClause}
    ORDER BY t.nom, t.prenom
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM technicien t
    LEFT JOIN specialite s ON t.specialite_id = s.id
    ${whereClause}
  `;
  const countParams = params.slice(0, -2);

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, params),
    query(countQuery, countParams)
  ]);

  const technicians: TechnicienWithSpecialite[] = dataResult.rows.map((row: any) => ({
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    contact: row.contact,
    specialite_id: row.specialite_id,
    specialite: row.specialite_id ? {
      id: row.specialite_id,
      libelle: row.specialite_libelle
    } : undefined
  }));

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      technicians,
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
 * /technicians/{id}:
 *   get:
 *     summary: Récupérer un technicien par ID
 *     tags: [Technicians]
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
 *         description: Détails du technicien
 */
export const getTechnicianById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(`
    SELECT 
      t.id, t.nom, t.prenom, t.contact, t.specialite_id,
      s.libelle as specialite_libelle
    FROM technicien t
    LEFT JOIN specialite s ON t.specialite_id = s.id
    WHERE t.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw createError('Technicien non trouvé', 404);
  }

  const row = result.rows[0];
  const technician: TechnicienWithSpecialite = {
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    contact: row.contact,
    specialite_id: row.specialite_id,
    specialite: row.specialite_id ? {
      id: row.specialite_id,
      libelle: row.specialite_libelle
    } : undefined
  };

  res.status(200).json({
    success: true,
    data: { technician }
  });
});

/**
 * @swagger
 * /technicians:
 *   post:
 *     summary: Créer un nouveau technicien
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Technicien créé avec succès
 */
export const createTechnician = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nom, prenom, contact, specialite_id }: CreateTechnicienRequest = req.body;

  // Vérifier si la spécialité existe
  if (specialite_id) {
    const specialiteCheck = await query('SELECT id FROM specialite WHERE id = $1', [specialite_id]);
    if (specialiteCheck.rows.length === 0) {
      throw createError('Spécialité invalide', 400);
    }
  }

  const result = await query(`
    INSERT INTO technicien (nom, prenom, contact, specialite_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [nom, prenom, contact, specialite_id]);

  const newTechnician = result.rows[0];

  // Récupérer les informations de la spécialité
  let specialite = undefined;
  if (specialite_id) {
    const specialiteResult = await query('SELECT libelle FROM specialite WHERE id = $1', [specialite_id]);
    specialite = {
      id: specialite_id,
      libelle: specialiteResult.rows[0].libelle
    };
  }

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'CREATE',
      'Technician',
      newTechnician.id,
      `Création d'un nouveau technicien: ${prenom} ${nom}`,
      req.ip
    );
  }

  res.status(201).json({
    success: true,
    message: 'Technicien créé avec succès',
    data: { 
      technician: {
        ...newTechnician,
        specialite
      }
    }
  });
});

/**
 * @swagger
 * /technicians/{id}:
 *   put:
 *     summary: Modifier un technicien
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Technicien modifié avec succès
 */
export const updateTechnician = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateTechnicienRequest = req.body;

  // Vérifier si le technicien existe
  const existingTechnician = await query('SELECT * FROM technicien WHERE id = $1', [id]);
  if (existingTechnician.rows.length === 0) {
    throw createError('Technicien non trouvé', 404);
  }

  // Vérifier la spécialité si modifiée
  if (updateData.specialite_id) {
    const specialiteCheck = await query('SELECT id FROM specialite WHERE id = $1', [updateData.specialite_id]);
    if (specialiteCheck.rows.length === 0) {
      throw createError('Spécialité invalide', 400);
    }
  }

  // Construire la requête de mise à jour
  const fields = Object.keys(updateData).filter(key => updateData[key as keyof UpdateTechnicienRequest] !== undefined);
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const values = fields.map(field => updateData[field as keyof UpdateTechnicienRequest]);

  const updateQuery = `
    UPDATE technicien 
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(updateQuery, [id, ...values]);
  const updatedTechnician = result.rows[0];

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'UPDATE',
      'Technician',
      parseInt(id),
      `Modification du technicien: ${updatedTechnician.prenom} ${updatedTechnician.nom}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Technicien modifié avec succès',
    data: { technician: updatedTechnician }
  });
});

/**
 * @swagger
 * /technicians/{id}:
 *   delete:
 *     summary: Supprimer un technicien
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Technicien supprimé avec succès
 */
export const deleteTechnician = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Vérifier si le technicien existe
  const existingTechnician = await query('SELECT nom, prenom FROM technicien WHERE id = $1', [id]);
  if (existingTechnician.rows.length === 0) {
    throw createError('Technicien non trouvé', 404);
  }

  const technician = existingTechnician.rows[0];

  // Supprimer le technicien
  await query('DELETE FROM technicien WHERE id = $1', [id]);

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'DELETE',
      'Technician',
      parseInt(id),
      `Suppression du technicien: ${technician.prenom} ${technician.nom}`,
      req.ip
    );
  }

  res.status(200).json({
    success: true,
    message: 'Technicien supprimé avec succès'
  });
});

/**
 * @swagger
 * /technicians/specialites:
 *   get:
 *     summary: Récupérer la liste des spécialités
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des spécialités
 */
export const getSpecialites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query('SELECT * FROM specialite ORDER BY libelle');

  res.status(200).json({
    success: true,
    data: { specialites: result.rows }
  });
});