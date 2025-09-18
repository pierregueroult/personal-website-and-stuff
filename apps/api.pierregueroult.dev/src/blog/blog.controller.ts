import { Controller, Get, Param } from '@nestjs/common';

import { Post } from '@repo/db/entities/blog/post';

import { Public } from '../auth/decorators/public.decorator';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get('public/:slug')
  async getBlogContentBySlug(@Param('slug') slug: string): Promise<Partial<Post>> {
    return this.blogService.getBlogContentBySlug(slug, 'public');
  }

  @Get('private/:slug')
  async getPrivateBlogContentBySlug(@Param('slug') slug: string): Promise<Partial<Post>> {
    return this.blogService.getBlogContentBySlug(slug, 'private');
  }

  @Get('unlisted/:slug')
  async getUnlistedBlogContentBySlug(@Param('slug') slug: string): Promise<Partial<Post>> {
    return this.blogService.getBlogContentBySlug(slug, 'unlisted');
  }
}
