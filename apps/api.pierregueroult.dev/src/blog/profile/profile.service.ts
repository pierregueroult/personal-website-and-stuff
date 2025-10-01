import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ObjectId } from 'mongodb';
import { Repository } from 'typeorm';

import { CreateInteractionDto } from '@repo/db/dto/blog/create-interaction';
import { Post } from '@repo/db/entities/blog/post';
import { AnonymousProfile } from '@repo/db/entities/blog/profile';
import { UserInteraction } from '@repo/db/entities/blog/user-interaction';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(AnonymousProfile)
    private readonly profileRepository: Repository<AnonymousProfile>,
    @InjectRepository(UserInteraction)
    private readonly interactionRepository: Repository<UserInteraction>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async createOrUpdateProfile(sessionId: string): Promise<AnonymousProfile> {
    let profile = await this.profileRepository.findOne({ where: { sessionId } });

    if (!profile) {
      profile = this.profileRepository.create({ sessionId });
    }
    profile.lastSeen = new Date();
    await this.profileRepository.save(profile);

    return profile;
  }

  async trackInteraction(sessionId: string, interaction: CreateInteractionDto) {
    const profile = await this.createOrUpdateProfile(sessionId);

    profile.totalInteractions += 1;
    profile.lastSeen = new Date();

    await this.updateUserInterests(profile, interaction);

    await this.profileRepository.save(profile);

    const parsedMetadata = interaction.metadata ? JSON.parse(interaction.metadata) : {};

    const userInteraction = this.interactionRepository.create({
      sessionId: sessionId,
      articleId: interaction.articleId,
      action: interaction.action,
      value: interaction.value,
      metadata: {
        userAgent: parsedMetadata.userAgent || undefined,
        referrer: parsedMetadata.referrer || undefined,
        scrollPercentage: parsedMetadata.scrollPercentage || undefined,
        timeOnPage: parsedMetadata.timeOnPage || undefined,
        clickedRecommendation: parsedMetadata.clickedRecommendation || undefined,
      },
    });

    if (interaction.action === 'view') {
      const post = await this.postRepository.findOne({
        where: { _id: new ObjectId(interaction.articleId) },
      });
      if (post) {
        if (post.viewCount === undefined || post.viewCount === null) post.viewCount = 1;
        else post.viewCount += 1;
      }
      await this.postRepository.save(post);
    }

    await this.interactionRepository.save(userInteraction);
  }

  private async updateUserInterests(profile: AnonymousProfile, interaction: CreateInteractionDto) {
    try {
      const article = await this.postRepository.findOne({
        where: { _id: new ObjectId(interaction.articleId) },
        relations: ['tags'],
      });

      if (!article || !article.tags) return;

      const weight = this.getInteractionWeight(interaction);

      for (const tag of article.tags) {
        const tagSlug = tag.slug;
        const currentScore = profile.interests.tags[tagSlug] || 0;
        profile.interests.tags[tagSlug] = currentScore + weight;
      }

      await this.updateBehaviorProfile(profile, interaction);
    } catch (error) {
      this.logger.error('Error updating user interests:', error);
    }
  }

  private getInteractionWeight(interaction: CreateInteractionDto): number {
    switch (interaction.action) {
      case 'view':
        return 1;
      case 'time_spent':
        return Math.min((interaction.value || 0) / 60, 5); // Max 5 points pour 5min+
      case 'scroll':
        return Math.min((interaction.value || 0) / 100, 3); // Max 3 points pour 100%+
      case 'click_related':
        return 4;
      case 'share':
        return 8;
      default:
        return 0.5;
    }
  }

  private async updateBehaviorProfile(
    profile: AnonymousProfile,
    interaction: CreateInteractionDto,
  ) {
    const currentHour = new Date().getHours();

    // Mettre à jour les heures actives
    if (!profile.behavior.activeHours.includes(currentHour)) {
      profile.behavior.activeHours.push(currentHour);
    }

    // Mettre à jour le temps de lecture moyen
    if (interaction.action === 'time_spent' && interaction.value) {
      const currentAvg = profile.behavior.avgReadTime || 0;
      const totalInteractions = profile.totalInteractions || 1;
      profile.behavior.avgReadTime =
        (currentAvg * (totalInteractions - 1) + interaction.value) / totalInteractions;
    }

    // Déterminer le pattern de lecture
    if (interaction.action === 'scroll' && interaction.value) {
      if (interaction.value > 80) {
        profile.behavior.readingPattern = 'deep_reader';
      } else if (interaction.value < 30) {
        profile.behavior.readingPattern = 'scanner';
      } else {
        profile.behavior.readingPattern = 'mixed';
      }
    }

    await this.profileRepository.save(profile);
  }

  async getProfileWithStats(sessionId: string) {
    const profile = await this.profileRepository.findOne({
      where: { sessionId },
    });

    if (!profile) {
      return { error: 'Profile not found', sessionId };
    }

    const interactions = await this.interactionRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const interactionsByAction = interactions.reduce(
      (acc, interaction) => {
        acc[interaction.action] = (acc[interaction.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      sessionId,
      profile: {
        totalInteractions: profile.totalInteractions,
        interests: profile.interests,
        behavior: profile.behavior,
        lastSeen: profile.lastSeen,
      },
      stats: {
        recentInteractions: interactions.length,
        interactionsByAction,
        topInterests: Object.entries(profile.interests.tags)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
      },
    };
  }
}
