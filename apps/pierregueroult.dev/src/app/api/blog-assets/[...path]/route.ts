import { hasFileExtension, serveStaticFile } from '@/lib/blog/static-file-handler';

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;

  if (hasFileExtension(path)) {
    return serveStaticFile(path);
  }

  return new Response('Not Found', { status: 404 });
}
