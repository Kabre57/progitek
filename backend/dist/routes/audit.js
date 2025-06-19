"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditController_1 = require("../controllers/auditController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use((0, auth_1.authorizeRoles)('Administrator'));
router.get('/logs', auditController_1.getAuditLogsController);
router.get('/stats', auditController_1.getAuditStatsController);
exports.default = router;
//# sourceMappingURL=audit.js.map