import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '9d8bdd2670420cb110ec8e1ce780beed77e85600276b0ce1d8d0110c0ba3ba59',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'b45709e2b9b84c188f19ed6c265f8a55a7d4a22f7d382ea2675fdfb2e1f60d45',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || 'theogeoffroy5@gmail.com',
    pass: process.env.SMTP_PASS || 'uitjnlfdvecgsejq',
    fromEmail: process.env.FROM_EMAIL || 'theogeoffroy5@gmail.com',
    fromName: process.env.FROM_NAME || 'Progiteck System',
  },
  logging: {
    file: process.env.LOG_FILE || './logs/app.log',
  },
};