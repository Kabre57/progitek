"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const supabase_1 = require("./config/supabase");
const swagger_1 = require("./config/swagger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const clients_1 = __importDefault(require("./routes/clients"));
const technicians_1 = __importDefault(require("./routes/technicians"));
const missions_1 = __importDefault(require("./routes/missions"));
const interventions_1 = __importDefault(require("./routes/interventions"));
const reports_1 = __importDefault(require("./routes/reports"));
const audit_1 = __importDefault(require("./routes/audit"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const swaggerSpec = (0, swagger_jsdoc_1.default)(swagger_1.swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/users', users_1.default);
app.use('/api/v1/clients', clients_1.default);
app.use('/api/v1/technicians', technicians_1.default);
app.use('/api/v1/missions', missions_1.default);
app.use('/api/v1/interventions', interventions_1.default);
app.use('/api/v1/reports', reports_1.default);
app.use('/api/v1/audit', audit_1.default);
app.use('/api/v1/notifications', notifications_1.default);
app.use('/api/v1/dashboard', dashboard_1.default);
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, supabase_1.testConnection)();
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Erreur de démarrage du serveur:', error);
        process.exit(1);
    }
};
startServer();
process.on('SIGINT', () => {
    console.log('\n🔄 Arrêt du serveur...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n🔄 Arrêt du serveur...');
    process.exit(0);
});
//# sourceMappingURL=server.js.map