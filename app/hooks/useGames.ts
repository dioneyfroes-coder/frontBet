import { useEffect, useState } from 'react';
import { apiFetch } from '../lib';
// import type { components } from '../lib/api-client/types';
// import { schemas } from '../lib/schemas/generated-schemas';

type Game = unknown;

export function useGames() {
  const [data, setData] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch('/api/games')
      .then((res) => {
        if (!mounted) return;
        // if the generator created a GamesResponse schema, we could validate here
        const maybe = res as unknown as { data?: unknown };
        setData((maybe.data as unknown[] | null) ?? null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? String(err));
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
