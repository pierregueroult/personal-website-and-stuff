import { ValueOf } from '@excalidraw/excalidraw/utility-types';

const IMAGE_MIME_TYPES = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  avif: 'image/avif',
  jfif: 'image/jfif',
} as const;

export const MIME_TYPES = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  avif: 'image/avif',
  jfif: 'image/jfif',
  text: 'text/plain',
  html: 'text/html',
  json: 'application/json',
  excalidraw: 'application/vnd.excalidraw+json',
  excalidrawlib: 'application/vnd.excalidrawlib+json',
  'excalidraw.svg': 'image/svg+xml',
  'excalidraw.png': 'image/png',
  binary: 'application/octet-stream',
} as const;

export function parseMimeTypeImage(
  fileName: string,
): ValueOf<typeof IMAGE_MIME_TYPES> | typeof MIME_TYPES.binary {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension) return 'application/octet-stream';

  if (extension && extension in IMAGE_MIME_TYPES) {
    return IMAGE_MIME_TYPES[extension as keyof typeof IMAGE_MIME_TYPES];
  }

  return 'application/octet-stream';
}
