import { cn } from '@repo/ui/lib/utils';

import { ComponentProps } from 'react';

export function Blockquote(props: ComponentProps<'blockquote'>) {
  return (
    <blockquote {...props} className={cn('mt-6 border-l-2 pl-6 italic', props.className)}>
      {props.children}
    </blockquote>
  );
}
