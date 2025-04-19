'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProfileCard } from '@/components/ProfileCard';
import { OrderCard } from '@/components/OrderCard';
import { EmptyOrdersState } from '@/components/EmptyOrdersState';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { OrderType, ProfileType } from '@/types';

interface ProfileClientPageProps {
  initialProfile: ProfileType | null;
  initialOrders: OrderType[];
  user: User;
}

export default function ProfileClientPage({
  initialProfile,
  initialOrders,
  user,
}: ProfileClientPageProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  // Initialize state with server-fetched data
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || '');
  const [email, setEmail] = useState(initialProfile?.email || user.email || '');
  const [orders, setOrders] = useState<OrderType[]>(initialOrders);
  const [isSaving, setIsSaving] = useState(false);

  // Handle saving profile data
  const handleSaveProfile = async (
    usernameInput: string,
    emailInput: string,
    avatarUrlInput: string
  ) => {
    try {
      setIsSaving(true);

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          username: usernameInput,
          email: emailInput,
          avatar_url: avatarUrlInput,
        })
        .eq('profile_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUsername(updatedProfile.username || '');
      setEmail(updatedProfile.email || '');
      setAvatarUrl(updatedProfile.avatar_url || '');

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a handler for auth email updates
  const handleUpdateEmail = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success(
        'Verification email sent! Please check your inbox and click the verification link.'
      );
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update email'
      );
      throw error;
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Subscribe to realtime order updates
  useEffect(() => {
    const orderSubscription = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch updated orders
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id);
          if (data) setOrders(data as OrderType[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [user.id]);

  return (
    <div className="container mx-auto py-6 px-4">
      <ProfileCard
        user={user}
        username={username}
        setUsername={setUsername}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        email={email}
        setEmail={setEmail}
        createdAt={initialProfile?.created_at || null}
        isSaving={isSaving}
        onSaveProfile={handleSaveProfile}
        onSignOut={handleSignOut}
        onUpdateEmail={handleUpdateEmail}
      />

      <h2 className="text-2xl font-bold mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <EmptyOrdersState onBrowseProducts={() => router.push('/')} />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
