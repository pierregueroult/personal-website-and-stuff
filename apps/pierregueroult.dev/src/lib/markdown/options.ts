import remarkWikiLink, {
  type Options as RemarkWikiLinkOptions,
} from '@flowershow/remark-wiki-link';

import type { MDXRemoteOptions } from 'next-mdx-remote-client/rsc';
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import type { Options as RehypeExternalLinksOptions } from 'rehype-external-links';
import rehypeExternalLinks from 'rehype-external-links';
import type { Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

import { generateContentPermalinks } from '@/lib/markdown/permalinks';

const REHYPE_PRETTY_CODE_OPTIONS: RehypePrettyCodeOptions = {
  theme: 'catppuccin-macchiato',
  keepBackground: true,
};

const REHYPE_EXTERNAL_LINKS_OPTIONS: RehypeExternalLinksOptions = {
  target: '_blank',
  rel: ['nofollow', 'noopener', 'noreferrer'],
};

function createWikiLinkOptions(locale: string): RemarkWikiLinkOptions {
  return {
    format: 'shortestPossible',
    permalinks: generateContentPermalinks(),
    urlResolver: (name: string) => `/${locale}/blog/${name}`,
  };
}

export function options(locale: string = 'en'): MDXRemoteOptions {
  const wikiLinkOptions = createWikiLinkOptions(locale);

  return {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkToc, [remarkWikiLink, wikiLinkOptions]],
      rehypePlugins: [
        [rehypePrettyCode, REHYPE_PRETTY_CODE_OPTIONS],
        rehypeAccessibleEmojis,
        [rehypeExternalLinks, REHYPE_EXTERNAL_LINKS_OPTIONS],
      ],
    },
  };
}

export const defaultMDXOptions: MDXRemoteOptions = options('en');
