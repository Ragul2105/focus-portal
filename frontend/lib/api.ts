/**
 * API Layer — Fund Tracking Portal
 * All calls go to the real backend. JWT is handled via authContext.
 */

import { loadToken, removeToken } from './authContext';
import type {
  User, ActivityCategory, ActivityDetail,
  Registration, GrantId, GrantRequest,
  Approval, GeneratedLetter,
  DashboardStats, RecentActivity,
} from './types';

// ─── Core fetch helper ────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(
  path: string,
  options: RequestInit = {},
  isFormData = false,
): Promise<T> {
  const token = loadToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? `API error ${res.status}`);
  return (json?.data ?? json) as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  return request<User>('/auth/me');
}

// ─── Activity Categories / Details ───────────────────────────────────────────

export async function listCategories(): Promise<ActivityCategory[]> {
  return request<ActivityCategory[]>('/registrations/categories');
}

export async function listDetails(categoryId: number): Promise<ActivityDetail[]> {
  return request<ActivityDetail[]>(`/registrations/categories/${categoryId}/details`);
}

// ─── Fund Registrations ───────────────────────────────────────────────────────

export async function listRegistrations(params?: { status?: string }): Promise<Registration[]> {
  const qs = params?.status ? `?status=${params.status}` : '';
  return request<Registration[]>(`/registrations${qs}`);
}

export async function getRegistration(id: string): Promise<Registration> {
  return request<Registration>(`/registrations/${id}`);
}

export async function createRegistration(formData: FormData): Promise<Registration> {
  return request<Registration>('/registrations', {
    method: 'POST',
    body: formData,
  }, true);
}

export async function submitRegistration(id: string): Promise<Registration> {
  return request<Registration>(`/registrations/${id}/submit`, { method: 'POST' });
}

export async function getRegistrationFileUrl(s3Key: string): Promise<string> {
  const data = await request<{ url: string }>(`/registrations/file/${encodeURIComponent(s3Key)}`);
  return data.url;
}

// ─── Grant IDs ────────────────────────────────────────────────────────────────

export async function listGrantIds(): Promise<GrantId[]> {
  return request<GrantId[]>('/grant-ids');
}

export async function generateGrantId(registrationId: string, amountGrantedInr?: number, amountGrantedUsd?: number): Promise<GrantId> {
  return request<GrantId>('/grant-ids', {
    method: 'POST',
    body: JSON.stringify({ registrationId, amountGrantedInr, amountGrantedUsd }),
  });
}

export async function getGrantIdByRegistration(registrationId: string): Promise<GrantId[]> {
  return request<GrantId[]>(`/grant-ids/by-registration/${registrationId}`);
}

// ─── Grant Requests ───────────────────────────────────────────────────────────

export async function listGrantRequests(params?: { status?: string }): Promise<GrantRequest[]> {
  const qs = params?.status ? `?status=${params.status}` : '';
  return request<GrantRequest[]>(`/grant-requests${qs}`);
}

export async function getGrantRequest(id: string): Promise<GrantRequest> {
  return request<GrantRequest>(`/grant-requests/${id}`);
}

export async function createGrantRequest(formData: FormData): Promise<GrantRequest> {
  return request<GrantRequest>('/grant-requests', {
    method: 'POST',
    body: formData,
  }, true);
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export async function getApprovals(requestId: string): Promise<Approval[]> {
  return request<Approval[]>(`/approvals/${requestId}`);
}

export async function decideApproval(
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  remarks?: string,
): Promise<Approval> {
  return request<Approval>(`/approvals/${requestId}`, {
    method: 'POST',
    body: JSON.stringify({ status, remarks }),
  });
}

// ─── H.O. Letters ────────────────────────────────────────────────────────────

export async function generateLetter(requestId: string): Promise<GeneratedLetter> {
  return request<GeneratedLetter>(`/letters/${requestId}/generate`, { method: 'POST' });
}

export async function listLetters(requestId: string): Promise<GeneratedLetter[]> {
  return request<GeneratedLetter[]>(`/letters/${requestId}`);
}

export async function getLetterDownloadUrl(s3Key: string): Promise<string> {
  const data = await request<{ url: string }>(`/letters/download/${encodeURIComponent(s3Key)}`);
  return data.url;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/dashboard/stats');
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  return request<RecentActivity[]>('/dashboard/recent-activity');
}
