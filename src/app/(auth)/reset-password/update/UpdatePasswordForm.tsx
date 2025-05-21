'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function UpdatePasswordForm({ message }: { message: string | null }) {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if we have the hash fragment from the URL (Supabase authentication flow)
  useEffect(() => {
    // When the component mounts, check if we're in the hash fragment flow
    const checkHashParams = () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'recovery') {
          // We have a valid recovery flow from email link
          console.log('Valid recovery flow detected');

          // Set the access token in Supabase to authenticate the user
          // This is important - without this, updateUser won't work
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
        }
      }
    };

    // Check hash params immediately and also listen for hash changes
    checkHashParams();
    window.addEventListener('hashchange', checkHashParams);

    return () => {
      window.removeEventListener('hashchange', checkHashParams);
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // According to the Supabase docs, we use updateUser to set the new password
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      if (data) {
        toast.success('Password updated successfully!');

        // Redirect to sign in page after successful password update
        setTimeout(() => {
          router.push(
            '/signin?message=Your password has been updated successfully. Please sign in with your new password.'
          );
        }, 2000);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while updating your password';
      setError(errorMessage);
      console.error('Password update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-primary/15 text-green-500 text-sm p-3 rounded-md">
            {message}
          </div>
        )}
        <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-md mb-2">
          Enter your new password below. You must have clicked the password
          reset link from your email to complete this process.
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••"
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••"
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={toggleConfirmPasswordVisibility}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showConfirmPassword ? 'Hide password' : 'Show password'}
              </span>
            </button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          type="submit"
          className="w-full cursor-pointer hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
        <div className="mt-4 text-center text-sm">
          Remember your password?{' '}
          <Link
            href="/signin"
            className="text-primary underline cursor-pointer hover:text-primary/90"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
