import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import ClerkTokenRegistrar from '../clerk-token-registrar';
import * as tokenModule from '../../lib';

// Mock Clerk hook to return an object with getToken
vi.mock('@clerk/react-router', () => ({
  useClerk: () => ({
    getToken: () => Promise.resolve('clerk-token-abc'),
    addListener: (_cb: () => void) => {},
    removeListener: (_cb: () => void) => {},
    on: (_ev: string, _cb: () => void) => {},
    off: (_ev: string, _cb: () => void) => {},
    session: { getToken: () => Promise.resolve('clerk-token-abc') },
  }),
}));

describe('ClerkTokenRegistrar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls setTokens when Clerk returns a token on mount', async () => {
    const spy = vi.spyOn(tokenModule, 'setTokens').mockImplementation(() => {});

    render(<ClerkTokenRegistrar />);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({ accessToken: 'clerk-token-abc' });
    });
  });
});
