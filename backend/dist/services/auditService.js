"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditStats = exports.getRecentActivities = exports.getAuditLogs = exports.logAudit = exports.logActivity = void 0;
const supabase_1 = require("../config/supabase");
const logActivity = async (userId, ipAddress, browser) => {
    try {
        await supabase_1.supabase
            .from('activity_log')
            .insert({
            user_id: userId,
            ip: ipAddress,
            browser,
            login_time: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Erreur lors du logging d\'activité:', error);
    }
};
exports.logActivity = logActivity;
const logAudit = async (userId, username, actionType, entityType, entityId, details, ipAddress) => {
    try {
        await supabase_1.supabase
            .from('audit_logs')
            .insert({
            user_id: userId,
            username,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            details,
            ip_address: ipAddress || '',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Erreur lors du logging d\'audit:', error);
    }
};
exports.logAudit = logAudit;
const getAuditLogs = async (page = 1, limit = 50, filters) => {
    const offset = (page - 1) * limit;
    let query = supabase_1.supabase
        .from('audit_logs')
        .select(`
      *,
      user:user_id (
        nom,
        prenom,
        email
      )
    `)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);
    if (filters) {
        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }
        if (filters.actionType) {
            query = query.eq('action_type', filters.actionType);
        }
        if (filters.entityType) {
            query = query.eq('entity_type', filters.entityType);
        }
        if (filters.startDate) {
            query = query.gte('timestamp', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('timestamp', filters.endDate);
        }
    }
    const { data: logs, error } = await query;
    if (error) {
        throw error;
    }
    const { count, error: countError } = await supabase_1.supabase.from("audit_logs").select("count", { count: "exact" });
    if (countError) {
        throw countError;
    }
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
};
exports.getAuditLogs = getAuditLogs;
const getRecentActivities = async (limit = 10) => {
    const { data: activities, error } = await supabase_1.supabase
        .from('activity_log')
        .select(`
      *,
      user:user_id (
        nom,
        prenom,
        email
      )
    `)
        .order('login_time', { ascending: false })
        .limit(limit);
    if (error) {
        throw error;
    }
    return activities;
};
exports.getRecentActivities = getRecentActivities;
const getAuditStats = async () => {
    const { data: actionStats, error: actionError } = await supabase_1.supabase
        .from("audit_logs")
        .select("action_type, count")
        .order("count", { ascending: false });
    if (actionError) {
        throw actionError;
    }
    const { data: dailyActivity, error: dailyError } = await supabase_1.supabase
        .rpc('get_daily_activity', { days_back: 7 });
    if (dailyError) {
        throw dailyError;
    }
    const { data: topUsers, error: usersError } = await supabase_1.supabase
        .from('audit_logs')
        .select('user_id, count')
        .order('count', { ascending: false })
        .limit(10);
    if (usersError) {
        throw usersError;
    }
    const userIds = topUsers.map(u => u.user_id).filter(Boolean);
    const { data: users, error: userDetailsError } = await supabase_1.supabase
        .from('utilisateur')
        .select('id, nom, prenom, email')
        .in('id', userIds);
    if (userDetailsError) {
        throw userDetailsError;
    }
    const enrichedTopUsers = topUsers.map(stat => {
        const user = users.find(u => u.id === stat.user_id);
        return {
            ...stat,
            user
        };
    });
    return {
        actionStats: actionStats.map(stat => ({
            action_type: stat.action_type,
            count: stat.count
        })),
        dailyActivity: dailyActivity || [],
        topUsers: enrichedTopUsers
    };
};
exports.getAuditStats = getAuditStats;
//# sourceMappingURL=auditService.js.map