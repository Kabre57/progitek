"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const report_1 = require("../validations/report");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', reportController_1.getReports);
router.post('/generate', (0, validation_1.validateBody)(report_1.generateReportSchema), reportController_1.generateReport);
exports.default = router;
//# sourceMappingURL=reports.js.map