import { getCurrentUserOrRedirect } from '@/lib/auth/server';

export default async function Layout({ children }: LayoutProps<'/[locale]/admin'>) {
  await getCurrentUserOrRedirect('/auth/sign-in');

  return children;
}
