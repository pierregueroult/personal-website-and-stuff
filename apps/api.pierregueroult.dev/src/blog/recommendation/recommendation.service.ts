import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ObjectId } from 'mongodb';
import { In, MoreThanOrEqual, Not, Repository } from 'typeorm';

import { Post } from '@repo/db/entities/blog/post';
import { AnonymousProfile } from '@repo/db/entities/blog/profile';
import { Recommendation } from '@repo/db/entities/blog/recommendation';
import { UserInteraction } from '@repo/db/entities/blog/user-interaction';

import { EmbeddingService } from '../embedding/embedding.service';
import { Behavior, RecommendationContext, ScoredRecommendation } from './recommendation.interface';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(UserInteraction)
    private readonly userInteractionRepository: Repository<UserInteraction>,
    @InjectRepository(AnonymousProfile)
    private readonly anonymousProfileRepository: Repository<AnonymousProfile>,
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,

    private readonly embeddingService: EmbeddingService,
  ) {}

  private readonly log = new Logger(RecommendationService.name);

  async generateRecommendations(context: RecommendationContext): Promise<ScoredRecommendation[]> {
    const {
      sessionId,
      currentArticleId,
      includeContentBased = true,
      includeCollaborative = true,
      maxResults = 5,
    } = context;

    try {
      const currentArticle = await this.postRepository.findOne({
        where: { _id: new ObjectId(currentArticleId) },
      });

      if (!currentArticle) throw new Error('Current article not found');

      let contentBasedRecommendations: ScoredRecommendation[] = [];
      let collaborativeRecommendations: ScoredRecommendation[] = [];

      if (includeContentBased) {
        contentBasedRecommendations = await this.getContentBasedRecommendations(currentArticle);
      }

      if (includeCollaborative && sessionId) {
        collaborativeRecommendations = await this.getCollaborativeRecommendations(
          sessionId,
          currentArticleId,
        );
      }

      const hybricRecommendations = this.mergeRecommendations(
        contentBasedRecommendations,
        collaborativeRecommendations,
        maxResults,
      );

      await this.saveRecommendations(currentArticleId, {
        contentBased: contentBasedRecommendations.slice(0, 10),
        collaborative: collaborativeRecommendations.slice(0, 10),
        hybrid: hybricRecommendations,
      });

      return hybricRecommendations;
    } catch (error) {
      this.log.error('Error generating recommendations', error);
      return [];
    }
  }

  private async getContentBasedRecommendations(
    currentArticle: Post,
  ): Promise<ScoredRecommendation[]> {
    try {
      const candidates = await this.postRepository.find({
        where: { embedding: Not(null), _id: Not(currentArticle._id) },
        select: ['_id', 'title', 'tags', 'embedding'],
      });

      if (!currentArticle.embedding) return [];

      const recommendations: ScoredRecommendation[] = [];

      for (const candidate of candidates) {
        const similarity = this.embeddingService.calculateCosineSimilarity(
          currentArticle.embedding,
          candidate.embedding,
        );

        const reasons = this.getContentReasons(currentArticle, candidate, similarity);

        const engagementBoost = Math.log(candidate.engagementScore + 1) / 10;
        const contentScore = similarity * 0.8 + engagementBoost * 0.2;

        if (contentScore > 0.1) {
          recommendations.push({
            articleId: candidate._id.toHexString(),
            title: candidate.title,
            slug: candidate.slug,
            tags: candidate.tags.map((tag) => tag.slug),
            finalScore: contentScore,
            contentScore,
            reasons,
            similarity,
            behavioralScore: 0,
          });
        }
      }

      return recommendations.sort((a, b) => b.finalScore - a.finalScore).slice(0, 20);
    } catch (error: unknown) {
      this.log.error('Error in content-based recommendations', error);
      return [];
    }
  }

  private async getCollaborativeRecommendations(sessionId: string, currentArticleId: string) {
    try {
      const profile = await this.anonymousProfileRepository.findOne({
        where: { sessionId },
      });

      if (!profile) return [];

      const similarUsers = await this.findSimilarUsers(profile);
      const candidateArticles = new Map<string, { score: number; reasons: string[] }>();

      for (const similarUser of similarUsers) {
        const interactions = await this.userInteractionRepository.find({
          where: {
            sessionId: similarUser.sessionId,
            action: In(['view', 'time_spent']),
            articleId: Not(currentArticleId),
          },
          order: { createdAt: 'DESC' },
          take: 20,
        });

        for (const interaction of interactions) {
          const weight = this.calculateInteractionWeight(interaction, similarUser.similarity);

          if (!candidateArticles.has(interaction.articleId)) {
            candidateArticles.set(interaction.articleId, { score: 0, reasons: [] });
          }

          const current = candidateArticles.get(interaction.articleId)!;
          current.score += weight;

          if (interaction.action === 'time_spent' && interaction.value > 60) {
            current.reasons.push('long_read_by_similar_user');
          }
          if (similarUser.similarity > 0.7) {
            current.reasons.push('similar_user_high_similarity');
          }
        }
      }

      const recommendations: ScoredRecommendation[] = [];

      for (const [articleId, data] of candidateArticles) {
        const article = await this.postRepository.findOne({
          where: { _id: new ObjectId(articleId) },
          select: ['_id', 'title', 'tags', 'slug'],
        });

        if (article && data.score > 0.1) {
          recommendations.push({
            articleId: article._id.toHexString(),
            title: article.title,
            slug: article.slug,
            tags: article.tags.map((tag) => tag.slug),
            finalScore: data.score,
            behavioralScore: data.score,
            reasons: Array.from(new Set(data.reasons)),
            contentScore: 0,
            similarity: 0,
          });
        }
      }

      return recommendations.sort((a, b) => b.finalScore - a.finalScore).slice(0, 20);
    } catch (error: unknown) {
      this.log.error('Error in collaborative recommendations', error);
      return [];
    }
  }

  private mergeRecommendations(
    contentBased: ScoredRecommendation[],
    collaborative: ScoredRecommendation[],
    maxResults: number,
  ): ScoredRecommendation[] {
    const merged = new Map<string, ScoredRecommendation>();

    contentBased.forEach((rec) => {
      merged.set(rec.articleId, rec);
    });

    collaborative.forEach((rec) => {
      if (merged.has(rec.articleId)) {
        const existing = merged.get(rec.articleId)!;
        existing.behavioralScore = rec.behavioralScore;
        existing.reasons = [...new Set([...existing.reasons, ...rec.reasons])];
        existing.finalScore = existing.contentScore * 0.6 + existing.behavioralScore * 0.4;
      } else {
        merged.set(rec.articleId, rec);
      }
    });

    return Array.from(merged.values())
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, maxResults);
  }

  private getContentReasons(current: Post, candidate: Post, similarity: number): string[] {
    const reasons: string[] = [];

    if (similarity > 0.7) reasons.push('high_embedding_similarity');

    const commonTags = current.tags.filter((tag) => candidate.tags.some((t) => t._id === tag._id));
    if (commonTags.length > 0) reasons.push('shared_tags');

    if (candidate.engagementScore > 100) reasons.push('high_engagement');

    return reasons;
  }

  private async findSimilarUsers(
    userProfile: AnonymousProfile,
  ): Promise<{ sessionId: string; similarity: number }[]> {
    const otherProfiles = await this.anonymousProfileRepository.find({
      where: { sessionId: Not(userProfile.sessionId), totalInteractions: MoreThanOrEqual(5) },
      take: 100,
    });

    const similarities: { sessionId: string; similarity: number }[] = [];

    for (const other of otherProfiles) {
      const similarity = this.calculateProfileSimilarity(userProfile, other);
      if (similarity > 0.3) {
        similarities.push({ sessionId: other.sessionId, similarity });
      }
    }
    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  }

  private calculateProfileSimilarity(
    profileA: AnonymousProfile,
    profileB: AnonymousProfile,
  ): number {
    const tags1 = Object.keys(profileA.interests.tags);
    const tags2 = Object.keys(profileB.interests.tags);

    const intersection = tags1.filter((tag) => tags2.includes(tag));
    const union = [...new Set([...tags1, ...tags2])];

    const jaccardSimilarity = union.length > 0 ? intersection.length / union.length : 0;

    const behaviorSimilarity = this.calculateBehaviorSimilarity(
      profileA.behavior,
      profileB.behavior,
    );

    return jaccardSimilarity * 0.7 + behaviorSimilarity * 0.3;
  }

  private calculateBehaviorSimilarity(behaviorA: Behavior, behaviorB: Behavior): number {
    let similarity = 0;
    let factors = 0;

    if (behaviorA.avgReadTime > 0 && behaviorB.avgReadTime > 0) {
      const timeDiff = Math.abs(behaviorA.avgReadTime - behaviorB.avgReadTime);
      const maxTime = Math.max(behaviorA.avgReadTime, behaviorB.avgReadTime);
      similarity += 1 - timeDiff / maxTime;
      factors++;
    }

    if (behaviorA.activeHours.length > 0 && behaviorB.activeHours.length > 0) {
      const commonHours = behaviorA.activeHours.filter((hour) =>
        behaviorB.activeHours.includes(hour),
      );
      const hourSimilarity =
        commonHours.length / Math.max(behaviorA.activeHours.length, behaviorB.activeHours.length);
      similarity += hourSimilarity;
      factors++;
    }

    if (behaviorA.preferredLength === behaviorB.preferredLength) {
      similarity += 1;
      factors++;
    }

    if (behaviorA.readingPattern === behaviorB.readingPattern) {
      similarity += 1;
      factors++;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  private calculateInteractionWeight(interaction: UserInteraction, similarity: number): number {
    let baseWeight = 0;

    switch (interaction.action) {
      case 'view':
        baseWeight = 0.1;
        break;
      case 'time_spent':
        baseWeight = Math.min(interaction.value / 300, 1) * 0.5;
        break;
      case 'scroll':
        baseWeight = Math.min(interaction.value / 100, 1) * 0.3;
        break;
      case 'click_related':
        baseWeight = 0.4;
        break;
      case 'share':
        baseWeight = 0.6;
        break;
      default:
        baseWeight = 0;
    }

    return baseWeight * (0.5 + similarity / 2);
  }

  private async saveRecommendations(
    articleId: string,
    recommendations: {
      contentBased: ScoredRecommendation[];
      collaborative: ScoredRecommendation[];
      hybrid: ScoredRecommendation[];
    },
  ): Promise<void> {
    const recommendation: Recommendation = new Recommendation();

    recommendation.articleId = articleId;
    recommendation.contentBasedRecs = recommendations.contentBased.map((rec) => ({
      articleId: rec.articleId,
      similarity: rec.similarity,
      reasons: rec.reasons,
    }));
    recommendation.collaborativeRecs = recommendations.collaborative.map((rec) => ({
      articleId: rec.articleId,
      score: rec.behavioralScore,
      confidence: rec.finalScore,
    }));
    recommendation.hybridRecs = recommendations.hybrid.map((rec) => ({
      articleId: rec.articleId,
      finalScore: rec.finalScore,
      contentScore: rec.contentScore,
      behavioralScore: rec.behavioralScore,
      reasons: rec.reasons,
    }));

    await this.recommendationRepository.save(recommendation);
  }
}
