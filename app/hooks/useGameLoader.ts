import { useMemo } from 'react';
import { useParams } from 'react-router';
import { getGameBySlug, gameRegistry } from '../data/game-registry';
import type { GameDescriptor } from '../types/games';

export function useGameLoader(initialSlug?: string, initialGame?: GameDescriptor) {
  const params = useParams();
  const slug = initialSlug ?? initialGame?.slug ?? params.slug ?? '';

  const game = useMemo<GameDescriptor | undefined>(() => {
    if (initialGame && typeof initialGame.loadComponent === 'function') {
      return initialGame;
    }
    return getGameBySlug(slug) ?? initialGame;
  }, [initialGame, slug]);

  return { game, slug, allGames: gameRegistry };
}
