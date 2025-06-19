export interface Report {
  id: number;
  report_type: string;
  created_at: Date;
  user_id?: number | null;
}

export interface GenerateReportRequest {
  report_type: 'activity' | 'interventions' | 'clients' | 'technicians' | 'performance';
  start_date?: string;
  end_date?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalTechnicians: number;
  totalMissions: number;
  totalInterventions: number;
  activeInterventions: number;
  recentActivity: any[];
}