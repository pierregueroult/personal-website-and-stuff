import { InteractionAction } from '@repo/db/enum/blog/action';

import { env } from '@/lib/env/client';
import { Logger } from '@/lib/logger';

const logger = new Logger('RecommendationsAPI');

export interface TrackInteractionPayload {
  articleId: string;
  action: InteractionAction;
  value?: number;
  metadata?: string;
}

export interface RecommendationResponse {
  articleId: string;
  title: string;
  slug: string;
  tags: string[];
  finalScore: number;
  contentScore: number;
  behavioralScore: number;
  reasons: string[];
  similarity?: number;
}

export interface TrendingResponse {
  articleId: string;
  title: string;
  slug: string;
  tags: string[];
  trendingScore: number;
  viewCount: number;
  engagement: number;
  reasons: string[];
}

// Track user interaction
export async function trackInteraction(payload: TrackInteractionPayload): Promise<void> {
  try {
    await fetch(`${env.NEXT_PUBLIC_API_URL}/blog/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important pour les cookies
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logger.error('Failed to track interaction:', error);
  }
}

// Get recommendations for an article
export async function getRecommendations(
  articleId: string,
  maxResults = 5,
): Promise<RecommendationResponse[]> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/blog/recommendations/${articleId}?max=${maxResults}`,
      {
        credentials: 'include', // Important pour les cookies
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch recommendations:', error);
    return [];
  }
}

// Get trending articles
export async function getTrending(max: number = 5, days: number = 7): Promise<TrendingResponse[]> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/blog/trending?max=${max}&days=${days}`,
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch trending:', error);
    return [];
  }
}

// Get user profile debug info
export async function getProfileDebug() {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/blog/profile/debug`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch profile debug:', error);
    return null;
  }
}
