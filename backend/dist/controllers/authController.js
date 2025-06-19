"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.logout = exports.getMe = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../config/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) {
        throw (0, errorHandler_1.createError)('Email et mot de passe requis', 400);
    }
    const { data: users, error } = await supabase_1.supabase
        .from('utilisateur')
        .select(`
      id, nom, prenom, email, mot_de_passe, role_id, status, last_login,
      theme, display_name, phone,
      role:role_id (
        id, libelle
      )
    `)
        .eq('email', email)
        .single();
    if (error || !users) {
        throw (0, errorHandler_1.createError)('Identifiants invalides', 401);
    }
    if (users.status !== 'active') {
        throw (0, errorHandler_1.createError)('Compte désactivé', 401);
    }
    const isValidPassword = await bcryptjs_1.default.compare(mot_de_passe, users.mot_de_passe);
    if (!isValidPassword) {
        throw (0, errorHandler_1.createError)('Identifiants invalides', 401);
    }
    await supabase_1.supabase
        .from('utilisateur')
        .update({ last_login: new Date().toISOString() })
        .eq('id', users.id);
    const token = jsonwebtoken_1.default.sign({
        id: users.id,
        email: users.email,
        role: users.role && users.role.length > 0 ? users.role[0].libelle : undefined
    }, process.env.JWT_SECRET || 'default-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
    await (0, auditService_1.logAudit)(users.id, users.email, 'LOGIN', 'Auth', users.id, 'Connexion utilisateur', req.ip);
    await supabase_1.supabase
        .from('activity_log')
        .insert({
        user_id: users.id,
        ip: req.ip,
        browser: req.get('User-Agent')
    });
    const userResponse = {
        id: users.id,
        nom: users.nom,
        prenom: users.prenom,
        email: users.email,
        role_id: users.role_id,
        theme: users.theme,
        display_name: users.display_name,
        phone: users.phone,
        status: users.status,
        last_login: users.last_login,
        role: users.role
    };
    res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: {
            user: userResponse,
            token
        }
    });
});
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { nom, prenom, email, mot_de_passe } = req.body;
    if (!nom || !prenom || !email || !mot_de_passe) {
        throw (0, errorHandler_1.createError)('Tous les champs sont requis', 400);
    }
    const { data: existingUser } = await supabase_1.supabase
        .from('utilisateur')
        .select('id')
        .eq('email', email)
        .single();
    if (existingUser) {
        throw (0, errorHandler_1.createError)('Cet email est déjà utilisé', 409);
    }
    const { data: defaultRole } = await supabase_1.supabase
        .from('role')
        .select('id')
        .eq('libelle', 'Client')
        .single();
    if (!defaultRole) {
        throw (0, errorHandler_1.createError)('Erreur de configuration des rôles', 500);
    }
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcryptjs_1.default.hash(mot_de_passe, saltRounds);
    const { data: newUser, error } = await supabase_1.supabase
        .from('utilisateur')
        .insert({
        nom,
        prenom,
        email,
        mot_de_passe: hashedPassword,
        role_id: defaultRole.id,
        status: 'active'
    })
        .select()
        .single();
    if (error) {
        throw (0, errorHandler_1.createError)('Erreur lors de la création du compte', 500);
    }
    res.status(201).json({
        success: true,
        message: 'Compte créé avec succès',
        data: {
            user: {
                id: newUser.id,
                nom: newUser.nom,
                prenom: newUser.prenom,
                email: newUser.email
            }
        }
    });
});
exports.getMe = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Utilisateur non authentifié', 401);
    }
    const { data: user, error } = await supabase_1.supabase
        .from('utilisateur')
        .select(`
      id, nom, prenom, email, role_id, status, last_login,
      theme, display_name, phone, address, state, country, designation,
      role:role_id (id, libelle)
    `)
        .eq('id', req.user.id)
        .single();
    if (error || !user) {
        throw (0, errorHandler_1.createError)('Utilisateur non trouvé', 404);
    }
    res.status(200).json({
        success: true,
        data: { user }
    });
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'LOGOUT', 'Auth', req.user.id, 'Déconnexion utilisateur', req.ip);
    }
    res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
    });
});
exports.forgotPassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email requis" });
    }
    const { data: user, error } = await supabase_1.supabase
        .from("utilisateur")
        .select("id, email")
        .eq("email", email)
        .single();
    if (error || !user) {
        return res.status(200).json({
            success: true,
            message: "Si l'email existe, un lien de réinitialisation a été envoyé."
        });
    }
    const resetToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '1h' });
    await (0, auditService_1.logAudit)(user.id, user.email, 'FORGOT_PASSWORD', 'Auth', user.id, 'Demande de réinitialisation de mot de passe', req.ip);
    return res.status(200).json({
        success: true,
        message: "Si l'email existe, un lien de réinitialisation a été envoyé."
    });
});
exports.resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: "Token et nouveau mot de passe requis" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
        const userId = decoded.id;
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        const { error } = await supabase_1.supabase
            .from("utilisateur")
            .update({ mot_de_passe: hashedPassword })
            .eq("id", userId);
        if (error) {
            return next((0, errorHandler_1.createError)("Erreur lors de la réinitialisation du mot de passe", 500));
        }
        await (0, auditService_1.logAudit)(userId, "", 'RESET_PASSWORD', 'Auth', userId, 'Mot de passe réinitialisé via token', req.ip);
        res.status(200).json({
            success: true,
            message: "Mot de passe réinitialisé avec succès."
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw (0, errorHandler_1.createError)("Token invalide ou expiré", 400);
        }
        throw error;
    }
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!req.user) {
        throw (0, errorHandler_1.createError)("Utilisateur non authentifié", 401);
    }
    const { data: user, error } = await supabase_1.supabase
        .from("utilisateur")
        .select("mot_de_passe")
        .eq("id", req.user.id)
        .single();
    if (error || !user) {
        throw (0, errorHandler_1.createError)("Utilisateur non trouvé", 404);
    }
    const isValidPassword = await bcryptjs_1.default.compare(oldPassword, user.mot_de_passe);
    if (!isValidPassword) {
        throw (0, errorHandler_1.createError)("Ancien mot de passe incorrect", 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    const { error: updateError } = await supabase_1.supabase
        .from("utilisateur")
        .update({ mot_de_passe: hashedPassword })
        .eq("id", req.user.id);
    if (updateError) {
        throw (0, errorHandler_1.createError)("Erreur lors du changement de mot de passe", 500);
    }
    await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'CHANGE_PASSWORD', 'Auth', req.user.id, 'Mot de passe changé', req.ip);
    res.status(200).json({
        success: true,
        message: "Mot de passe changé avec succès."
    });
});
//# sourceMappingURL=authController.js.map