import { get, post } from '../rest';
import { z } from 'zod';
import { ReportRequest, ReportResponse } from '../../schemas/generated-schemas';

type ReportReq = z.infer<typeof ReportRequest>;
type ReportRes = z.infer<typeof ReportResponse>;

export async function generateReport(payload: ReportReq) {
  const res = await post<ReportRes>('/api/reports/generate', payload, { validate: ReportResponse });
  return res as unknown as ReportRes;
}

export async function getReport(id: string) {
  const res = await get(`/api/reports/${encodeURIComponent(id)}`);
  return res as unknown as { data?: unknown };
}

export default { generateReport, getReport };
