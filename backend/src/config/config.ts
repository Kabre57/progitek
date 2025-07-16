import dotenv from 'dotenv';
dotenv.config();

export const config = {
  server: {
    port: 3000,
    nodeEnv: process.env.NODE_ENV || 'production',
    domain: process.env.SERVER_DOMAIN || 'pblserver.taile0fd44.ts.net',
  },

  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,https://progitek.vercel.app')
      .split(',')
      .map(origin => origin.trim()),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || 'theogeoffroy@gmail.com',
    pass: process.env.SMTP_PASS || 'Kwt0001',
    fromEmail: process.env.FROM_EMAIL || 'theogeoffroy@gmail.com',
    fromName: process.env.FROM_NAME || 'Progitek System',
  },

  logging: {
    file: process.env.LOG_FILE || './logs/app.log',
  },
};
