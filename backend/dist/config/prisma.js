"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPrisma = exports.connectPrisma = exports.prisma = void 0;
const client_1 = require("@prisma/client");
class PrismaClient extends client_1.PrismaClient {
}
exports.prisma = globalThis.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
});
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = exports.prisma;
}
const connectPrisma = async () => {
    try {
        await exports.prisma.$connect();
        console.log('✅ Prisma connecté à la base de données');
    }
    catch (error) {
        console.error('❌ Erreur de connexion Prisma:', error);
        throw error;
    }
};
exports.connectPrisma = connectPrisma;
const disconnectPrisma = async () => {
    await exports.prisma.$disconnect();
    console.log('🔒 Prisma déconnecté');
};
exports.disconnectPrisma = disconnectPrisma;
process.on('SIGINT', async () => {
    await (0, exports.disconnectPrisma)();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await (0, exports.disconnectPrisma)();
    process.exit(0);
});
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map