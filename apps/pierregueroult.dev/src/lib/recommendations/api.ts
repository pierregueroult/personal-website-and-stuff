import { InteractionAction } from '@repo/db/enum/blog/action';

import { env } from '@/lib/env/client';
import { Logger } from '@/lib/logger';

const logger = new Logger('RecommendationsAPI');

/**
 * Payload for tracking user interactions with blog posts
 */
export interface TrackInteractionPayload {
  articleId: string;
  action: InteractionAction;
  value?: number;
  metadata?: string;
}

/**
 * Response format for blog post recommendations
 */
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

/**
 * Response format for trending blog posts
 */
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

/**
 * Track user interaction with a blog post
 * 
 * Sends interaction data to the backend for analytics and personalized recommendations.
 * All requests include credentials to maintain anonymous session tracking.
 * 
 * @param payload - Interaction data (articleId, action, optional value and metadata)
 */
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

/**
 * Get personalized recommendations for a blog post
 * 
 * Fetches hybrid recommendations combining content-based filtering (similar articles)
 * and collaborative filtering (based on user behavior patterns).
 * 
 * @param articleId - The ID of the current article
 * @param maxResults - Maximum number of recommendations to return (default: 5)
 * @returns Array of recommended articles with scores and reasons
 */
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

/**
 * Get trending blog posts
 * 
 * Fetches articles with high engagement (views, scroll depth, time spent)
 * within a specified time window.
 * 
 * @param max - Maximum number of trending posts to return (default: 5)
 * @param days - Time window in days to consider (default: 7)
 * @returns Array of trending articles with engagement metrics
 */
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

/**
 * Get debug information about the current user's profile
 * 
 * Fetches the anonymous user profile data including interests, interactions,
 * and behavioral patterns. Useful for debugging and testing recommendations.
 * 
 * @returns User profile debug data or null if unavailable
 */
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
