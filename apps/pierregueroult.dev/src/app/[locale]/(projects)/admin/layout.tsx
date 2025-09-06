import { getCurrentUserOrRedirect } from '@/lib/auth/server';

export default async function Layout({ children }: LayoutProps<'/admin'>) {
  await getCurrentUserOrRedirect('/auth/sign-in');

  return children;
}
