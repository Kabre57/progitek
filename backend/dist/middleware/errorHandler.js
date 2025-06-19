"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Erreur interne du serveur';
    if (error.name === 'ZodError') {
        statusCode = 400;
        message = 'Données de validation invalides';
    }
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token invalide';
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expiré';
    }
    if (error.name === 'DatabaseError') {
        statusCode = 500;
        message = 'Erreur de base de données';
    }
    if (error.message?.includes('duplicate key value')) {
        statusCode = 409;
        message = 'Cette ressource existe déjà';
    }
    if (error.message?.includes('foreign key constraint')) {
        statusCode = 400;
        message = 'Référence invalide vers une ressource inexistante';
    }
    if (process.env.NODE_ENV === 'development') {
        console.error('🚨 Erreur capturée:', {
            message: error.message,
            stack: error.stack,
            statusCode,
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query
        });
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            error: error.message,
            stack: error.stack
        })
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map