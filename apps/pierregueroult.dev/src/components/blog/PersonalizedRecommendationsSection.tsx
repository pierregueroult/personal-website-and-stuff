import { Suspense } from 'react';
import { Recommendations } from './RecommendationsLogic';
import { getPersonalizedRecommendationsSSR, type RecommendationItem } from '@/lib/recommendations/ssr';

interface PersonalizedRecommendationsSectionProps {
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

async function PersonalizedRecommendationsContent({ 
  articleId, 
  maxResults, 
  children 
}: Omit<PersonalizedRecommendationsSectionProps, 'fallback'>) {
  const recommendations = await getPersonalizedRecommendationsSSR(articleId, maxResults);
  
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

export function PersonalizedRecommendationsSection({ 
  articleId, 
  maxResults = 5, 
  fallback = <div>Chargement des recommandations personnalisées...</div>,
  children 
}: PersonalizedRecommendationsSectionProps) {
  return (
    <Suspense fallback={fallback}>
      <PersonalizedRecommendationsContent 
        articleId={articleId}
        maxResults={maxResults}
      >
        {children}
      </PersonalizedRecommendationsContent>
    </Suspense>
  );
}