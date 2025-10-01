import type { BlogResponse } from '@repo/db/types/blog/blog.interface';

import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { forbidden, notFound, redirect, unauthorized } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

import { BlogTracking } from '@/components/blog/blog-tracking';
import ExcalidrawWithClientOnly from '@/components/blog/excalidraw';
import { hasFileExtension } from '@/lib/blog/static-file-handler';
import { get } from '@/lib/fetch/server';
import { createMDXOptions } from '@/lib/markdown/mdx';

export default async function PublicBlogPage(props: PageProps<'/[locale]/blog/[...slug]'>) {
  const params = await props.params;
  const slug = params.slug;
  const locale = params.locale;

  if (hasFileExtension(slug)) {
    redirect(`/api/blog-assets/${slug.join('/')}`);
  }

  const { ok, data, code } = await get<BlogResponse>(`/blog/${slug.concat(',')}`, false);

  if (!ok && code === 404) return notFound();
  if (!ok && code === 401) return unauthorized();
  if (!ok && code === 403) return forbidden();
  if (!ok) throw new Error('Internal server error');

  if ('content' in data) {
    return (
      <>
        <BlogTracking articleId={data.database.id} />
        <Suspense fallback={<div>Loading...</div>}>
          <MDXRemote
            source={data.content}
            options={createMDXOptions(locale)}
            onError={() => <div>There&apos;s an error there</div>}
          />
        </Suspense>
      </>
    );
  }

  if ('drawing' in data) {
    console.log(data.drawing.files);
    return (
      <>
        <Script id="load-env-variables" strategy="beforeInteractive">
          {`window["EXCALIDRAW_ASSET_PATH"] = window.origin;`}
        </Script>
        <div className="h-[80vh] w-full">
          <ExcalidrawWithClientOnly initialData={data.drawing} viewModeEnabled />
        </div>
      </>
    );
  }

  throw new Error('Unknown content type');
}
