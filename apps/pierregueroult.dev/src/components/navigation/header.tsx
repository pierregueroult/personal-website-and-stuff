import { Link } from '@/i18n/navigation';

import { TriggerChatButton } from '../chat/button';

export function Header() {
  return (
    <header>
      <nav className="flex items-center justify-between">
        <ul className="flex items-center gap-4">
          <li>
            <TriggerChatButton>Chat </TriggerChatButton>
          </li>
          <li>
            <Link href="/#about">About me</Link>
          </li>
          <li>
            <Link href="/#projects">Projects</Link>
          </li>
          <li>
            <Link href="/blog">Blog</Link>
          </li>
          <li>
            <Link href="/links?origin=portfolio">Socials</Link>
          </li>
        </ul>
        <Link href="/">pierregueroult.dev</Link>
      </nav>
    </header>
  );
}
