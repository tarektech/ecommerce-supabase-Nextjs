import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProfileCard } from '@/components/ProfileCard';
import { OrderCard } from '@/components/OrderCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyOrdersState } from '@/components/EmptyOrdersState';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/utils/supabase';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);

  // Get profile data from custom hook
  const {
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl,
    email,
    setEmail,
    createdAt,
    orders,
    loading,
    isSaving,
    saveProfile,
  } = useProfile(user);

  // Handle saving profile data
  const handleSaveProfile = async (
    usernameInput: string,
    emailInput: string,
    avatarUrlInput: string
  ) => {
    console.log('ProfilePage - Saving profile with input values:', {
      usernameInput,
      emailInput,
      avatarUrlInput,
    });

    // Update the useProfile hook's state with the input values
    setUsername(usernameInput);
    setEmail(emailInput);
    setAvatarUrl(avatarUrlInput);

    // Save with the input values
    await saveProfile(usernameInput, emailInput, avatarUrlInput);
  };

  // Add a handler for auth email updates
  const handleUpdateEmail = async (newEmail: string) => {
    try {
      // This will send a verification email to the new address
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
      throw error; // Re-throw to be handled by the modal
    }
  };

  // Listen for auth state changes and update profile when auth email changes
  useEffect(() => {
    if (!user || loading) return;

    // When auth user email changes (after verification), update profile
    if (user.email && user.email !== email) {
      console.log('Auth email updated, syncing profile email:', user.email);
      // Only update the email, preserve other fields
      saveProfile(username, user.email, avatarUrl);
      // Update local state
      setEmail(user.email);
    }
  }, [user, email, username, avatarUrl, saveProfile, loading]);

  // Check authentication status
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthLoading(false);
      if (!user) {
        navigate('/sign-in');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

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
        createdAt={createdAt}
        isSaving={isSaving}
        onSaveProfile={handleSaveProfile}
        onSignOut={handleSignOut}
        onUpdateEmail={handleUpdateEmail}
      />

      <h2 className="text-2xl font-bold mb-4">My Orders</h2>

      {loading || authLoading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyOrdersState onBrowseProducts={() => navigate('/')} />
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
