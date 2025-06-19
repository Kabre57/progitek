"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interventionController_1 = require("../controllers/interventionController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const intervention_1 = require("../validations/intervention");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', interventionController_1.getInterventions);
router.get('/:id', interventionController_1.getInterventionById);
router.post('/', (0, validation_1.validateBody)(intervention_1.createInterventionSchema), interventionController_1.createIntervention);
router.put('/:id', (0, validation_1.validateBody)(intervention_1.updateInterventionSchema), interventionController_1.updateIntervention);
router.delete('/:id', (0, auth_1.authorizeRoles)('Administrator'), interventionController_1.deleteIntervention);
exports.default = router;
//# sourceMappingURL=interventions.js.map