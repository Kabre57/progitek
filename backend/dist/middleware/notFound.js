"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} non trouvée`,
        error: 'Not Found'
    });
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map