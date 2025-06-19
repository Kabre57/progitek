export declare const logActivity: (userId: number, ipAddress: string, browser: string) => Promise<void>;
export declare const logAudit: (userId: number, username: string, actionType: string, entityType: string, entityId: number, details: string, ipAddress?: string) => Promise<void>;
export declare const getAuditLogs: (page?: number, limit?: number, filters?: {
    userId?: number;
    actionType?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
}) => Promise<{
    logs: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getRecentActivities: (limit?: number) => Promise<any[]>;
export declare const getAuditStats: () => Promise<{
    actionStats: {
        action_type: any;
        count: number;
    }[];
    dailyActivity: any;
    topUsers: {
        user: {
            id: any;
            nom: any;
            prenom: any;
            email: any;
        } | undefined;
        user_id: any;
        count: number;
    }[];
}>;
//# sourceMappingURL=auditService.d.ts.map