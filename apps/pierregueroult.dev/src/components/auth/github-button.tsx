'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/components/button';
import { env } from '@/lib/env/client';
import { GitHubIcon } from '@repo/ui/icons/github';

export function GitHubButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    window.location.href = `${env.NEXT_PUBLIC_API_URL}/auth/github`;
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
          <GitHubIcon />
          <span className="ml-2">Connect with GitHub</span>
        </>
      )}
    </Button>
  );
}
