"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditStatsController = exports.getAuditLogsController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
exports.getAuditLogsController = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filters = {
        userId: req.query.userId ? parseInt(req.query.userId) : undefined,
        actionType: req.query.actionType,
        entityType: req.query.entityType,
        startDate: req.query.startDate,
        endDate: req.query.endDate
    };
    const result = await (0, auditService_1.getAuditLogs)(page, limit, filters);
    res.status(200).json({
        success: true,
        data: result
    });
});
exports.getAuditStatsController = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stats = await (0, auditService_1.getAuditStats)();
    res.status(200).json({
        success: true,
        data: stats
    });
});
//# sourceMappingURL=auditController.js.map