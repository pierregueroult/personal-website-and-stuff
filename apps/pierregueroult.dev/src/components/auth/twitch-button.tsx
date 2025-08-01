'use client';

import { Button } from '@repo/ui/components/button';
import { TwitchIcon } from '@repo/ui/icons/twitch';

import { useState } from 'react';

import { env } from '@/lib/env/client';

export function TwitchButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    window.location.href = `${env.NEXT_PUBLIC_API_URL}/auth/twitch`;
  };

  return (
    <Button
      variant="outline"
      className="flex-1"
      type="button"
      disabled={isLoading === true}
      onClick={handleClick}
    >
      {isLoading === true ? (
        <div className="flex items-center justify-center">
          <span>Signing in...</span>
        </div>
      ) : (
        <>
          <TwitchIcon />
          <span className="ml-2">Connect with Twitch</span>
        </>
      )}
    </Button>
  );
}
