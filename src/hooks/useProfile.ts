import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { OrderType } from '@/types';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';
import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';
import {
  isProfileAccessError,
  handleCommonErrors,
} from '@/utils/errorHandling';
import { useNavigate } from 'react-router-dom';
import { PostgrestError } from '@supabase/supabase-js';
import { ProfileType } from '@/types';

// Types for auth user update data
type AuthUpdateData = {
  email?: string;
  data?: {
    display_name?: string;
  };
};

type ProfileData = {
  username: string;
  avatarUrl: string;
  email: string;
  createdAt: string | null;
  orders: OrderType[];
  loading: boolean;
  isSaving: boolean;
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setAvatarUrl: (url: string) => void;
  saveProfile: (
    usernameInput?: string,
    emailInput?: string,
    avatarUrlInput?: string
  ) => Promise<void>;
};

export function useProfile(user: User | null): ProfileData {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    fetchUserData(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // Fetch user's email either from user object or auth service
  const fetchUserEmail = async (user: User): Promise<string> => {
    let userEmail = user.email || '';

    if (!userEmail) {
      const authUserEmail = await authService.getCurrentUserEmail();
      if (authUserEmail) {
        userEmail = authUserEmail;
      }
    }

    return userEmail;
  };

  // Sync profile data with state and database if needed
  const syncProfileData = async (
    profile: ProfileType,
    userEmail: string,
    userId: string
  ) => {
    // Update local state
    setUsername(profile.username || '');
    setEmail(profile.email || userEmail);
    setAvatarUrl(profile.avatar_url || '');
    setCreatedAt(profile.created_at);

    // If profile email is empty but we have auth email, update the database
    if (!profile.email && userEmail) {
      await profileService.updateProfile(userId, {
        email: userEmail,
      });
    }
  };

  // Fetch user orders
  const fetchUserOrders = async (userId: string) => {
    const { data: orderData, error: orderError } =
      await orderService.getUserOrders(userId);

    if (orderError) {
      handleCommonErrors(orderError, {
        context: 'fetching orders',
        showToast: false,
        silentOnNoRows: true,
      });
    } else {
      setOrders((orderData as unknown as OrderType[]) || []);
    }
  };

  // Main function to fetch all user data
  const fetchUserData = async (user: User) => {
    try {
      setLoading(true);
      const userEmail = await fetchUserEmail(user);

      // Get user profile
      const profile = await profileService.getProfileById(user.id);
      const profileError = !profile
        ? ({
            message: 'Profile not found',
            code: 'PGRST116',
          } as PostgrestError)
        : null;

      // Handle profile not found or RLS error
      if (profileError && isProfileAccessError(profileError)) {
        const newProfile = await profileService.createProfile({
          profile_id: user.id,
          username: '',
          avatar_url: '',
          email: userEmail,
          created_at: new Date().toISOString(),
        });

        if (!newProfile) {
          navigate('/sign-in');
          return;
        }

        await syncProfileData(newProfile, userEmail, user.id);
      } else if (profileError) {
        // Handle other profile errors
        handleCommonErrors(profileError, { context: 'fetching profile' });
      } else if (profile) {
        // Update profile state and sync email if needed
        await syncProfileData(profile, userEmail, user.id);
      }

      // Fetch user orders
      await fetchUserOrders(user.id);
    } catch (error) {
      handleCommonErrors(error, { context: 'fetching user data' });
    } finally {
      setLoading(false);
    }
  };

  // Handle profile updates
  const saveProfile = async (
    usernameInput?: string,
    emailInput?: string,
    avatarUrlInput?: string
  ) => {
    if (!user) return;

    try {
      setIsSaving(true);

      // Use provided inputs or current state values
      const usernameToSave = usernameInput ?? username;
      const emailToSave = emailInput ?? email;
      const avatarUrlToSave = avatarUrlInput ?? avatarUrl;

      // Check for changes
      const emailChanged = emailToSave !== user.email;
      const usernameChanged = usernameToSave !== username;

      // Don't proceed with empty username if we had one before
      if (!usernameToSave && username) {
        console.warn(
          'Preventing profile update with empty username when previous username exists'
        );
        return;
      }

      // Update profile in database
      const profileData = {
        username: usernameToSave,
        email: emailToSave,
        avatar_url: avatarUrlToSave,
      };

      const updatedProfile = await profileService.updateProfile(
        user.id,
        profileData
      );

      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }

      // Update auth user data if email or username changed
      if (emailChanged || usernameChanged) {
        const updateData: AuthUpdateData = {};

        if (emailChanged) {
          updateData.email = emailToSave;
        }

        if (usernameChanged && usernameToSave) {
          updateData.data = {
            display_name: usernameToSave,
          };
        }

        const authUser = await authService.updateUser(updateData);

        if (!authUser) {
          const errorMessage =
            emailChanged && usernameChanged
              ? 'Profile updated but failed to update email and display name in authentication system.'
              : emailChanged
              ? 'Profile updated but failed to update email in authentication system.'
              : 'Profile updated but failed to update display name in authentication system.';

          toast.error(errorMessage);
        }
      }
    } catch (error) {
      handleCommonErrors(error, { context: 'updating profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    username,
    avatarUrl,
    email,
    createdAt,
    orders,
    loading,
    isSaving,
    setUsername,
    setEmail,
    setAvatarUrl,
    saveProfile,
  };
}
