'use client';

import { ReactLenis } from 'lenis/react';
import { Fragment, ReactNode } from 'react';

type LenisProviderProps = {
  children: ReactNode;
};

export default function LenisProvider({ children }: LenisProviderProps) {
  return (
    <Fragment>
      <ReactLenis root />
      {children}
    </Fragment>
  );
}
