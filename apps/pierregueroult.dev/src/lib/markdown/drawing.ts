import type { FileId } from '@excalidraw/excalidraw/element/types';
import type { BinaryFiles, DataURL } from '@excalidraw/excalidraw/types';

import { parseMimeTypeImage } from '../files/parse-mime';
import { generateContentPermalinks } from './permalinks';

const permalinks: string[] = generateContentPermalinks();

export function parseDrawingFiles(markdown: string, locale: string): BinaryFiles {
  const embeddedFileRegex = /## Embedded Files\n([\s\S]*?)%%/;
  const match = markdown.match(embeddedFileRegex);

  const files: BinaryFiles = {};

  if (match && match[1]) {
    const pairs = match[1]
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) =>
        line.split(':').map((part) => part.trim().replace(/^\[\[/, '').replace(/\]\]$/, '')),
      );

    for (const [id, name] of pairs) {
      if (!id || !name) continue;

      const permalink = permalinks.find((link) => link.endsWith(`/${name}`));
      if (!permalink) continue;

      files[id] = {
        mimeType: parseMimeTypeImage(name),
        id: id as FileId,
        dataURL: `/${locale}/blog/${permalink}` as DataURL,
        created: Date.now(),
      };
    }
  }

  return files;
}
