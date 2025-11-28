import { useEffect, useState } from 'react';
import { getGames } from '../lib/api/clients/games';
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
    getGames()
      .then((games) => {
        if (!mounted) return;
        setData(games);
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
