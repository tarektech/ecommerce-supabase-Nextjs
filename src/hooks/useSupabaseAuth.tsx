import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService'; // Import profileService
import { authService } from '@/services/authService'; // Import authService

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // If user logs in, ensure they exist in our profiles table
      if (session?.user) {
        ensureUserProfile(session.user);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // If we have a user, ensure they exist in our profiles table
      if (session?.user) {
        ensureUserProfile(session.user);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Ensure user exists in the profiles table
  const ensureUserProfile = async (user: User) => {
    try {
      // Get user email from auth - use the User object's email first, then try to fetch if not available
      let userEmail = user.email || '';

      if (!userEmail) {
        console.log(
          'Email not available in user object, fetching from auth service...'
        );
        try {
          const authUserEmail = await authService.getCurrentUserEmail();
          if (authUserEmail) {
            userEmail = authUserEmail;
            console.log(
              'Successfully fetched email from auth service:',
              userEmail
            );
          }
        } catch (emailError) {
          console.error('Error fetching email from auth service:', emailError);
        }
      }

      // Check if user profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('profile_id, email')
        .eq('profile_id', user.id)
        .single();

      // Create profile if it doesn't exist yet
      if (!existingProfile || checkError) {
        // Use profileService instead
        const newProfile = await profileService.createProfile({
          profile_id: user.id,
          username: '',
          avatar_url: '',
          email: userEmail, // Use email from auth
          created_at: new Date().toISOString(),
        });

        if (!newProfile) {
          // Check if this is a duplicate key error (which means the profile was already created)
          // This helps prevent console errors when multiple auth events try to create the same profile
          console.log(
            'Profile creation returned null - checking if profile exists anyway'
          );
          const { data: checkAgain } = await supabase
            .from('profiles')
            .select('profile_id')
            .eq('profile_id', user.id)
            .single();

          if (!checkAgain) {
            console.error(
              'Error creating user profile - profile does not exist'
            );
          } else {
            console.log(
              'Profile already exists despite error, proceeding normally'
            );
          }
        }
      } else if (existingProfile && !existingProfile.email && userEmail) {
        // Update profile with email if it's missing but we have it from auth
        console.log('Updating profile with email from auth:', userEmail);
        await profileService.updateProfile(user.id, { email: userEmail });
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      // Don't throw - we'll handle this on profile page visit
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Signed in successfully');
    } catch (error) {
      toast.error('Failed to sign in');
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // If signup is successfully and we have a user, ensure profile exists
      if (data?.user) {
        await ensureUserProfile(data.user);
      }

      toast.success('Signed up successfully');
    } catch (error) {
      toast.error('Failed to sign up');
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out user:', user?.email);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Explicitly clear user and session state
      setUser(null);
      setSession(null);

      console.log('Sign out complete, state cleared');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { user, session, loading, signIn, signUp, signOut };
}
