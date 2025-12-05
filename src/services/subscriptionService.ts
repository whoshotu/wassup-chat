/**
 * Subscription Service
 * Handles plan limits, usage tracking, and Stripe integration
 */

import type { PlanType, Subscription, UserProfile } from '@/types';

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
   * Get Stripe checkout URL
   * Creates a Stripe checkout session
   */
  async getCheckoutUrl(planType: PlanType, userId: string): Promise<string> {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType,
        userId,
        successUrl: `${window.location.origin}/decoder?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    return url;
  },

  /**
   * Get Stripe billing portal URL
   * Creates a Stripe billing portal session
   */
  async getBillingPortalUrl(customerId: string): Promise<string> {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/settings`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create billing portal session');
    }

    const { url } = await response.json();
    return url;
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
