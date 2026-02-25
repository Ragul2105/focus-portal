// ─── Backend API Types ────────────────────────────────────────────────────────
// All types match actual backend response shapes (PostgreSQL snake_case).

// ─── Auth / User ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  roles: string[]; // e.g. ['STAFF'] | ['HOD'] | ['PRINCIPAL']
}

// ─── Activity Taxonomy ────────────────────────────────────────────────────────

export interface ActivityCategory {
  id: number;
  code: string;
  name: string;
  requires_detail: boolean;
  allows_free_text: boolean;
}

export interface ActivityDetail {
  id: string;
  category_id: number;
  code: string;
  name: string;
  is_active: boolean;
}

// ─── Registrations ────────────────────────────────────────────────────────────

export type RegistrationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'GRANT_ID_ISSUED'
  | 'COMPLETED'
  | 'REJECTED';

export interface RegistrationFile {
  id: string;
  registration_id: string;
  file_type: 'APPLICATION_FORM' | 'CONFIRMATION_FORM';
  s3_key: string;
  file_name: string;
  content_type?: string;
  size_bytes?: number;
  uploaded_at: string;
}

export interface Registration {
  id: string;
  reg_id: string;
  user_id: string;
  user_name?: string;
  user_dept?: string;
  applied_as: 'INDIVIDUAL' | 'TEAM';
  team_count?: number;
  funding_agency: 'GOV' | 'NON_GOV';
  funds_from: 'NATIONAL' | 'INTERNATIONAL';
  activity_category_id: number;
  category_code?: string;
  category_name?: string;
  activity_detail_id?: string;
  detail_code?: string;
  detail_name?: string;
  activity_detail_text?: string;
  fund_inr?: number;
  fund_usd?: number;
  application_number?: string;
  applied_date: string;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
  files?: RegistrationFile[];
}

// ─── Grant IDs ────────────────────────────────────────────────────────────────

export interface GrantId {
  id: string;
  grant_id: string;
  registration_id: string;
  reg_id?: string;
  request_no: string;
  scheme_code: string;
  amount_granted_inr?: number;
  amount_granted_usd?: number;
  generated_by: string;
  generated_at: string;
  category_name?: string;
  detail_name?: string;
  user_name?: string;
}

// ─── Grant Requests ───────────────────────────────────────────────────────────

export type GrantRequestStatus = 'PENDING' | 'HOD_APPROVED' | 'APPROVED' | 'REJECTED';

export interface RequestFile {
  id: string;
  grant_request_id: string;
  file_type: 'REQUISITION' | 'AUTHORIZATION';
  s3_key: string;
  file_name: string;
  content_type?: string;
  size_bytes?: number;
  uploaded_at: string;
}

export interface Approval {
  id: string;
  grant_request_id: string;
  step: 'HOD' | 'PRINCIPAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decided_by?: string;
  decided_by_name?: string;
  remarks?: string;
  decided_at?: string;
  created_at: string;
}

export interface GrantRequest {
  id: string;
  grant_id_id: string;
  grant_id: string;
  reg_id?: string;
  requested_by: string;
  user_name?: string;
  user_dept?: string;
  requested_amount_inr?: number;
  requested_amount_usd?: number;
  amount_granted_inr?: number;
  amount_granted_usd?: number;
  fund_inr?: number;
  category_name?: string;
  detail_name?: string;
  status: GrantRequestStatus;
  created_at: string;
  updated_at: string;
  files?: RequestFile[];
  approvals?: Approval[];
}

// ─── Letters ─────────────────────────────────────────────────────────────────

export interface GeneratedLetter {
  id: string;
  grant_request_id: string;
  letter_type: string;
  s3_key: string;
  file_name?: string;
  content_type?: string;
  size_bytes?: number;
  generated_by: string;
  generated_at: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRegistrations: number;
  draftRegistrations: number;
  submittedRegistrations: number;
  totalGrantIds: number;
  pendingApprovals: number;
  totalFundAppliedINR: number;
  totalFundApprovedINR: number;
}

export interface RecentActivity {
  id: string;
  status: GrantRequestStatus;
  created_at: string;
  grant_id: string;
  category_name?: string;
  detail_name?: string;
}
