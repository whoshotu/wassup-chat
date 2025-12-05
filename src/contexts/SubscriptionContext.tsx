/**
 * Subscription Context
 * Provides subscription state and upgrade modal throughout the app
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Subscription, PlanType } from '@/types';
import { subscriptionService, PLANS } from '@/services/subscriptionService';

interface SubscriptionContextType {
  subscription: Subscription;
  isPro: boolean;
  canDecode: () => { allowed: boolean; reason?: string; remaining?: number };
  recordDecode: () => void;
  getRemainingDecodes: () => number;
  isLanguageAvailable: (language: string) => boolean;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  upgradeReason: string;
  promptUpgrade: (reason: string) => void;
  updateSubscription: (subscription: Subscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const SUBSCRIPTION_KEY = 'wassup_subscription';

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription>(() => {
    const stored = localStorage.getItem(SUBSCRIPTION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return subscriptionService.createDefaultSubscription();
  });
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Persist subscription changes
  useEffect(() => {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  }, [subscription]);

  const isPro = subscriptionService.isPro(subscription);

  const canDecode = useCallback(() => {
    return subscriptionService.canDecode(subscription);
  }, [subscription]);

  const recordDecode = useCallback(() => {
    subscriptionService.recordDecode();
  }, []);

  const getRemainingDecodes = useCallback(() => {
    return subscriptionService.getRemainingDecodes(subscription);
  }, [subscription]);

  const isLanguageAvailable = useCallback((language: string) => {
    return subscriptionService.isLanguageAvailable(language, subscription);
  }, [subscription]);

  const promptUpgrade = useCallback((reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  }, []);

  const updateSubscription = useCallback((newSubscription: Subscription) => {
    setSubscription(newSubscription);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isPro,
        canDecode,
        recordDecode,
        getRemainingDecodes,
        isLanguageAvailable,
        showUpgradeModal,
        setShowUpgradeModal,
        upgradeReason,
        promptUpgrade,
        updateSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export { PLANS };
