import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';

import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { clientRouter } from './routes/clients';
import { technicienRouter } from './routes/techniciens';
import { missionRouter } from './routes/missions';
import { interventionRouter } from './routes/interventions';
import { reportRouter } from './routes/reports';
import { auditRouter } from './routes/audit';
import { notificationRouter } from './routes/notifications';
import { dashboardRouter } from './routes/dashboard';
import { specialiteRouter } from './routes/specialites';
import { roleRouter } from './routes/roles';
import { devisRouter } from './routes/devis';
import { factureRouter } from './routes/factures';
import { documentRouter } from './routes/documents';
import { messageRouter } from './routes/messages';
import { rapportRouter } from './routes/rapports';

const app = express();
const PORT = config.server.port || 3001;

// Create logs directory if it doesn't exist
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// CORS Configuration - CORRECTION DU PROBLÈME
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.1.85:5173',        // accès local si nécessaire
    'http://100.127.74.69:5173',        // ← ✅ IP Tailscale de ton frontend à la maison
    'https://progitek.vercel.app',         // ← optionnel si tu as un domaine
    'http://frontend.taile0fd44.ts.net' // ← si tu accèdes via nom Tailscale
  ],
  credentials: true, // ✅ très important si tu utilises un token JWT ou des cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};


// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Progitek System API',
      version: '1.0.0',
      description: 'API RESTful complète pour la gestion technique avec TypeScript, Express et Prisma',
      contact: {
        name: 'Progitek System',
        email: config.email.fromEmail,
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware - ORDRE IMPORTANT POUR CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS doit être appliqué AVANT les autres middlewares
app.use(cors(corsOptions));

// Middleware de logging
app.use(morgan('combined', {
  stream: fs.createWriteStream(config.logging.file, { flags: 'a' })
}));

app.use(morgan('dev')); // Console logging

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting APRÈS CORS
app.use(limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Progitek System API Documentation',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Serveur en fonctionnement',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.nodeEnv,
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Progitek System API',
    version: '1.0.0',
    description: 'API RESTful pour la gestion technique',
    environment: config.server.nodeEnv,
    documentation: '/api-docs',
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/clients', clientRouter);
app.use('/api/techniciens', technicienRouter);
app.use('/api/missions', missionRouter);
app.use('/api/interventions', interventionRouter);
app.use('/api/reports', reportRouter);
app.use('/api/audit', auditRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/specialites', specialiteRouter);
app.use('/api/roles', roleRouter);
app.use('/api/devis', devisRouter);
app.use('/api/factures', factureRouter);
app.use('/api/documents', documentRouter);
app.use('/api/messages', messageRouter);
app.use('/api/rapports', rapportRouter);

// Legacy routes (for backward compatibility)
app.use('/api/techniciens', technicienRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, arrêt gracieux du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT reçu, arrêt gracieux du serveur...');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ================================');
  console.log(`🚀 Progitek System API démarré`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Environnement: ${config.server.nodeEnv}`);
  console.log(`🚀 Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
  console.log(`🚀 CORS autorisé pour: ${corsOptions.origin}`);
  console.log('🚀 ================================');
});

export default app;