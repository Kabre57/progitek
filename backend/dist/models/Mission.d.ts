import { Client } from './Client';
export interface Mission {
    num_intervention: number;
    nature_intervention?: string | null;
    objectif_du_contrat?: string | null;
    description?: string | null;
    date_sortie_fiche_intervention?: Date | null;
    client_id?: number | null;
}
export interface MissionWithClient extends Mission {
    client?: Client;
}
export interface CreateMissionRequest {
    nature_intervention: string;
    objectif_du_contrat?: string;
    description?: string;
    date_sortie_fiche_intervention?: string;
    client_id: number;
}
export interface UpdateMissionRequest {
    nature_intervention?: string;
    objectif_du_contrat?: string;
    description?: string;
    date_sortie_fiche_intervention?: string;
    client_id?: number;
}
export interface MissionsListResponse {
    success: boolean;
    data: {
        missions: MissionWithClient[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
//# sourceMappingURL=Mission.d.ts.map