export interface RecommendationContext {
  sessionId?: string;
  currentArticleId: string;
  includeContentBased?: boolean;
  includeCollaborative?: boolean;
  maxResults?: number;
}

export interface TrendingContext {
  maxResults?: number;
  timeWindowDays?: number;
  excludeArticleIds?: string[];
}

export interface ScoredRecommendation {
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

export interface TrendingRecommendation {
  articleId: string;
  title: string;
  slug: string;
  tags: string[];
  trendingScore: number;
  viewCount: number;
  engagement: number;
  reasons: string[];
}

export interface Behavior {
  avgReadTime: number;
  preferredLength: 'short' | 'medium' | 'long';
  activeHours: number[];
  readingPattern: 'scanner' | 'deep_reader' | 'mixed';
}
