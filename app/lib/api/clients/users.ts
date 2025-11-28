import { get } from '../rest';
import { User } from '../../schemas/generated-schemas';
import { z } from 'zod';

type UserResp = z.infer<typeof User>;

export async function getUser(id: string) {
  const res = await get<{ success?: boolean; data?: unknown }>(`/api/users/${encodeURIComponent(id)}`);
  const maybe = res as unknown as { data?: unknown };
  // try to validate with User schema if present
  try {
    const parsed = User.safeParse(maybe.data);
    if (parsed.success) return parsed.data as UserResp;
  } catch {
    // fallthrough
  }
  return maybe.data as UserResp | null;
}

export async function listUsers(params?: Record<string, unknown>) {
  const res = await get('/api/users', params);
  const maybe = res as unknown as { data?: unknown };
  return (maybe.data as UserResp[] | null) ?? [];
}

export default { getUser, listUsers };
