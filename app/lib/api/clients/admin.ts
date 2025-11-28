import { get, post } from '../rest';
import { AdminStatus, AuditListResponse } from '../../schemas/generated-schemas';

export async function getStatus() {
  const res = await get('/api/admin/status', undefined, { validate: AdminStatus });
  return res as unknown as { uptime?: number; version?: string };
}

export async function getAuditLogs(params?: Record<string, unknown>) {
  const res = await get('/api/admin/audit', params, { validate: AuditListResponse });
  return (res as unknown as { entries?: unknown[]; total?: number }) ?? { entries: [], total: 0 };
}

export async function runAdminAction(action: string, payload?: Record<string, unknown>) {
  const res = await post(`/api/admin/actions/${encodeURIComponent(action)}`, payload);
  return res;
}

export default { getStatus, getAuditLogs, runAdminAction };
