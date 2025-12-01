import { get, post } from '../rest';
import { AdminStatus, AuditListResponse } from '../../schemas/generated-schemas';

type AdminStatusEnvelope = ReturnType<typeof AdminStatus.parse>;
type AuditListEnvelope = ReturnType<typeof AuditListResponse.parse>;

export async function getStatus() {
  const res = await get<AdminStatusEnvelope>('/api/admin/status', undefined, {
    validate: AdminStatus,
  });
  return res.data ?? null;
}

export async function getAuditLogs(params?: Record<string, unknown>) {
  const res = await get<AuditListEnvelope>('/api/admin/audit', params, {
    validate: AuditListResponse,
  });
  return res.data ?? { entries: [], total: 0 };
}

export async function runAdminAction(action: string, payload?: Record<string, unknown>) {
  const res = await post(`/api/admin/actions/${encodeURIComponent(action)}`, payload);
  return res;
}

export default { getStatus, getAuditLogs, runAdminAction };
