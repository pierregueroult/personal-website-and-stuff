import * as fs from 'fs';
import * as path from 'path';

import { Logger } from '@/lib/logger';

const SUPPORTED_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.apng', '.webp', '.gif', '.svg', '.bmp', '.ico'],
  documents: ['.pdf'],
} as const;

const logger = new Logger('Permalinks');

interface PermalinkConfig {
  contentPath: string;
  recursive?: boolean;
}

function walkDirectory(dir: string, basePath: string = ''): string[] {
  let permalinks: string[] = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        const relativePath = basePath ? `${basePath}/${item}` : item;
        permalinks = permalinks.concat(walkDirectory(fullPath, relativePath));
      } else if (shouldIncludeFile(item)) {
        const permalink = createPermalink(item, basePath);
        permalinks.push(permalink);
      }
    }
  } catch (error) {
    logger.warn(`Failed to read directory ${dir}:`, error);
  }

  return permalinks;
}

function shouldIncludeFile(filename: string): boolean {
  const lowercaseFilename = filename.toLowerCase();

  if (lowercaseFilename.endsWith('.md')) {
    return true;
  }

  const allExtensions = [...SUPPORTED_EXTENSIONS.images, ...SUPPORTED_EXTENSIONS.documents];

  return allExtensions.some((ext) => lowercaseFilename.endsWith(ext));
}

function createPermalink(filename: string, basePath: string): string {
  let permalink: string;

  if (filename.endsWith('.md')) {
    const nameWithoutExtension = filename.replace(/\.md$/, '');
    permalink = basePath ? `${basePath}/${nameWithoutExtension}` : nameWithoutExtension;
  } else {
    permalink = basePath ? `${basePath}/${filename}` : filename;
  }

  return permalink;
}
export function generatePermalinks(config: PermalinkConfig): string[] {
  const { contentPath, recursive = true } = config;

  try {
    const resolvedPath = path.resolve(process.cwd(), contentPath);

    if (!fs.existsSync(resolvedPath)) {
      logger.warn(`Content path does not exist: ${resolvedPath}`);
      return [];
    }

    if (!recursive) {
      const items = fs.readdirSync(resolvedPath);
      return items.filter(shouldIncludeFile).map((item) => createPermalink(item, ''));
    }

    return walkDirectory(resolvedPath);
  } catch (error) {
    logger.error('Failed to generate permalinks:', error);
    return [];
  }
}

export const DEFAULT_CONTENT_CONFIG: PermalinkConfig = {
  contentPath: '../../packages/content/blog',
  recursive: true,
};

export function generateContentPermalinks(): string[] {
  return generatePermalinks(DEFAULT_CONTENT_CONFIG);
}
