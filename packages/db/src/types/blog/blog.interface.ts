import type { ExcalidrawElement } from '@excalidraw/excalidraw/dist/types/excalidraw/element/types';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/dist/types/excalidraw/types';

import { PostVisibility } from '../../enum/blog/status';

export interface ContentFrontMatter {
  title?: string;
  visibility?: ContentVisibility;
  date?: string;
  tags?: string[];
  categories?: string[];
  ['kanban-plugin']?: 'board' | 'task' | string;
  [key: string]: any;
}

export interface ContentResponseBase {
  slug: string;
  frontMatter: ContentFrontMatter;
  database: {
    id: string;
    visibility: PostVisibility;
  };
}

export interface ContentResponse extends ContentResponseBase {
  content: string;
}

export interface DrawingResponse extends ContentResponseBase {
  drawing: ExcalidrawJson;
}

export interface KanbanResponse extends ContentResponseBase {
  kanban: {
    title: string;
    tasks: {
      text: string;
      isDone: boolean;
    }[];
  }[];
}

export type BlogResponse = ContentResponse | DrawingResponse | KanbanResponse;

export type ContentVisibility = 'public' | 'private' | 'unlisted';

export type MarkdownContent = {
  frontMatter: ContentFrontMatter;
  content: string;
  fileLastModified: Date;
  fileHash: string;
};

export type ExcalidrawJson = {
  type: 'excalidraw';
  version: number;
  source?: string;
  elements: ExcalidrawElement[];
  appState?: Partial<AppState>;
  files?: BinaryFiles | null;
};
