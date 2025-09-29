'use client';

import { InteractionAction } from '@repo/db/enum/blog/action';

import { useEffect, useRef } from 'react';

import { env } from '@/lib/env/client';
import { trackInteraction } from '@/lib/recommendations/api';

interface BlogTrackingProps {
  articleId: string;
}

export function BlogTracking({ articleId }: BlogTrackingProps) {
  const startTime = useRef<number>(Date.now());
  const lastScrollPosition = useRef<number>(0);
  const hasTrackedView = useRef<boolean>(false);

  useEffect(() => {
    if (hasTrackedView.current) return;

    hasTrackedView.current = true;
    trackInteraction({
      articleId,
      action: InteractionAction.VIEW,
    });
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

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
  }, [articleId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);

      navigator.sendBeacon(
        `${env.NEXT_PUBLIC_API_URL}/blog/interactions`,
        JSON.stringify({
          articleId,
          action: InteractionAction.TIME_SPENT,
          value: timeSpent,
        }),
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const timeSpent = Math.round((Date.now() - startTime.current) / 1000);

        trackInteraction({
          articleId,
          action: InteractionAction.TIME_SPENT,
          value: timeSpent,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [articleId]);

  return null;
}
