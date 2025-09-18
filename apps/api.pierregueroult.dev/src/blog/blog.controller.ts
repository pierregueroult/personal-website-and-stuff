import { Controller, Get, Param } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { BlogService } from './blog.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@repo/db/entities/auth/user';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get(':slug')
  async getBlogContentBySlug(@Param('slug') slug: string, @CurrentUser() user: User | null) {
    return this.blogService.getBlogContentBySlug(slug, user);
  }
}
