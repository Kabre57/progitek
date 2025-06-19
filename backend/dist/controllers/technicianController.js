"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialites = exports.deleteTechnician = exports.updateTechnician = exports.createTechnician = exports.getTechnicianById = exports.getTechnicians = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
exports.getTechnicians = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const specialite = req.query.specialite;
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    const conditions = [];
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
        (0, database_1.query)(dataQuery, params),
        (0, database_1.query)(countQuery, countParams)
    ]);
    const technicians = dataResult.rows.map((row) => ({
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
exports.getTechnicianById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, database_1.query)(`
    SELECT 
      t.id, t.nom, t.prenom, t.contact, t.specialite_id,
      s.libelle as specialite_libelle
    FROM technicien t
    LEFT JOIN specialite s ON t.specialite_id = s.id
    WHERE t.id = $1
  `, [id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Technicien non trouvé', 404);
    }
    const row = result.rows[0];
    const technician = {
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
exports.createTechnician = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { nom, prenom, contact, specialite_id } = req.body;
    if (specialite_id) {
        const specialiteCheck = await (0, database_1.query)('SELECT id FROM specialite WHERE id = $1', [specialite_id]);
        if (specialiteCheck.rows.length === 0) {
            throw (0, errorHandler_1.createError)('Spécialité invalide', 400);
        }
    }
    const result = await (0, database_1.query)(`
    INSERT INTO technicien (nom, prenom, contact, specialite_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [nom, prenom, contact, specialite_id]);
    const newTechnician = result.rows[0];
    let specialite = undefined;
    if (specialite_id) {
        const specialiteResult = await (0, database_1.query)('SELECT libelle FROM specialite WHERE id = $1', [specialite_id]);
        specialite = {
            id: specialite_id,
            libelle: specialiteResult.rows[0].libelle
        };
    }
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'CREATE', 'Technician', newTechnician.id, `Création d'un nouveau technicien: ${prenom} ${nom}`, req.ip);
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
exports.updateTechnician = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const existingTechnician = await (0, database_1.query)('SELECT * FROM technicien WHERE id = $1', [id]);
    if (existingTechnician.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Technicien non trouvé', 404);
    }
    if (updateData.specialite_id) {
        const specialiteCheck = await (0, database_1.query)('SELECT id FROM specialite WHERE id = $1', [updateData.specialite_id]);
        if (specialiteCheck.rows.length === 0) {
            throw (0, errorHandler_1.createError)('Spécialité invalide', 400);
        }
    }
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map(field => updateData[field]);
    const updateQuery = `
    UPDATE technicien 
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;
    const result = await (0, database_1.query)(updateQuery, [id, ...values]);
    const updatedTechnician = result.rows[0];
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'UPDATE', 'Technician', parseInt(id), `Modification du technicien: ${updatedTechnician.prenom} ${updatedTechnician.nom}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Technicien modifié avec succès',
        data: { technician: updatedTechnician }
    });
});
exports.deleteTechnician = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingTechnician = await (0, database_1.query)('SELECT nom, prenom FROM technicien WHERE id = $1', [id]);
    if (existingTechnician.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Technicien non trouvé', 404);
    }
    const technician = existingTechnician.rows[0];
    await (0, database_1.query)('DELETE FROM technicien WHERE id = $1', [id]);
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'DELETE', 'Technician', parseInt(id), `Suppression du technicien: ${technician.prenom} ${technician.nom}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Technicien supprimé avec succès'
    });
});
exports.getSpecialites = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM specialite ORDER BY libelle');
    res.status(200).json({
        success: true,
        data: { specialites: result.rows }
    });
});
//# sourceMappingURL=technicianController.js.map