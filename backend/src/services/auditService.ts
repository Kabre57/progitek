import { supabase } from '../config/supabase';

// Logger une activité de connexion
export const logActivity = async (
  userId: number,
  ipAddress: string,
  browser: string
): Promise<void> => {
  try {
    await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        ip: ipAddress,
        browser,
        login_time: new Date().toISOString()
      });
  } catch (error) {
    console.error('Erreur lors du logging d\'activité:', error);
  }
};

// Logger un événement d'audit
export const logAudit = async (
  userId: number,
  username: string,
  actionType: string,
  entityType: string,
  entityId: number,
  details: string,
  ipAddress?: string
): Promise<void> => {
  try {
    await supabase
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
  } catch (error) {
    console.error('Erreur lors du logging d\'audit:', error);
  }
};

// Récupérer les logs d'audit avec pagination
export const getAuditLogs = async (
  page: number = 1,
  limit: number = 50,
  filters?: {
    userId?: number;
    actionType?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const offset = (page - 1) * limit;
  
  let query = supabase
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

  // Get total count
  const { count, error: countError } = await supabase.from("audit_logs").select("count", { count: "exact" });

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

// Récupérer les activités récentes
export const getRecentActivities = async (limit: number = 10) => {
  const { data: activities, error } = await supabase
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

// Statistiques d'audit
export const getAuditStats = async () => {
  // Total des événements par type d'action
  const { data: actionStats, error: actionError } = await supabase
    .from("audit_logs")
    .select("action_type, count")
    .order("count", { ascending: false });

  if (actionError) {
    throw actionError;
  }

  // Activité par jour (7 derniers jours)
  const { data: dailyActivity, error: dailyError } = await supabase
    .rpc('get_daily_activity', { days_back: 7 });

  if (dailyError) {
    throw dailyError;
  }

  // Utilisateurs les plus actifs
  const { data: topUsers, error: usersError } = await supabase
    .from('audit_logs')
    .select('user_id, count')
    .order('count', { ascending: false })
    .limit(10);

  if (usersError) {
    throw usersError;
  }

  // Enrichir les données des utilisateurs les plus actifs
  const userIds = topUsers.map(u => u.user_id).filter(Boolean);
  const { data: users, error: userDetailsError } = await supabase
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