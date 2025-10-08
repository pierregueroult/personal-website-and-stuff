import { Separator } from '@repo/ui/components/separator';
import { Blockquote } from '@repo/ui/components/typography/blockquote';
import { H1 } from '@repo/ui/components/typography/h1';
import { H2 } from '@repo/ui/components/typography/h2';
import { H3 } from '@repo/ui/components/typography/h3';
import { H4 } from '@repo/ui/components/typography/h4';
import { Li, Ol, Ul } from '@repo/ui/components/typography/list';
import { Paragraph } from '@repo/ui/components/typography/paragraph';

import { Route } from 'next';
import Link from 'next/link';
import { ComponentProps } from 'react';

export type MarkdownComponents = {};

export const components = {
  h1: (props: ComponentProps<'h1'>) => <H1 {...props} />,
  h2: (props: ComponentProps<'h2'>) => <H2 {...props} />,
  h3: (props: ComponentProps<'h3'>) => <H3 {...props} />,
  h4: (props: ComponentProps<'h4'>) => <H4 {...props} />,
  p: (props: ComponentProps<'p'>) => <Paragraph {...props} />,
  blockquote: (props: ComponentProps<'blockquote'>) => <Blockquote {...props} />,
  ul: (props: ComponentProps<'ul'>) => <Ul {...props} />,
  ol: (props: ComponentProps<'ol'>) => <Ol {...props} />,
  li: (props: ComponentProps<'li'>) => <Li {...props} />,
  a: (props: ComponentProps<'a'>) => {
    const Component = props.href?.startsWith('/') ? Link : 'a';
    return (
      <Component {...props} className="text-blue-600 hover:underline" href={props.href as Route} />
    );
  },
  hr: (props: ComponentProps<'hr'>) => <Separator orientation="horizontal" {...props} />,
  table: (props: ComponentProps<'table'>): ReactNode => (
    <Table {...props} suppressHydrationWarning={true} />
  ),
  thead: (props: ComponentProps<'thead'>): ReactNode => <TableHeader {...props} />,
  tbody: (props: ComponentProps<'tbody'>): ReactNode => <TableBody {...props} />,
  tr: (props: ComponentProps<'tr'>): ReactNode => <TableRow {...props} />,
  th: (props: ComponentProps<'th'>): ReactNode => <TableHead {...props} />,
  td: (props: ComponentProps<'td'>): ReactNode => <TableCell {...props} />,
};
