import type { BlogResponse } from '@repo/db/types/blog/blog.interface';

import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { forbidden, notFound, unauthorized } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

import ExcalidrawWithClientOnly from '@/components/blog/excalidraw';
import { get } from '@/lib/fetch/server';
import { options } from '@/mdx-options';

const ErrorComponent = () => <div>Error loading content</div>;

export default async function PublicBlogPage(props: PageProps<'/[locale]/blog/[slug]'>) {
  const slug = (await props.params).slug;

  const { ok, data, code } = await get<BlogResponse>(`/blog/${slug}`, false);

  if (!ok && code === 404) return notFound();
  if (!ok && code === 401) return unauthorized();
  if (!ok && code === 403) return forbidden();
  if (!ok) throw new Error('Internal server error');

  if ('content' in data) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <MDXRemote source={data.content} options={options} onError={ErrorComponent} />
      </Suspense>
    );
  }

  if ('drawing' in data) {
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
