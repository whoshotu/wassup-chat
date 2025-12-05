/**
 * Authentication Service
 * Handles user authentication operations using Supabase
 */

import { supabase } from '@/lib/supabase';
import type { UserProfile, AuthCredentials, AuthResponse } from '@/types';

const STORAGE_KEY = 'chatDecoder_user';

/**
 * Auth Service - handles all authentication operations with Supabase
 */
export const authService = {
  /**
   * Sign up a new user
   */
  async signup(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;
      
      // Validation
      if (!email || !password) {
        return { user: null, error: 'Email and password are required' };
      }
      
      if (password.length < 6) {
        return { user: null, error: 'Password must be at least 6 characters' };
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Signup failed' };
      }

      // Create user profile
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email!,
        primaryLanguage: 'English',
        commonViewerLanguages: [],
        commonRegions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscription: { planType: 'free', isActive: true },
        decodesUsedToday: 0,
        lastDecodeDate: new Date().toISOString().split('T')[0],
      };

      // Save profile to Supabase
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: profile.id,
          email: profile.email,
          primary_language: profile.primaryLanguage,
          viewer_countries: profile.commonViewerLanguages,
          created_at: profile.createdAt,
          updated_at: profile.updatedAt,
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      return { user: profile, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Signup failed' };
    }
  },

  /**
   * Log in existing user
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;
      
      if (!email || !password) {
        return { user: null, error: 'Email and password are required' };
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Login failed' };
      }

      // Get user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        // Create profile if it doesn't exist
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email!,
          primaryLanguage: 'English',
          commonViewerLanguages: [],
          commonRegions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subscription: { planType: 'free', isActive: true },
          decodesUsedToday: 0,
          lastDecodeDate: new Date().toISOString().split('T')[0],
        };

        await supabase.from('users').insert([{
          id: profile.id,
          email: profile.email,
          primary_language: profile.primaryLanguage,
          viewer_countries: profile.commonViewerLanguages,
        }]);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        return { user: profile, error: null };
      }

      const profile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        primaryLanguage: profileData.primary_language || 'English',
        commonViewerLanguages: profileData.viewer_countries || [],
        commonRegions: [],
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
        subscription: { planType: 'free', isActive: true },
        decodesUsedToday: 0,
        lastDecodeDate: new Date().toISOString().split('T')[0],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      return { user: profile, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Login failed' };
    }
  },

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Get current logged in user
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileData) return null;

    const profile: UserProfile = {
      id: profileData.id,
      email: profileData.email,
      primaryLanguage: profileData.primary_language || 'English',
      commonViewerLanguages: profileData.viewer_countries || [],
      commonRegions: [],
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
      subscription: { planType: 'free', isActive: true },
      decodesUsedToday: 0,
      lastDecodeDate: new Date().toISOString().split('T')[0],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<AuthResponse> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { user: null, error: 'Not authenticated' };
      }
      
      const updatedProfile: UserProfile = {
        ...currentUser,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          primary_language: updatedProfile.primaryLanguage,
          viewer_countries: updatedProfile.commonViewerLanguages,
          updated_at: updatedProfile.updatedAt,
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Profile update error:', error);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      
      return { user: updatedProfile, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Update failed' };
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  },
};

export default authService;
