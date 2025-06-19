"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
exports.getClients = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const statut = req.query.statut;
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    const conditions = [];
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
    const dataQuery = `
    SELECT * FROM client
    ${whereClause}
    ORDER BY date_d_inscription DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
    params.push(limit, offset);
    const countQuery = `SELECT COUNT(*) as total FROM client ${whereClause}`;
    const countParams = params.slice(0, -2);
    const [dataResult, countResult] = await Promise.all([
        (0, database_1.query)(dataQuery, params),
        (0, database_1.query)(countQuery, countParams)
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
exports.getClientById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, database_1.query)('SELECT * FROM client WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Client non trouvé', 404);
    }
    res.status(200).json({
        success: true,
        data: { client: result.rows[0] }
    });
});
exports.createClient = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const clientData = req.body;
    const existingClient = await (0, database_1.query)('SELECT id FROM client WHERE email = $1', [clientData.email]);
    if (existingClient.rows.length > 0) {
        throw (0, errorHandler_1.createError)('Cet email est déjà utilisé', 409);
    }
    const result = await (0, database_1.query)(`
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
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'CREATE', 'Client', newClient.id, `Création d'un nouveau client: ${clientData.nom}`, req.ip);
    }
    res.status(201).json({
        success: true,
        message: 'Client créé avec succès',
        data: { client: newClient }
    });
});
exports.updateClient = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const existingClient = await (0, database_1.query)('SELECT * FROM client WHERE id = $1', [id]);
    if (existingClient.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Client non trouvé', 404);
    }
    if (updateData.email) {
        const emailCheck = await (0, database_1.query)('SELECT id FROM client WHERE email = $1 AND id != $2', [updateData.email, id]);
        if (emailCheck.rows.length > 0) {
            throw (0, errorHandler_1.createError)('Cet email est déjà utilisé', 409);
        }
    }
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map(field => updateData[field]);
    const updateQuery = `
    UPDATE client 
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;
    const result = await (0, database_1.query)(updateQuery, [id, ...values]);
    const updatedClient = result.rows[0];
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'UPDATE', 'Client', parseInt(id), `Modification du client: ${updatedClient.nom}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Client modifié avec succès',
        data: { client: updatedClient }
    });
});
exports.deleteClient = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingClient = await (0, database_1.query)('SELECT nom FROM client WHERE id = $1', [id]);
    if (existingClient.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Client non trouvé', 404);
    }
    const client = existingClient.rows[0];
    await (0, database_1.query)('DELETE FROM client WHERE id = $1', [id]);
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'DELETE', 'Client', parseInt(id), `Suppression du client: ${client.nom}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Client supprimé avec succès'
    });
});
//# sourceMappingURL=clientController.js.map