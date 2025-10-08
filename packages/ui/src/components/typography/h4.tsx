import { cn } from '@repo/ui/lib/utils';

import { ComponentProps } from 'react';

export function H4(props: ComponentProps<'h4'>) {
  return (
    <h4
      {...props}
      className={cn('scroll-m-20 text-xl font-semibold tracking-tight', props.className)}
    >
      {props.children}
    </h4>
  );
}
