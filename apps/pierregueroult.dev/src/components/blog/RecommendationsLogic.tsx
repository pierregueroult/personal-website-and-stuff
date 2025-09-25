import { trackInteraction } from '@/lib/recommendations/api';
import { InteractionAction } from '@repo/db/enum/blog/action';
import type { RecommendationItem } from '@/lib/recommendations/ssr';

interface RecommendationsProps {
  recommendations: RecommendationItem[];
  currentArticleId: string;
  maxResults?: number;
  children: (props: {
    recommendations: RecommendationItem[];
    trackRecommendationClick: (recommendedArticleId: string) => void;
    isEmpty: boolean;
    count: number;
  }) => React.ReactNode;
}

export function Recommendations({ 
  recommendations, 
  currentArticleId, 
  maxResults = 5,
  children 
}: RecommendationsProps) {
  
  const trackRecommendationClick = async (recommendedArticleId: string) => {
    try {
      await trackInteraction({
        articleId: currentArticleId,
        action: InteractionAction.CLICK_RELATED,
        metadata: JSON.stringify({
          recommendedArticleId,
          clickType: 'recommendation_click'
        }),
      });
    } catch (error) {
      console.error('Failed to track recommendation click:', error);
    }
  };

  const limitedRecommendations = recommendations.slice(0, maxResults);
  
  return (
    <>
      {children({
        recommendations: limitedRecommendations,
        trackRecommendationClick,
        isEmpty: limitedRecommendations.length === 0,
        count: limitedRecommendations.length,
      })}
    </>
  );
}