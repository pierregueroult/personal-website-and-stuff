import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import rehypeExternalLinks from 'rehype-external-links';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

export const mdxOptions = {
  remarkPlugins: [remarkGfm, remarkToc],
  rehypePlugins: [
    [rehypePrettyCode, { theme: 'catppuccin-macchiato', keepbackground: true }],
    [rehypeAccessibleEmojis, { ignore: ['title', 'script', 'style', 'svg', 'math'] }],
    [rehypeExternalLinks, { target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] }],
  ],
};
