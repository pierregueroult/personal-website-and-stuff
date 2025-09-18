import { MDXRemoteOptions } from 'next-mdx-remote-client/rsc';
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import rehypeExternalLinks, { Options as RehypeExternalLinksOptions } from 'rehype-external-links';
import rehypePrettyCode, { Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: 'catppuccin-macchiato',
  keepBackground: true,
};

const rehypeExternalLinksOptions: RehypeExternalLinksOptions = {
  target: '_blank',
  rel: ['nofollow', 'noopener', 'noreferrer'],
};

export const options: MDXRemoteOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkToc],
    rehypePlugins: [
      [rehypePrettyCode, rehypePrettyCodeOptions],
      rehypeAccessibleEmojis,
      [rehypeExternalLinks, rehypeExternalLinksOptions],
    ],
  },
};
