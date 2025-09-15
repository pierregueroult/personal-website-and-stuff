import { getCurrentUserOrRedirect } from "@/lib/auth/server";

export default function PrivateBlogLayout({ children }: LayoutProps<'/[locale]'>) {
  getCurrentUserOrRedirect();

  return children;
}
