"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const user_1 = require("../validations/user");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/roles', userController_1.getRoles);
router.get('/', (0, validation_1.validateRequest)(user_1.getUsersQuerySchema), userController_1.getUsers);
router.get('/:id', userController_1.getUserById);
router.post('/', (0, auth_1.authorizeRoles)('Administrator'), (0, validation_1.validateRequest)(user_1.createUserSchema), userController_1.createUser);
router.put('/:id', auth_1.authorizeOwnerOrAdmin, (0, validation_1.validateRequest)(user_1.updateUserSchema), userController_1.updateUser);
router.delete('/:id', (0, auth_1.authorizeRoles)('Administrator'), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.js.map