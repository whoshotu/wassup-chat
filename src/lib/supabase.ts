/**
 * Supabase Client Configuration
 * Initialize Supabase client for auth and database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a mock client for when Supabase is not configured
const createMockClient = (): SupabaseClient => {
  const mockResponse = { data: null, error: { message: 'Supabase not configured' } };
  const mockQuery = () => ({
    select: () => mockQuery(),
    insert: () => mockQuery(),
    update: () => mockQuery(),
    delete: () => mockQuery(),
    eq: () => mockQuery(),
    single: () => Promise.resolve(mockResponse),
    order: () => mockQuery(),
    limit: () => mockQuery(),
    or: () => mockQuery(),
    then: (resolve: any) => resolve(mockResponse),
  });

  return {
    auth: {
      signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
    },
    from: () => mockQuery(),
  } as unknown as SupabaseClient;
};

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Using local storage fallback.');
}

export default supabase;
