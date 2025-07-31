import { GitHubButton } from '@/components/auth/github-button';
import { Alert, AlertTitle, AlertDescription } from '@repo/ui/components/alert';

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const error = (await searchParams).error;

  return (
    <main className="flex h-screen items-center justify-center">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === 'github_auth_failed'
              ? 'GitHub authentication failed. Please try again.'
              : 'An unknown error occurred. Please try again later.'}
          </AlertDescription>
        </Alert>
      )}
      <GitHubButton />
    </main>
  );
}
