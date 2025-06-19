"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.transaction = exports.query = exports.connectDatabase = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'progitek_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};
exports.pool = new pg_1.Pool(poolConfig);
const connectDatabase = async () => {
    try {
        const client = await exports.pool.connect();
        console.log('✅ Connexion PostgreSQL établie');
        const result = await client.query('SELECT NOW()');
        console.log('🕒 Heure de la base de données:', result.rows[0].now);
        client.release();
    }
    catch (error) {
        console.error('❌ Erreur de connexion à PostgreSQL:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await exports.pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Requête exécutée:', { text, duration, rows: result.rowCount });
        }
        return result;
    }
    catch (error) {
        console.error('❌ Erreur de requête:', error);
        throw error;
    }
};
exports.query = query;
const transaction = async (callback) => {
    const client = await exports.pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.transaction = transaction;
const closeDatabase = async () => {
    await exports.pool.end();
    console.log('🔒 Connexion à la base de données fermée');
};
exports.closeDatabase = closeDatabase;
process.on('SIGINT', async () => {
    await (0, exports.closeDatabase)();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await (0, exports.closeDatabase)();
    process.exit(0);
});
//# sourceMappingURL=database.js.map