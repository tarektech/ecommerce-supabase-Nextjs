'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Something went wrong!
          </CardTitle>
          <CardDescription>
            We encountered an unexpected error. This has been logged and
            we&apos;ll look into it.
          </CardDescription>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              Error ID: {error.digest}
            </p>
          )}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={reset} className="cursor-pointer w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="cursor-pointer w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
