import { get, post } from '../rest';
import { z } from 'zod';
import { ReportRequest, ReportResponse } from '../../schemas/generated-schemas';

type ReportReq = z.infer<typeof ReportRequest>;
type ReportEnvelope = ReturnType<typeof ReportResponse.parse>;
type ReportData = ReportEnvelope['data'];

export async function generateReport(payload: ReportReq) {
  const res = await post<ReportEnvelope>('/api/reports/generate', payload, {
    validate: ReportResponse,
  });
  return (res.data as ReportData | null | undefined) ?? null;
}

export async function getReport(id: string) {
  const res = await get<ReportEnvelope>(`/api/reports/${encodeURIComponent(id)}`, undefined, {
    validate: ReportResponse,
  });
  return res.data as ReportData | null | undefined;
}

export default { generateReport, getReport };
