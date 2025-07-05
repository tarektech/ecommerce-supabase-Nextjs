'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  description?: string;
  showRetry?: boolean;
  showHomeButton?: boolean;
  onRetry?: () => void;
  error?: Error | null;
  type?: 'network' | 'not-found' | 'permission' | 'general';
}

export function ErrorState({
  title,
  description,
  showRetry = true,
  showHomeButton = true,
  onRetry,
  error,
  type = 'general',
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="h-8 w-8 text-destructive" />,
          title: title || 'Connection Error',
          description:
            description ||
            'Unable to connect to the server. Please check your internet connection.',
        };
      case 'not-found':
        return {
          icon: <AlertCircle className="h-8 w-8 text-muted-foreground" />,
          title: title || 'No Data Found',
          description: description || 'The requested data could not be found.',
        };
      case 'permission':
        return {
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: title || 'Access Denied',
          description:
            description || "You don't have permission to access this resource.",
        };
      default:
        return {
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: title || 'Something went wrong',
          description:
            description ||
            'An unexpected error occurred while loading the data.',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {config.icon}
          </div>
          <CardTitle className="text-xl font-bold">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
          {error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium">
                Error details
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="cursor-pointer w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Button asChild variant="outline" className="cursor-pointer w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
