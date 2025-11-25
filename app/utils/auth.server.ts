import { getAuth } from '@clerk/react-router/server';
import { redirect, type DataFunctionArgs } from 'react-router';

export async function requireAuth(args: DataFunctionArgs, redirectTo?: string) {
  const auth = await getAuth(args);
  const { request } = args;

  if (!auth.userId) {
    const url = new URL(request.url);
    const fallback = redirectTo ?? url.pathname + url.search;
    const searchParams = new URLSearchParams();
    if (fallback) {
      searchParams.set('redirectTo', fallback);
    }
    throw redirect(`/login?${searchParams.toString()}`);
  }

  return auth;
}

export { getAuth };
