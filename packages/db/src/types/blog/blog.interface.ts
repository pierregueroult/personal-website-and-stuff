import { PostVisibility } from "../../enum/blog/status";

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
  database: {
    id: string;
    visibility: PostVisibility;
    // TODO LATER : handle the comments, tags, categories
  }
}

export type ContentVisibility = 'public' | 'private' | 'unlisted';

export type MarkdownContent = {
  frontMatter: ContentFrontMatter;
  content: string;
  fileLastModified: Date;
  fileHash: string;
}