import { Suspense } from 'react';
import ProfileClientPage from './ProfileClientPage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { profileServerService } from '@/services/profile/profileServerService';
import { orderServerService } from '@/services/order/orderServerService';

export default async function ProfilePage() {
  const supabase = await createServerSupabase();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch initial data
  const [profile, orders] = await Promise.all([
    profileServerService.getProfileById(user.id),
    orderServerService.getOrders(user.id),
  ]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfileClientPage
        initialProfile={profile}
        initialOrders={orders || []}
        user={user}
      />
    </Suspense>
  );
}
