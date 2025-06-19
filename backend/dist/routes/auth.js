"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const auth_2 = require("../validations/auth");
const router = (0, express_1.Router)();
router.post('/login', (0, validation_1.validateRequest)(auth_2.loginSchema), authController_1.login);
router.post('/forgot-password', (0, validation_1.validateRequest)(auth_2.forgotPasswordSchema), authController_1.forgotPassword);
router.post('/reset-password', (0, validation_1.validateRequest)(auth_2.resetPasswordSchema), authController_1.resetPassword);
router.get("/me", auth_1.authenticateToken, authController_1.getMe);
router.post('/change-password', auth_1.authenticateToken, (0, validation_1.validateRequest)(auth_2.changePasswordSchema), authController_1.changePassword);
router.post('/logout', auth_1.authenticateToken, authController_1.logout);
router.post('/register', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('Administrator'), (0, validation_1.validateRequest)(auth_2.registerSchema), authController_1.register);
exports.default = router;
//# sourceMappingURL=auth.js.map