export interface ValidationInstance {
  id: number;
  entity_type: string;
  entity_id: number;
  status: string;
  requested_by_user_id?: number | null;
  assigned_validator_id?: number | null;
  validated_by_user_id?: number | null;
  comments?: string | null;
  submitted_at: Date;
  validated_at?: Date | null;
}

export interface CreateValidationRequest {
  entity_type: string;
  entity_id: number;
  assigned_validator_id?: number;
  comments?: string;
}

export interface UpdateValidationRequest {
  status?: string;
  assigned_validator_id?: number;
  validated_by_user_id?: number;
  comments?: string;
}