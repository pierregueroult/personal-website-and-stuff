import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from '@repo/db/entities/blog/post';
import { AnonymousProfile } from '@repo/db/entities/blog/profile';
import { Recommendation } from '@repo/db/entities/blog/recommendation';
import { UserInteraction } from '@repo/db/entities/blog/user-interaction';

import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { EmbeddingService } from './embedding/embedding.service';
import { AnonymousIdInterceptor } from './profile/anonymous-id.interceptor';
import { ProfileService } from './profile/profile.service';
import { RecommendationService } from './recommendation/recommendation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Recommendation, UserInteraction, AnonymousProfile])],
  providers: [
    BlogService,
    EmbeddingService,
    RecommendationService,
    ProfileService,
    AnonymousIdInterceptor,
  ],
  controllers: [BlogController],
})
export class BlogModule {}
