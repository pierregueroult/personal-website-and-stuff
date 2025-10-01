import { readFile } from 'fs/promises';
import { notFound } from 'next/navigation';
import path from 'path';

import { Logger } from '@/lib/logger';

const CONTENT_BLOG_PATH = path.join(process.cwd(), '../../packages/content/blog');
const logger = new Logger('StaticFileHandler');

export const hasFileExtension = (slug: string[]): boolean => {
  if (slug.length === 0) return false;
  const lastSegment = slug[slug.length - 1];
  if (!lastSegment) return false;
  return lastSegment.includes('.') && lastSegment.split('.').length > 1;
};

export const getFilePath = (slug: string[]): string => {
  return path.join(CONTENT_BLOG_PATH, ...slug);
};

export const getMimeType = (filename: string): string => {
  const extension = path.extname(filename).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.html': 'text/html',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

export const serveStaticFile = async (slug: string[]) => {
  try {
    const filePath = getFilePath(slug);
    const fileBuffer = await readFile(filePath);
    const filename = slug[slug.length - 1];
    if (!filename) {
      return notFound();
    }
    const mimeType = getMimeType(filename);

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    logger.error('Error serving static file:', error);
    return notFound();
  }
};
