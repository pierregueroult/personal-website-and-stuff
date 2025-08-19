import { Button } from '@repo/ui/components/button';
import ChatTemporaire from './temp';

export default function Home() {
  return (
    <main>
      <h1>This is the homepage</h1>
      <Button>Hello World</Button>
      <ChatTemporaire />
    </main>
  );
}
