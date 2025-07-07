'use client';

import { createClientSupabase } from './client';

/**
 * Helper function to get the authenticated user from client-side
 */
export async function getClientUser() {
  const supabase = createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper function to get user profile data from client-side
 */
export async function getUserProfile(userId: string) {
  const supabase = createClientSupabase();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('profile_id', userId)
    .single();

  return data;
}

/**
 * Helper function to get products from client-side
 */
export async function getProducts() {
  const supabase = createClientSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Helper function to get current session from client-side
 */
export async function getClientSession() {
  const supabase = createClientSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
