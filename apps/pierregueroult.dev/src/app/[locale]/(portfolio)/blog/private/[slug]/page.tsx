import type { BlogSlugResponse } from '@repo/db/types/blog/blog.interface';

import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { notFound } from 'next/navigation';

import { get } from '@/lib/fetch/server';

export default async function PrivateBlogPage(props: PageProps<'/[locale]/blog/private/[slug]'>) {
  const slug = (await props.params).slug;

  const { ok, data } = await get<BlogSlugResponse>(`/blog/private/${slug}`, true);
  if (!ok) return notFound();

  return <MDXRemote source={data.content} />;
}
