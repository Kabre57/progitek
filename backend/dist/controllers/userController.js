"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoles = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
const emailService_1 = require("../services/emailService");
exports.getUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const role = req.query.role;
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    const conditions = [];
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
    const countQuery = `
    SELECT COUNT(*) as total 
    FROM utilisateur u
    LEFT JOIN role r ON u.role_id = r.id
    ${whereClause}
  `;
    const countParams = params.slice(0, -2);
    const [dataResult, countResult] = await Promise.all([
        (0, database_1.query)(dataQuery, params),
        (0, database_1.query)(countQuery, countParams)
    ]);
    const users = dataResult.rows.map((row) => ({
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
exports.getUserById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, database_1.query)(`
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
        throw (0, errorHandler_1.createError)('Utilisateur non trouvé', 404);
    }
    const row = result.rows[0];
    const user = {
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
exports.createUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { nom, prenom, email, mot_de_passe, role_id, phone, theme, display_name } = req.body;
    const existingUser = await (0, database_1.query)('SELECT id FROM utilisateur WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw (0, errorHandler_1.createError)('Cet email est déjà utilisé', 409);
    }
    const roleResult = await (0, database_1.query)('SELECT id, libelle FROM role WHERE id = $1', [role_id]);
    if (roleResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Rôle invalide', 400);
    }
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcryptjs_1.default.hash(mot_de_passe, saltRounds);
    const result = await (0, database_1.query)(`
    INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role_id, phone, theme, display_name, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
    RETURNING id, nom, prenom, email, role_id, created_at, updated_at, phone, theme, display_name, status
  `, [nom, prenom, email, hashedPassword, role_id, phone, theme, display_name]);
    const newUser = result.rows[0];
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'CREATE', 'User', newUser.id, `Création d'un nouvel utilisateur: ${prenom} ${nom}`, req.ip);
    }
    try {
        await (0, emailService_1.sendWelcomeEmail)(email, `${prenom} ${nom}`);
    }
    catch (error) {
        console.error('Erreur envoi email de bienvenue:', error);
    }
    const userResponse = {
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
exports.updateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const existingUser = await (0, database_1.query)('SELECT * FROM utilisateur WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Utilisateur non trouvé', 404);
    }
    if (updateData.email) {
        const emailCheck = await (0, database_1.query)('SELECT id FROM utilisateur WHERE email = $1 AND id != $2', [updateData.email, id]);
        if (emailCheck.rows.length > 0) {
            throw (0, errorHandler_1.createError)('Cet email est déjà utilisé', 409);
        }
    }
    if (updateData.role_id) {
        const roleCheck = await (0, database_1.query)('SELECT id FROM role WHERE id = $1', [updateData.role_id]);
        if (roleCheck.rows.length === 0) {
            throw (0, errorHandler_1.createError)('Rôle invalide', 400);
        }
    }
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map(field => updateData[field]);
    const updateQuery = `
    UPDATE utilisateur 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, nom, prenom, email, role_id, created_at, updated_at, phone, theme, display_name, status
  `;
    const result = await (0, database_1.query)(updateQuery, [id, ...values]);
    const updatedUser = result.rows[0];
    const roleResult = await (0, database_1.query)('SELECT libelle FROM role WHERE id = $1', [updatedUser.role_id]);
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'UPDATE', 'User', parseInt(id), `Modification de l'utilisateur: ${updatedUser.prenom} ${updatedUser.nom}`, req.ip);
    }
    const userResponse = {
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
exports.deleteUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingUser = await (0, database_1.query)('SELECT nom, prenom FROM utilisateur WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Utilisateur non trouvé', 404);
    }
    if (req.user && req.user.id === parseInt(id)) {
        throw (0, errorHandler_1.createError)('Vous ne pouvez pas supprimer votre propre compte', 400);
    }
    const user = existingUser.rows[0];
    await (0, database_1.query)('DELETE FROM utilisateur WHERE id = $1', [id]);
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'DELETE', 'User', parseInt(id), `Suppression de l'utilisateur: ${user.prenom} ${user.nom}`, req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
    });
});
exports.getRoles = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM role ORDER BY libelle');
    res.status(200).json({
        success: true,
        data: { roles: result.rows }
    });
});
//# sourceMappingURL=userController.js.map