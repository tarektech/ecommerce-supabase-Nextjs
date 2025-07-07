import { supabase } from './supabase';

// Function to test Supabase connection
export async function testSupabaseConnection() {
  try {
    // console.log('Testing Supabase connection...');

    // Try a simple query that requires authentication
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error };
    }

    // console.log('Supabase connection successful!');
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error during Supabase connection test:', err);
    return { success: false, error: err };
  }
}

// Run the test immediately
testSupabaseConnection();
