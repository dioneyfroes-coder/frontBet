import { get } from '../rest';

export async function getGames() {
  const resp = await get('/api/games');
  // MSW returns { success: true, data: [...] } — return the inner data array when present
  const maybe = resp as unknown as { data?: unknown };
  return (maybe.data as unknown[] | null) ?? [];
}

export default { getGames };
