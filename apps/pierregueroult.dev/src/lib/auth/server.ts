import { User } from '@repo/db/entities/user';

import { redirect } from 'next/navigation';
import { cache } from 'react';
import 'server-only';

import { get } from '@/lib/fetch/server';

enum AuthError {
  FETCH_FAILED = 'FETCH_FAILED',
  NO_USER = 'NO_USER',
}

const fetchUserData = cache(async (): Promise<{ user: User | null; error: AuthError | null }> => {
  const { ok, data } = await get<User>('/user/me', true);

  if (!ok) {
    return { user: null, error: AuthError.FETCH_FAILED };
  }

  if (!data) {
    return { user: null, error: AuthError.NO_USER };
  }

  return { user: data, error: null };
});

export const getCurrentUserOrThrow = async (): Promise<User> => {
  const { user, error } = await fetchUserData();

  if (error || !user) {
    throw new Error(`Authentication failed: ${error || 'Unknown error'}`);
  }

  return user;
};

export const getCurrentUserOrRedirect = async (path?: string): Promise<User> => {
  const { user, error } = await fetchUserData();

  if (error || !user) {
    return redirect(path || '/auth/sign-in');
  }

  return user;
};

export const getCurrentUserOrNull = async (): Promise<User | null> => {
  const { user } = await fetchUserData();
  return user;
};
