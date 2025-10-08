import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

import { CreateInteractionDto } from '@repo/db/dto/blog/create-interaction';
import { User } from '@repo/db/entities/auth/user';
import { PostVisibility } from '@repo/db/enum/blog/status';

import { Public } from '../auth/decorators/public.decorator';
import { BlogService } from './blog.service';
import { AnonymousIdInterceptor } from './profile/anonymous-id.interceptor';
import { AnonymousProfile } from './profile/profile.decorator';
import { ProfileService } from './profile/profile.service';
import { RecommendationService } from './recommendation/recommendation.service';

@Controller('blog')
@UseInterceptors(AnonymousIdInterceptor)
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly recommendationService: RecommendationService,
    private readonly profileService: ProfileService,
  ) {}

  @Public()
  @Get()
  async listPosts(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('visibility') visibility?: string,
    @Query('tags') tags?: string,
    @CurrentUser() user?: User | null,
  ) {
    const visibilityEnum = visibility as PostVisibility | undefined;
    const tagArray = tags ? tags.split(',').map((t) => t.trim()) : undefined;
    
    return this.blogService.getPostsList(
      Number(page),
      Number(pageSize),
      visibilityEnum,
      tagArray,
      user,
    );
  }

  @Public()
  @Get('recommendations/:articleId')
  async getRecommendations(
    @Param('articleId') articleId: string,
    @Query('max') max: number = 5,
    @AnonymousProfile() sessionId: string,
  ) {
    return this.recommendationService.generateRecommendations({
      sessionId,
      currentArticleId: articleId,
      includeContentBased: true,
      includeCollaborative: !!sessionId, // Enable collaborative if we have a session
      maxResults: max,
    });
  }

  @Public()
  @Get('trending')
  async getTrending(@Query('max') max: number = 5, @Query('days') days: number = 7) {
    return this.recommendationService.getTrendingRecommendations({
      maxResults: max,
      timeWindowDays: days,
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
    // SessionId should always exist due to the interceptor, but add safety check
    if (!sessionId) {
      return { success: false, error: 'No session ID available' };
    }

    await this.profileService.createOrUpdateProfile(sessionId);
    await this.profileService.trackInteraction(sessionId, interaction);
    return { success: true, sessionId };
  }
}
