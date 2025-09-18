'use client';

import { Excalidraw as BaseComponent } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

const Excalidraw = dynamic(
  async () => (await import('@/components/blog/excalidraw-wrapper')).default,
  {
    ssr: false,
  },
);

type ExcalidrawClientProps = Omit<ComponentProps<typeof BaseComponent>, 'theme'>;

export default function ExcalidrawWithClientOnly(props: ExcalidrawClientProps) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme: 'light' | 'dark' =
    theme === 'system'
      ? systemTheme === 'dark'
        ? 'dark'
        : 'light'
      : theme === 'dark'
        ? 'dark'
        : 'light';

  return <Excalidraw {...props} theme={resolvedTheme} />;
}
