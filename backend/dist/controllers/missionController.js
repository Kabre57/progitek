"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMission = exports.updateMission = exports.createMission = exports.getMissionById = exports.getMissions = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
exports.getMissions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const client_id = req.query.client_id;
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    const conditions = [];
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
        (0, database_1.query)(dataQuery, params),
        (0, database_1.query)(countQuery, countParams)
    ]);
    const missions = dataResult.rows.map((row) => ({
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
exports.getMissionById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, database_1.query)(`
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
        throw (0, errorHandler_1.createError)('Mission non trouvée', 404);
    }
    const row = result.rows[0];
    const mission = {
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
exports.createMission = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { nature_intervention, objectif_du_contrat, description, date_sortie_fiche_intervention, client_id } = req.body;
    const clientCheck = await (0, database_1.query)('SELECT id, nom FROM client WHERE id = $1', [client_id]);
    if (clientCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Client invalide', 400);
    }
    const result = await (0, database_1.query)(`
    INSERT INTO mission (nature_intervention, objectif_du_contrat, description, date_sortie_fiche_intervention, client_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [nature_intervention, objectif_du_contrat, description, date_sortie_fiche_intervention, client_id]);
    const newMission = result.rows[0];
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'CREATE', 'Mission', newMission.num_intervention, `Création d'une nouvelle mission: ${nature_intervention}`, req.ip);
    }
    res.status(201).json({
        success: true,
        message: 'Mission créée avec succès',
        data: { mission: newMission }
    });
});
exports.updateMission = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const existingMission = await (0, database_1.query)('SELECT * FROM mission WHERE num_intervention = $1', [id]);
    if (existingMission.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Mission non trouvée', 404);
    }
    if (updateData.client_id) {
        const clientCheck = await (0, database_1.query)('SELECT id FROM client WHERE id = $1', [updateData.client_id]);
        if (clientCheck.rows.length === 0) {
            throw (0, errorHandler_1.createError)('Client invalide', 400);
        }
    }
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map(field => updateData[field]);
    const updateQuery = `
    UPDATE mission 
    SET ${setClause}
    WHERE num_intervention = $1
    RETURNING *
  `;
    const result = await (0, database_1.query)(updateQuery, [id, ...values]);
    const updatedMission = result.rows[0];
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'UPDATE', 'Mission', parseInt(id), `Modification de la mission: ${updatedMission.nature_intervention}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Mission modifiée avec succès',
        data: { mission: updatedMission }
    });
});
exports.deleteMission = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingMission = await (0, database_1.query)('SELECT nature_intervention FROM mission WHERE num_intervention = $1', [id]);
    if (existingMission.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Mission non trouvée', 404);
    }
    const mission = existingMission.rows[0];
    await (0, database_1.query)('DELETE FROM mission WHERE num_intervention = $1', [id]);
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'DELETE', 'Mission', parseInt(id), `Suppression de la mission: ${mission.nature_intervention}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Mission supprimée avec succès'
    });
});
//# sourceMappingURL=missionController.js.map