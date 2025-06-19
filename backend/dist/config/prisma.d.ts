import { PrismaClient as PrismaClientOriginal } from '@prisma/client';
declare class PrismaClient extends PrismaClientOriginal {
}
declare global {
    var __prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient;
export declare const connectPrisma: () => Promise<void>;
export declare const disconnectPrisma: () => Promise<void>;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map