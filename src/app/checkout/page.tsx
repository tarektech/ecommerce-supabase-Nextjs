import {
  createServerSupabase,
  getAuthenticatedUser,
} from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CheckoutClientPage from '@/app/checkout/CheckoutClientPage';

// This is a Server Component by default, no need for 'use client'
export default async function CheckoutPage() {
  // Get authenticated user (server-side)
  const user = await getAuthenticatedUser();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect('/signin');
  }

  // Get Supabase client for server-side data fetching
  const supabase = await createServerSupabase();

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, email')
    .eq('id', user.id)
    .single();

  // Use profile data if available, otherwise fallback to auth data
  const username = profile?.username || null;
  const email = profile?.email || user.email;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-md mx-auto">
        <CheckoutClientPage username={username} email={email} />
      </div>
    </div>
  );
}
