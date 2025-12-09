/**
 * Subscription Service
 * Handles plan limits, usage tracking, and Stripe integration
 */

import type { PlanType, Subscription, UserProfile } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Plan configuration
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    decodesPerDay: 5,
    languages: ['English', 'Spanish', 'French'],
    historyLimit: 20,
    features: [
      '5 decodes per day',
      '3 languages',
      'Basic tone detection',
      'Limited history (20 messages)',
    ],
  },
  pro_weekly: {
    name: 'Pro Weekly',
    price: 9.99,
    period: 'week',
    decodesPerDay: -1, // unlimited
    languages: 'all',
    historyLimit: -1, // unlimited
    features: [
      'Unlimited decodes',
      'All 15+ languages',
      'Advanced tone & slang detection',
      'Unlimited history & favorites',
      'Priority support',
    ],
  },
  pro_monthly: {
    name: 'Pro Monthly',
    price: 19.99,
    period: 'month',
    decodesPerDay: -1,
    languages: 'all',
    historyLimit: -1,
    features: [
      'Unlimited decodes',
      'All 15+ languages',
      'Advanced tone & slang detection',
      'Unlimited history & favorites',
      'Priority support',
    ],
  },
  pro_yearly: {
    name: 'Pro Yearly',
    price: 79.99,
    period: 'year',
    decodesPerDay: -1,
    languages: 'all',
    historyLimit: -1,
    features: [
      'Unlimited decodes',
      'All 15+ languages',
      'Advanced tone & slang detection',
      'Unlimited history & favorites',
      'Priority support',
      'Best value - Save 67%',
    ],
  },
} as const;

// Free plan language restrictions
const FREE_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese'];

// Storage keys
const USAGE_KEY = 'wassup_usage';

interface UsageData {
  decodesUsedToday: number;
  lastDecodeDate: string;
}

// Get today's date string
const getTodayString = () => new Date().toISOString().split('T')[0];

// Get usage data from storage
const getUsageData = (): UsageData => {
  const stored = localStorage.getItem(USAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    // Reset if it's a new day
    if (data.lastDecodeDate !== getTodayString()) {
      return { decodesUsedToday: 0, lastDecodeDate: getTodayString() };
    }
    return data;
  }
  return { decodesUsedToday: 0, lastDecodeDate: getTodayString() };
};

// Save usage data
const saveUsageData = (data: UsageData) => {
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
};

/**
 * Subscription Service
 */
export const subscriptionService = {
  /**
   * Check if user has an active Pro subscription
   */
  isPro(subscription: Subscription | undefined): boolean {
    if (!subscription) return false;
    return subscription.isActive && subscription.planType !== 'free';
  },

  /**
   * Get plan details
   */
  getPlanDetails(planType: PlanType) {
    return PLANS[planType] || PLANS.free;
  },

  /**
   * Check if user can decode (based on daily limits)
   */
  canDecode(subscription: Subscription | undefined): { allowed: boolean; reason?: string; remaining?: number } {
    const isPro = this.isPro(subscription);
    
    if (isPro) {
      return { allowed: true, remaining: -1 }; // unlimited
    }

    const usage = getUsageData();
    const limit = PLANS.free.decodesPerDay;
    const remaining = limit - usage.decodesUsedToday;

    if (remaining <= 0) {
      return {
        allowed: false,
        reason: 'You\'ve reached your daily decode limit. Upgrade to Pro for unlimited decodes!',
        remaining: 0,
      };
    }

    return { allowed: true, remaining };
  },

  /**
   * Record a decode usage
   */
  recordDecode(): void {
    const usage = getUsageData();
    usage.decodesUsedToday += 1;
    usage.lastDecodeDate = getTodayString();
    saveUsageData(usage);
  },

  /**
   * Get remaining decodes for today
   */
  getRemainingDecodes(subscription: Subscription | undefined): number {
    if (this.isPro(subscription)) return -1; // unlimited
    
    const usage = getUsageData();
    return Math.max(0, PLANS.free.decodesPerDay - usage.decodesUsedToday);
  },

  /**
   * Check if language is available for user's plan
   */
  isLanguageAvailable(language: string, subscription: Subscription | undefined): boolean {
    if (this.isPro(subscription)) return true;
    return FREE_LANGUAGES.includes(language);
  },

  /**
   * Get available languages for user's plan
   */
  getAvailableLanguages(subscription: Subscription | undefined, allLanguages: string[]): string[] {
    if (this.isPro(subscription)) return allLanguages;
    return allLanguages.filter(lang => FREE_LANGUAGES.includes(lang));
  },

  /**
   * Get history limit for user's plan
   */
  getHistoryLimit(subscription: Subscription | undefined): number {
    if (this.isPro(subscription)) return -1; // unlimited
    return PLANS.free.historyLimit;
  },

  /**
   * Create default subscription (free plan)
   */
  createDefaultSubscription(): Subscription {
    return {
      planType: 'free',
      isActive: true,
    };
  },

  /**
   * Create Stripe Checkout Session and return redirect URL
   * Uses Supabase Edge Function for secure server-side Stripe integration
   */
  async getCheckoutUrl(planType: PlanType, userId: string): Promise<string> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to subscribe');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planType }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('Checkout URL not returned from API');
    }

    return data.url as string;
  },

  /**
   * Create Stripe Billing Portal Session and return redirect URL
   * Uses Supabase Edge Function for secure server-side Stripe integration
   */
  async getBillingPortalUrl(): Promise<string> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to manage your subscription');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create billing portal session');
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('Billing portal URL not returned from API');
    }

    return data.url as string;
  },

  /**
   * Format plan renewal text
   */
  formatRenewalText(subscription: Subscription): string {
    if (!subscription.isActive || subscription.planType === 'free') {
      return 'Free plan';
    }

    const plan = PLANS[subscription.planType];
    if (!plan || !('period' in plan)) return 'Pro plan';

    if (subscription.cancelAtPeriodEnd) {
      const endDate = subscription.currentPeriodEnd 
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
        : 'soon';
      return `Cancels on ${endDate}`;
    }

    const renewDate = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
      : 'soon';
    
    return `Renews ${plan.period}ly on ${renewDate}`;
  },
};

export default subscriptionService;
