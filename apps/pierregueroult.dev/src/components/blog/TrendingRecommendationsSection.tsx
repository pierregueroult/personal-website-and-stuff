import { Suspense } from 'react';

import { type RecommendationItem, getTrendingRecommendationsSSR } from '@/lib/recommendations/ssr';

import { Recommendations } from './RecommendationsLogic';

interface TrendingRecommendationsSectionProps {
  articleId: string;
  maxResults?: number;
  fallback?: React.ReactNode;
  children: (props: {
    recommendations: RecommendationItem[];
    trackRecommendationClick: (recommendedArticleId: string) => void;
    isEmpty: boolean;
    count: number;
  }) => React.ReactNode;
}

async function TrendingRecommendationsContent({
  articleId,
  maxResults,
  children,
}: Omit<TrendingRecommendationsSectionProps, 'fallback'>) {
  const recommendations = await getTrendingRecommendationsSSR(articleId, maxResults);

  return (
    <Recommendations
      recommendations={recommendations}
      currentArticleId={articleId}
      maxResults={maxResults}
    >
      {children}
    </Recommendations>
  );
}

export function TrendingRecommendationsSection({
  articleId,
  maxResults = 5,
  fallback = <div>Chargement des articles populaires...</div>,
  children,
}: TrendingRecommendationsSectionProps) {
  return (
    <Suspense fallback={fallback}>
      <TrendingRecommendationsContent articleId={articleId} maxResults={maxResults}>
        {children}
      </TrendingRecommendationsContent>
    </Suspense>
  );
}
