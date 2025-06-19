"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeOwnerOrAdmin = exports.authorizeRoles = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../config/supabase");
const errorHandler_1 = require("./errorHandler");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return next((0, errorHandler_1.createError)("Token d'accès requis", 401));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
        const { data: user, error } = await supabase_1.supabase
            .from('utilisateur')
            .select('id, email, status, role:role_id(libelle)')
            .eq('id', decoded.id)
            .single();
        if (error || !user) {
            return next((0, errorHandler_1.createError)("Utilisateur non trouvé", 401));
        }
        if (user.status !== 'active') {
            return next((0, errorHandler_1.createError)('Compte désactivé', 401));
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role && user.role.length > 0 ? user.role[0].libelle : 'utilisateur'
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
        next(error);
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Permissions insuffisantes'
            });
        }
        return next();
    };
};
exports.requireRole = requireRole;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Permissions insuffisantes'
            });
        }
        return next();
    };
};
exports.authorizeRoles = authorizeRoles;
const authorizeOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentification requise'
        });
    }
    const userId = parseInt(req.params.id);
    if (req.user.role === 'Administrator' || req.user.id === userId) {
        return next();
    }
    else {
        return res.status(403).json({
            success: false,
            message: 'Permissions insuffisantes'
        });
    }
};
exports.authorizeOwnerOrAdmin = authorizeOwnerOrAdmin;
//# sourceMappingURL=auth.js.map