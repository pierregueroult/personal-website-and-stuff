import { ConsentManagerDialog, ConsentManagerProvider, CookieBanner } from '@c15t/nextjs';

import type { ReactNode } from 'react';

type ConsentProviderProps = {
  children: ReactNode;
};

export function ConsentProvider({ children }: ConsentProviderProps) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'c15t',
        backendURL: '/api/cookies',
        consentCategories: ['necessary', 'functionality', 'measurement'],
        ignoreGeoLocation: process.env.NODE_ENV === 'development',
      }}
    >
      <CookieBanner />
      <ConsentManagerDialog />
      {children}
    </ConsentManagerProvider>
  );
}
