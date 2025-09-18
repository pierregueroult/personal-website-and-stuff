import type { ContentResponse } from '@repo/db/types/blog/blog.interface';

import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { notFound } from 'next/navigation';

import { get } from '@/lib/fetch/server';
import { mdxOptions } from '@/mdx-options';

export default async function PublicBlogPage(props: PageProps<'/[locale]/blog/[slug]'>) {
  const slug = (await props.params).slug;

  const { ok, data } = await get<ContentResponse>(`/blog/public/${slug}`, false);
  if (!ok) return notFound();

  return <MDXRemote source={data.content} options={{ mdxOptions }} />;
}
