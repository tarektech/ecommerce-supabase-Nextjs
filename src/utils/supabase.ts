import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variable state (remove in production)
// console.log('Supabase URL defined:', !!supabaseUrl);
// console.log('Supabase Key defined:', !!supabaseKey);
// console.log('Supabase URL:', supabaseUrl);
// Do not log the full key in production
// console.log(
//   'Supabase Key (first 10 chars):',
//   supabaseKey?.substring(0, 10) + '...'
// );

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:');
  console.error('URL defined:', !!supabaseUrl);
  console.error('Key defined:', !!supabaseKey);
  throw new Error('Missing Supabase environment variables');
}

// Create the Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Export auth specifically for auth operations
export const supabaseAuth = supabase.auth;
