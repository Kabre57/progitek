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

// Routes
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
const PORT = config.server.port || 3000;

// ✅ Créer le dossier de logs s'il n'existe pas
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ✅ Configuration CORS unique
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.1.95:5173',
    'http://100.127.74.69:5173',
    'https://frontend.taile0fd44.ts.net',
    'https://progitek.vercel.app',
    `https://${config.server.domain}`,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// ✅ Sécurité (CSP pour Swagger + GA)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://www.googletagmanager.com",
        "https://translate.googleapis.com",
        "blob:"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://translate.googleapis.com",
        "https://www.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        "https://pblserver.taile0fd44.ts.net",
        "https://www.google-analytics.com",
        "https://translate.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://www.google-analytics.com",
        "https://swagger.io"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
}));

// ✅ Appliquer CORS avant tout
app.use(cors(corsOptions));

// ✅ Logger
app.use(morgan('combined', {
  stream: fs.createWriteStream(config.logging.file, { flags: 'a' })
}));
app.use(morgan('dev'));

// ✅ Parsing JSON & URL Encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Limitation des requêtes
app.use(rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ✅ Swagger documentation
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
        url: `https://${config.server.domain}`,
        description: 'Serveur sécurisé (Tailscale)',
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Serveur local de développement',
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
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Progitek System API Documentation',
}));

// ✅ Routes santé & info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Serveur en fonctionnement',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.nodeEnv,
  });
});


app.get('/api/info', (req, res) => {
  res.json({
    name: 'Progitek System API',
    version: '1.0.0',
    description: 'API RESTful pour la gestion technique',
    environment: config.server.nodeEnv,
    documentation: '/api-docs',
  });
});

// ✅ Routes API
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

// ✅ Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// ✅ Arrêt propre
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, arrêt gracieux du serveur...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('🛑 SIGINT reçu, arrêt gracieux du serveur...');
  process.exit(0);
});

// ✅ Démarrage serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ================================');
  console.log(`🚀 Progitek System API démarré`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Environnement: ${config.server.nodeEnv}`);
  console.log(`🚀 Documentation: https://${config.server.domain}/api-docs`);
  console.log(`🚀 Health Check: https://${config.server.domain}/health`);
  console.log(`🚀 CORS autorisé pour: ${corsOptions.origin}`);
  console.log('🚀 ================================');
});

export default app;
