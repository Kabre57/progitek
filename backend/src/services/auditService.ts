import { prisma } from '../config/database';

interface AuditLogData {
  userId?: number;
  username?: string;
  actionType: string;
  entityType: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
}

export const auditService = {
  async logAction(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLogs.create({
        data: {
          userId: data.userId,
          username: data.username,
          actionType: data.actionType,
          entityType: data.entityType,
          entityId: data.entityId,
          details: data.details,
          ipAddress: data.ipAddress,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw error to avoid breaking main functionality
    }
  },

  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    userId?: number;
    actionType?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, limit = 10, userId, actionType, entityType, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (userId) where.userId = userId;
    if (actionType) where.actionType = actionType;
    if (entityType) where.entityType = entityType;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLogs.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { nom: true, prenom: true, email: true },
          },
        },
      }),
      prisma.auditLogs.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAuditStats() {
    const [
      totalLogs,
      actionTypeStats,
      entityTypeStats,
      recentActivity,
      topUsers,
    ] = await Promise.all([
      prisma.auditLogs.count(),
      prisma.auditLogs.groupBy({
        by: ['actionType'],
        _count: { actionType: true },
        orderBy: { _count: { actionType: 'desc' } },
      }),
      prisma.auditLogs.groupBy({
        by: ['entityType'],
        _count: { entityType: true },
        orderBy: { _count: { entityType: 'desc' } },
      }),
      prisma.auditLogs.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { nom: true, prenom: true },
          },
        },
      }),
      prisma.auditLogs.groupBy({
        by: ['userId'],
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      totalLogs,
      actionTypeStats: actionTypeStats.map(stat => ({
        actionType: stat.actionType,
        count: stat._count.actionType,
      })),
      entityTypeStats: entityTypeStats.map(stat => ({
        entityType: stat.entityType,
        count: stat._count.entityType,
      })),
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        action: activity.actionType,
        entity: activity.entityType,
        user: activity.user ? `${activity.user.nom} ${activity.user.prenom}` : 'Système',
        timestamp: activity.timestamp,
        details: activity.details,
      })),
      topUsers,
    };
  },
};