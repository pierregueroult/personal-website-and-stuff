import { Suspense } from 'react';

import { type TrendingItem, getTrendingSSR } from '@/lib/recommendations/ssr';

interface TrendingSectionProps {
  maxResults?: number;
  days?: number;
  className?: string;
}

interface TrendingListProps {
  recommendations: TrendingItem[];
}

function TrendingList({ recommendations }: TrendingListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        <div className="mb-2 text-4xl">📈</div>
        <p>Aucun article trending pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {recommendations.map((item, index) => (
        <div
          key={item.articleId}
          className="hover:bg-muted/50 group relative rounded-lg border p-4 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Rang */}
            <div className="flex-shrink-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  index === 0
                    ? 'bg-orange-500 text-white'
                    : index === 1
                      ? 'bg-orange-400 text-white'
                      : index === 2
                        ? 'bg-orange-300 text-white'
                        : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {/* Titre */}
              <h4 className="text-foreground group-hover:text-primary font-semibold transition-colors">
                <a href={`/blog/${item.slug}`} className="after:absolute after:inset-0">
                  {item.title}
                </a>
              </h4>

              {/* Stats trending */}
              <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span>🔥</span>
                  <span>{item.trendingScore.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span>👁️</span>
                  <span>{item.viewCount}</span>
                </div>

                {item.engagement > 0 && (
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{item.engagement.toFixed(1)}min</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-muted-foreground text-xs">+{item.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Raisons du trending */}
              {item.reasons.length > 0 && (
                <div className="mt-2">
                  <p className="text-muted-foreground text-xs">{item.reasons.join(' • ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="bg-muted h-5 w-12 animate-pulse rounded" />
                <div className="bg-muted h-5 w-16 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function TrendingContent({ maxResults = 5, days = 7 }: TrendingSectionProps) {
  const trendingItems = await getTrendingSSR(maxResults, days);

  return <TrendingList recommendations={trendingItems} />;
}

export function TrendingSection({ maxResults = 5, days = 7, className }: TrendingSectionProps) {
  return (
    <section className={className}>
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <span className="text-orange-500">🔥</span>
          Trending
          <span className="text-muted-foreground ml-1 text-sm font-normal">
            ({days} derniers jours)
          </span>
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Les articles les plus populaires récemment
        </p>
      </div>

      <Suspense fallback={<TrendingLoading />}>
        <TrendingContent maxResults={maxResults} days={days} />
      </Suspense>
    </section>
  );
}
