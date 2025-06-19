"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = exports.generateReport = exports.getReports = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
exports.getReports = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    if (type) {
        whereClause = 'WHERE report_type = $1';
        params.push(type);
        paramIndex++;
    }
    const dataQuery = `
    SELECT 
      r.id, r.report_type, r.created_at, r.user_id,
      u.nom, u.prenom, u.email
    FROM reports r
    LEFT JOIN utilisateur u ON r.user_id = u.id
    ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
    params.push(limit, offset);
    const countQuery = `SELECT COUNT(*) as total FROM reports ${whereClause}`;
    const countParams = params.slice(0, -2);
    const [dataResult, countResult] = await Promise.all([
        (0, database_1.query)(dataQuery, params),
        (0, database_1.query)(countQuery, countParams)
    ]);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
        success: true,
        data: {
            reports: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        }
    });
});
exports.generateReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Utilisateur non authentifié', 401);
    }
    const { report_type, start_date, end_date } = req.body;
    const reportResult = await (0, database_1.query)(`
    INSERT INTO reports (report_type, user_id)
    VALUES ($1, $2)
    RETURNING *
  `, [report_type, req.user.id]);
    const report = reportResult.rows[0];
    let reportData;
    switch (report_type) {
        case 'activity':
            reportData = await generateActivityReport(start_date, end_date);
            break;
        case 'interventions':
            reportData = await generateInterventionsReport(start_date, end_date);
            break;
        case 'clients':
            reportData = await generateClientsReport(start_date, end_date);
            break;
        case 'technicians':
            reportData = await generateTechniciansReport(start_date, end_date);
            break;
        case 'performance':
            reportData = await generatePerformanceReport(start_date, end_date);
            break;
        default:
            throw (0, errorHandler_1.createError)('Type de rapport invalide', 400);
    }
    await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'CREATE', 'Report', report.id, `Génération d'un rapport: ${report_type}`, req.ip);
    res.status(201).json({
        success: true,
        message: 'Rapport généré avec succès',
        data: {
            report,
            data: reportData
        }
    });
});
exports.getDashboardData = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const [usersCount, clientsCount, techniciansCount, missionsCount, interventionsCount, activeInterventions, recentActivity] = await Promise.all([
        (0, database_1.query)('SELECT COUNT(*) as count FROM utilisateur'),
        (0, database_1.query)('SELECT COUNT(*) as count FROM client'),
        (0, database_1.query)('SELECT COUNT(*) as count FROM technicien'),
        (0, database_1.query)('SELECT COUNT(*) as count FROM mission'),
        (0, database_1.query)('SELECT COUNT(*) as count FROM intervention'),
        (0, database_1.query)('SELECT COUNT(*) as count FROM intervention WHERE date_heure_fin IS NULL'),
        (0, database_1.query)(`
      SELECT 
        al.login_time,
        u.nom,
        u.prenom
      FROM activity_log al
      JOIN utilisateur u ON al.user_id = u.id
      ORDER BY al.login_time DESC
      LIMIT 10
    `)
    ]);
    const stats = {
        totalUsers: parseInt(usersCount.rows[0].count),
        totalClients: parseInt(clientsCount.rows[0].count),
        totalTechnicians: parseInt(techniciansCount.rows[0].count),
        totalMissions: parseInt(missionsCount.rows[0].count),
        totalInterventions: parseInt(interventionsCount.rows[0].count),
        activeInterventions: parseInt(activeInterventions.rows[0].count),
        recentActivity: recentActivity.rows
    };
    res.status(200).json({
        success: true,
        data: stats
    });
});
const generateActivityReport = async (startDate, endDate) => {
    let whereClause = '';
    const params = [];
    if (startDate && endDate) {
        whereClause = 'WHERE timestamp BETWEEN $1 AND $2';
        params.push(startDate, endDate);
    }
    const result = await (0, database_1.query)(`
    SELECT 
      action_type,
      entity_type,
      COUNT(*) as count,
      DATE(timestamp) as date
    FROM audit_logs
    ${whereClause}
    GROUP BY action_type, entity_type, DATE(timestamp)
    ORDER BY date DESC
  `, params);
    return result.rows;
};
const generateInterventionsReport = async (startDate, endDate) => {
    let whereClause = '';
    const params = [];
    if (startDate && endDate) {
        whereClause = 'WHERE i.date_heure_debut BETWEEN $1 AND $2';
        params.push(startDate, endDate);
    }
    const result = await (0, database_1.query)(`
    SELECT 
      i.id,
      i.date_heure_debut,
      i.date_heure_fin,
      i.duree,
      m.nature_intervention,
      c.nom as client_nom,
      t.nom as technicien_nom,
      t.prenom as technicien_prenom
    FROM intervention i
    LEFT JOIN mission m ON i.mission_id = m.num_intervention
    LEFT JOIN client c ON m.client_id = c.id
    LEFT JOIN technicien t ON i.technicien_id = t.id
    ${whereClause}
    ORDER BY i.date_heure_debut DESC
  `, params);
    return result.rows;
};
const generateClientsReport = async (startDate, endDate) => {
    let whereClause = '';
    const params = [];
    if (startDate && endDate) {
        whereClause = 'WHERE date_d_inscription BETWEEN $1 AND $2';
        params.push(startDate, endDate);
    }
    const result = await (0, database_1.query)(`
    SELECT 
      c.*,
      COUNT(m.num_intervention) as total_missions
    FROM client c
    LEFT JOIN mission m ON c.id = m.client_id
    ${whereClause}
    GROUP BY c.id
    ORDER BY c.date_d_inscription DESC
  `, params);
    return result.rows;
};
const generateTechniciansReport = async (startDate, endDate) => {
    const result = await (0, database_1.query)(`
    SELECT 
      t.*,
      s.libelle as specialite,
      COUNT(i.id) as total_interventions,
      AVG(i.duree) as avg_duration
    FROM technicien t
    LEFT JOIN specialite s ON t.specialite_id = s.id
    LEFT JOIN intervention i ON t.id = i.technicien_id
    GROUP BY t.id, s.libelle
    ORDER BY total_interventions DESC
  `);
    return result.rows;
};
const generatePerformanceReport = async (startDate, endDate) => {
    const [interventionStats, missionStats, clientStats] = await Promise.all([
        (0, database_1.query)(`
      SELECT 
        DATE_TRUNC('month', date_heure_debut) as month,
        COUNT(*) as total_interventions,
        AVG(duree) as avg_duration
      FROM intervention
      WHERE date_heure_debut IS NOT NULL
      GROUP BY DATE_TRUNC('month', date_heure_debut)
      ORDER BY month DESC
      LIMIT 12
    `),
        (0, database_1.query)(`
      SELECT 
        DATE_TRUNC('month', date_sortie_fiche_intervention) as month,
        COUNT(*) as total_missions
      FROM mission
      WHERE date_sortie_fiche_intervention IS NOT NULL
      GROUP BY DATE_TRUNC('month', date_sortie_fiche_intervention)
      ORDER BY month DESC
      LIMIT 12
    `),
        (0, database_1.query)(`
      SELECT 
        DATE_TRUNC('month', date_d_inscription) as month,
        COUNT(*) as new_clients
      FROM client
      GROUP BY DATE_TRUNC('month', date_d_inscription)
      ORDER BY month DESC
      LIMIT 12
    `)
    ]);
    return {
        interventions: interventionStats.rows,
        missions: missionStats.rows,
        clients: clientStats.rows
    };
};
//# sourceMappingURL=reportController.js.map