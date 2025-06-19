"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const missionController_1 = require("../controllers/missionController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const mission_1 = require("../validations/mission");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', missionController_1.getMissions);
router.get('/:id', missionController_1.getMissionById);
router.post('/', (0, validation_1.validateBody)(mission_1.createMissionSchema), missionController_1.createMission);
router.put('/:id', (0, validation_1.validateBody)(mission_1.updateMissionSchema), missionController_1.updateMission);
router.delete('/:id', (0, auth_1.authorizeRoles)('Administrator'), missionController_1.deleteMission);
exports.default = router;
//# sourceMappingURL=missions.js.map