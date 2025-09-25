import { cookies } from 'next/headers';

import { get } from '@/lib/fetch/server';

export interface RecommendationItem {
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

export interface TrendingItem {
  articleId: string;
  title: string;
  slug: string;
  tags: string[];
  trendingScore: number;
  viewCount: number;
  engagement: number;
  reasons: string[];
}

// Recommandations personnalisées (hybrides avec session)
export async function getPersonalizedRecommendationsSSR(
  articleId: string,
  maxResults = 5,
): Promise<RecommendationItem[]> {
  try {
    const cookieStore = await cookies();
    const anonymousId = cookieStore.get('anonymous-id')?.value;

    // Si pas de session, retourner array vide
    if (!anonymousId) {
      return [];
    }

    const { ok, data } = await get<RecommendationItem[]>(
      `/blog/recommendations/${articleId}?max=${maxResults}`,
      false, // pas de cache pour les recommandations personnalisées
    );

    if (!ok) {
      console.error('Failed to fetch personalized recommendations SSR');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching personalized recommendations SSR:', error);
    return [];
  }
}

// Articles tendances (content-based seulement, sans session)
export async function getTrendingRecommendationsSSR(
  articleId: string,
  maxResults = 5,
): Promise<RecommendationItem[]> {
  try {
    // On fait l'appel sans cookie pour forcer le mode content-based only
    const { ok, data } = await get<RecommendationItem[]>(
      `/blog/recommendations/${articleId}?max=${maxResults}`,
      false,
    );

    if (!ok) {
      console.error('Failed to fetch trending recommendations SSR');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching trending recommendations SSR:', error);
    return [];
  }
}

export async function getProfileDebugSSR() {
  try {
    const cookieStore = await cookies();
    const anonymousId = cookieStore.get('anonymous-id')?.value;

    if (!anonymousId) {
      return null;
    }

    const { ok, data } = await get('/blog/profile/debug', false);

    if (!ok) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile debug SSR:', error);
    return null;
  }
}

// Articles trending (pas de session nécessaire)
export async function getTrendingSSR(maxResults = 5, days = 7): Promise<TrendingItem[]> {
  try {
    const { ok, data } = await get<TrendingItem[]>(
      `/blog/trending?max=${maxResults}&days=${days}`,
      false, // Pas de session nécessaire pour trending
    );

    if (!ok) {
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching trending SSR:', error);
    return [];
  }
}
