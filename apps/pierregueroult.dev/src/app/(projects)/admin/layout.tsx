import { type ReactNode } from 'react';

import { getCurrentUserOrRedirect } from '@/lib/auth/server';

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function Layout({ children }: AdminLayoutProps) {
  await getCurrentUserOrRedirect('/auth/sign-in');

  return children;
}
