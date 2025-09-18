'use client';

import { Excalidraw as BaseComponent } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

const Excalidraw = dynamic(async () => (await import('./excalidraw-wrapper')).default, {
  ssr: false,
});

type ExcalidrawClientProps = ComponentProps<typeof BaseComponent>;

export default function ExcalidrawWithClientOnly(props: ExcalidrawClientProps) {
  return <Excalidraw {...props} />;
}
