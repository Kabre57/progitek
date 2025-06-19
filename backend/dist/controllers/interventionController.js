"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIntervention = exports.updateIntervention = exports.createIntervention = exports.getInterventionById = exports.getInterventions = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
exports.getInterventions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const technicien_id = req.query.technicien_id;
    const mission_id = req.query.mission_id;
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    const conditions = [];
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
        (0, database_1.query)(dataQuery, params),
        (0, database_1.query)(countQuery, countParams)
    ]);
    const interventions = dataResult.rows.map((row) => ({
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
exports.getInterventionById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, database_1.query)(`
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
        throw (0, errorHandler_1.createError)('Intervention non trouvée', 404);
    }
    const row = result.rows[0];
    const intervention = {
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
exports.createIntervention = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { date_heure_debut, date_heure_fin, mission_id, technicien_id } = req.body;
    const missionCheck = await (0, database_1.query)('SELECT num_intervention, nature_intervention FROM mission WHERE num_intervention = $1', [mission_id]);
    if (missionCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Mission invalide', 400);
    }
    if (technicien_id) {
        const technicienCheck = await (0, database_1.query)('SELECT id FROM technicien WHERE id = $1', [technicien_id]);
        if (technicienCheck.rows.length === 0) {
            throw (0, errorHandler_1.createError)('Technicien invalide', 400);
        }
    }
    let duree = null;
    if (date_heure_debut && date_heure_fin) {
        const debut = new Date(date_heure_debut);
        const fin = new Date(date_heure_fin);
        duree = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
    }
    const result = await (0, database_1.query)(`
    INSERT INTO intervention (date_heure_debut, date_heure_fin, duree, mission_id, technicien_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [date_heure_debut, date_heure_fin, duree, mission_id, technicien_id]);
    const newIntervention = result.rows[0];
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'CREATE', 'Intervention', newIntervention.id, `Création d'une nouvelle intervention pour la mission #${mission_id}`, req.ip);
    }
    res.status(201).json({
        success: true,
        message: 'Intervention créée avec succès',
        data: { intervention: newIntervention }
    });
});
exports.updateIntervention = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const existingIntervention = await (0, database_1.query)('SELECT * FROM intervention WHERE id = $1', [id]);
    if (existingIntervention.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Intervention non trouvée', 404);
    }
    if (updateData.mission_id) {
        const missionCheck = await (0, database_1.query)('SELECT num_intervention FROM mission WHERE num_intervention = $1', [updateData.mission_id]);
        if (missionCheck.rows.length === 0) {
            throw (0, errorHandler_1.createError)('Mission invalide', 400);
        }
    }
    if (updateData.technicien_id) {
        const technicienCheck = await (0, database_1.query)('SELECT id FROM technicien WHERE id = $1', [updateData.technicien_id]);
        if (technicienCheck.rows.length === 0) {
            throw (0, errorHandler_1.createError)('Technicien invalide', 400);
        }
    }
    const current = existingIntervention.rows[0];
    const newDebut = updateData.date_heure_debut || current.date_heure_debut;
    const newFin = updateData.date_heure_fin || current.date_heure_fin;
    if (newDebut && newFin) {
        const debut = new Date(newDebut);
        const fin = new Date(newFin);
        updateData.duree = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
    }
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map(field => updateData[field]);
    const updateQuery = `
    UPDATE intervention 
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;
    const result = await (0, database_1.query)(updateQuery, [id, ...values]);
    const updatedIntervention = result.rows[0];
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'UPDATE', 'Intervention', parseInt(id), `Modification de l'intervention #${id}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Intervention modifiée avec succès',
        data: { intervention: updatedIntervention }
    });
});
exports.deleteIntervention = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingIntervention = await (0, database_1.query)('SELECT id FROM intervention WHERE id = $1', [id]);
    if (existingIntervention.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Intervention non trouvée', 404);
    }
    await (0, database_1.query)('DELETE FROM intervention WHERE id = $1', [id]);
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'DELETE', 'Intervention', parseInt(id), `Suppression de l'intervention #${id}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Intervention supprimée avec succès'
    });
});
//# sourceMappingURL=interventionController.js.map