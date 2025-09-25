import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

import { CreateInteractionDto } from '@repo/db/dto/blog/create-interaction';
import { User } from '@repo/db/entities/auth/user';

import { Public } from '../auth/decorators/public.decorator';
import { BlogService } from './blog.service';
import { AnonymousProfile } from './profile/profile.decorator';
import { ProfileService } from './profile/profile.service';
import { RecommendationService } from './recommendation/recommendation.service';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly recommendationService: RecommendationService,
    private readonly profileService: ProfileService,
  ) {}

  @Public()
  @Get('recommendations/:articleId')
  async getRecommendations(@Param('articleId') articleId: string, @Query('max') max: number = 5) {
    return this.recommendationService.generateRecommendations({
      currentArticleId: articleId,
      includeContentBased: true,
      includeCollaborative: false,
      maxResults: max,
    });
  }

  @Public()
  @Get(':path')
  async getBlogContentBySlug(@Param('path') path: string, @CurrentUser() user: User | null) {
    const wildcard = path
      .replace(/^,+|,+$/g, '')
      .trim()
      .replace(/,+/g, '/');
    return this.blogService.getBlogContentBySlug(wildcard, user);
  }

  @Public()
  @Post('interactions')
  async trackInteraction(
    @Body() interaction: CreateInteractionDto,
    @AnonymousProfile() sessionId: string,
  ) {
    await this.profileService.createOrUpdateProfile(sessionId);
    await this.profileService.trackInteraction(sessionId, interaction);
    return { success: true, sessionId };
  }
}
