'use client';

import { InteractionAction } from '@repo/db/enum/blog/action';

import { useCallback, useEffect, useRef } from 'react';

import { trackInteraction } from '@/lib/recommendations/api';

interface UseTrackingOptions {
  articleId: string;
  enabled?: boolean;
}

export function useTracking({ articleId, enabled = true }: UseTrackingOptions) {
  const startTime = useRef<number>(Date.now());
  const lastScrollPosition = useRef<number>(0);
  const hasTrackedView = useRef<boolean>(false);

  // Track page view (une seule fois)
  useEffect(() => {
    if (!enabled || hasTrackedView.current) return;

    hasTrackedView.current = true;
    trackInteraction({
      articleId,
      action: InteractionAction.VIEW,
    });
  }, [articleId, enabled]);

  // Track scroll behavior
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

      // Track significant scroll changes (every 25%)
      if (scrollPercentage >= lastScrollPosition.current + 25) {
        lastScrollPosition.current = Math.floor(scrollPercentage / 25) * 25;

        trackInteraction({
          articleId,
          action: InteractionAction.SCROLL,
          value: scrollPercentage,
          metadata: JSON.stringify({
            scrollPercentage,
            timeOnPage: Date.now() - startTime.current,
          }),
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articleId, enabled]);

  // Track time spent when leaving page
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);

      // Use sendBeacon for reliable tracking on page unload
      navigator.sendBeacon(
        '/api/blog/interactions',
        JSON.stringify({
          articleId,
          action: InteractionAction.TIME_SPENT,
          value: timeSpent,
        }),
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [articleId, enabled]);

  // Manual tracking functions
  const trackClick = useCallback(
    (type: string) => {
      trackInteraction({
        articleId,
        action: InteractionAction.CLICK_RELATED,
        metadata: JSON.stringify({ clickType: type }),
      });
    },
    [articleId],
  );

  const trackShare = useCallback(() => {
    trackInteraction({
      articleId,
      action: InteractionAction.SHARE,
    });
  }, [articleId]);

  return {
    trackClick,
    trackShare,
  };
}
