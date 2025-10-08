import { cn } from '@repo/ui/lib/utils';

import { ComponentProps } from 'react';

export function H3(props: ComponentProps<'h3'>) {
  return (
    <h3
      {...props}
      className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', props.className)}
    >
      {props.children}
    </h3>
  );
}
