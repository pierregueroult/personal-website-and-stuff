import { type ReactNode } from 'react';

import { getCurrentUserOrRedirect } from '@/lib/auth/server';

type TwitchAdminLayoutProps = {
  children: ReactNode;
};

export default async function Layout({ children }: TwitchAdminLayoutProps) {
  await getCurrentUserOrRedirect('/auth/sign-in');

  return children;
}
