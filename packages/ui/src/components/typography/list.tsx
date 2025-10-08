import { cn } from '@repo/ui/lib/utils';

import { ComponentProps } from 'react';

export function Ul(props: ComponentProps<'ul'>) {
  return (
    <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', props.className)}>{props.children}</ul>
  );
}

export function Ol(props: ComponentProps<'ol'>) {
  return <ol className={cn('my-6 ml-6 list-decimal [&>li]:mt-2', props.className)}></ol>;
}

export function Li(props: ComponentProps<'li'>) {
  return (
    <li {...props} className={props.className}>
      {props.children}
    </li>
  );
}
