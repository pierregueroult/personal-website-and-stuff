export interface ContentFrontMatter {
  title?: string;
  visibility?: ContentVisibility;
  date?: string;
  [key: string]: any;
}

export interface ContentResponse {
  slug: string;
  frontMatter: ContentFrontMatter;
  content: string;
}

export type ContentVisibility = 'public' | 'private' | 'unlisted';