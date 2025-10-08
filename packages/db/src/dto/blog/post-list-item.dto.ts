import { PostVisibility } from '../../enum/blog/status';

export interface PostListItemDto {
  id: string;
  title: string;
  slug: string;
  visibility: PostVisibility;
  tags: string[];
  excerpt?: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  readingTime?: number;
}

export interface PostListResponseDto {
  posts: PostListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
