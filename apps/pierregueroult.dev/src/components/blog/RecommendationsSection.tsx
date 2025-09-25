import { Suspense } from 'react';

import { type RecommendationItem, getRecommendationsSSR } from '@/lib/recommendations/ssr';

import { Recommendations } from './RecommendationsLogic';

interface RecommendationsSectionProps {
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

async function RecommendationsContent({
  articleId,
  maxResults,
  children,
}: Omit<RecommendationsSectionProps, 'fallback'>) {
  const recommendations = await getRecommendationsSSR(articleId, maxResults);

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

export function RecommendationsSection({
  articleId,
  maxResults = 5,
  fallback = <div>Chargement des recommandations...</div>,
  children,
}: RecommendationsSectionProps) {
  return (
    <Suspense fallback={fallback}>
      <RecommendationsContent articleId={articleId} maxResults={maxResults}>
        {children}
      </RecommendationsContent>
    </Suspense>
  );
}
