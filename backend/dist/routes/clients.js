"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_1 = require("../controllers/clientController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const client_1 = require("../validations/client");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', clientController_1.getClients);
router.get('/:id', clientController_1.getClientById);
router.post('/', (0, validation_1.validateBody)(client_1.createClientSchema), clientController_1.createClient);
router.put('/:id', (0, validation_1.validateBody)(client_1.updateClientSchema), clientController_1.updateClient);
router.delete('/:id', (0, auth_1.authorizeRoles)('Administrator'), clientController_1.deleteClient);
exports.default = router;
//# sourceMappingURL=clients.js.map