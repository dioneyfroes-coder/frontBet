import { describe, it, beforeEach, expect, vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameLoader } from '../useGameLoader';
import { gameRegistry } from '../../data/game-registry';
import { useParams } from 'react-router';

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const mockedUseParams = useParams as unknown as Mock;

describe('useGameLoader', () => {
  beforeEach(() => {
    mockedUseParams.mockReturnValue({ slug: 'live-monitor' });
  });

  it('returns initial game when provided', () => {
    const initial = gameRegistry[1];
    mockedUseParams.mockReturnValue({ slug: undefined });

    const { result } = renderHook(() => useGameLoader(initial.slug, initial));

    expect(result.current.game).toBe(initial);
    expect(result.current.slug).toBe(initial.slug);
    expect(result.current.allGames).toContain(initial);
  });

  it('falls back to params slug and registry lookup', () => {
    const expected = gameRegistry[2];
    mockedUseParams.mockReturnValue({ slug: expected.slug });

    const { result } = renderHook(() => useGameLoader());

    expect(result.current.game).toEqual(expected);
    expect(result.current.slug).toBe(expected.slug);
  });
});
