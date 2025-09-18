'use client';

import { Excalidraw } from '@excalidraw/excalidraw';

import { ComponentProps } from 'react';

type ExcalidrawWrapperProps = ComponentProps<typeof Excalidraw>;

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = (props) => {
  return <Excalidraw {...props} />;
};

export default ExcalidrawWrapper;
