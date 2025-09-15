import { Controller, Get, Param } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';

import { Post } from '@repo/db/entities/blog/post';

import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get('public/:slug')
  async getBlogContentBySlug(@Param('slug') slug: string): Promise<Partial<Post>> {
    return this.blogService.getBlogContentBySlug(slug);
  }

  @Get('private/:slug')
  async getPrivateBlogContentBySlug(@Param('slug') slug: string): Promise<Partial<Post>> {
    return this.blogService.getPrivateBlogContentBySlug(slug);
  }
}
