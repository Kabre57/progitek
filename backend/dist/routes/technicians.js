"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const technicianController_1 = require("../controllers/technicianController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const technician_1 = require("../validations/technician");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/specialites', technicianController_1.getSpecialites);
router.get('/', technicianController_1.getTechnicians);
router.get('/:id', technicianController_1.getTechnicianById);
router.post('/', (0, validation_1.validateBody)(technician_1.createTechnicianSchema), technicianController_1.createTechnician);
router.put('/:id', (0, validation_1.validateBody)(technician_1.updateTechnicianSchema), technicianController_1.updateTechnician);
router.delete('/:id', (0, auth_1.authorizeRoles)('Administrator'), technicianController_1.deleteTechnician);
exports.default = router;
//# sourceMappingURL=technicians.js.map