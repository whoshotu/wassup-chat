/**
 * Pricing Page
 * Shows plan comparison and checkout options
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useSubscription, PLANS } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService } from '@/services/subscriptionService';
import { useToast } from '@/components/ui/use-toast';
import { Check, Sparkles, Crown, ArrowLeft, Zap, X } from 'lucide-react';
import type { PlanType } from '@/types';

export function PricingPage() {
  const { subscription, isPro, updateSubscription } = useSubscription();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const handleSelectPlan = async (planType: PlanType) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    if (planType === 'free') {
      // Downgrade to free (in production, this would cancel subscription)
      updateSubscription({
        planType: 'free',
        isActive: true,
      });
      navigate('/decoder');
      return;
    }

    setLoadingPlan(planType);

    try {
      // Create Stripe checkout session
      const checkoutUrl = await subscriptionService.getCheckoutUrl(planType, user?.id || '');
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
      setLoadingPlan(null);
    }
  };

  const freePlan = PLANS.free;
  const proPlan = PLANS.pro_monthly;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-pt">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Wassup</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/decoder">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to App
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4">Pricing</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Creator-Friendly Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free Plan */}
          <Card className="p-6 relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Perfect for trying out Wassup
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {freePlan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Limited to 3 languages</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>No favorites</span>
              </li>
            </ul>

            <Button 
              variant="outline" 
              className="w-full h-11"
              onClick={() => handleSelectPlan('free')}
              disabled={subscription.planType === 'free'}
            >
              {subscription.planType === 'free' ? 'Current Plan' : 'Start Free'}
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-6 relative border-primary/50 bg-primary/5">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Most Popular
            </Badge>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Pro
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">${proPlan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Everything you need for live streaming
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {proPlan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <Button 
                className="w-full h-11"
                onClick={() => handleSelectPlan('pro_monthly')}
                disabled={loadingPlan === 'pro_monthly' || subscription.planType === 'pro_monthly'}
              >
                {loadingPlan === 'pro_monthly' ? (
                  'Processing...'
                ) : subscription.planType === 'pro_monthly' ? (
                  'Current Plan'
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Go Monthly - ${PLANS.pro_monthly.price}/mo
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* All Pro Options */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-center mb-6">All Pro Options</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Weekly */}
            <Card className={`p-5 cursor-pointer transition-all hover:border-primary/50 ${subscription.planType === 'pro_weekly' ? 'border-primary' : ''}`}>
              <div className="text-center">
                <h4 className="font-semibold mb-1">Weekly</h4>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-2xl font-bold">${PLANS.pro_weekly.price}</span>
                  <span className="text-sm text-muted-foreground">/week</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Try Pro risk-free</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleSelectPlan('pro_weekly')}
                  disabled={loadingPlan === 'pro_weekly' || subscription.planType === 'pro_weekly'}
                >
                  {loadingPlan === 'pro_weekly' ? 'Processing...' : subscription.planType === 'pro_weekly' ? 'Current' : 'Go Weekly'}
                </Button>
              </div>
            </Card>

            {/* Monthly */}
            <Card className={`p-5 cursor-pointer transition-all hover:border-primary/50 border-primary/30 ${subscription.planType === 'pro_monthly' ? 'border-primary' : ''}`}>
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">Popular</Badge>
              <div className="text-center">
                <h4 className="font-semibold mb-1">Monthly</h4>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-2xl font-bold">${PLANS.pro_monthly.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Most flexible</p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleSelectPlan('pro_monthly')}
                  disabled={loadingPlan === 'pro_monthly' || subscription.planType === 'pro_monthly'}
                >
                  {loadingPlan === 'pro_monthly' ? 'Processing...' : subscription.planType === 'pro_monthly' ? 'Current' : 'Go Monthly'}
                </Button>
              </div>
            </Card>

            {/* Yearly */}
            <Card className={`p-5 cursor-pointer transition-all hover:border-primary/50 ${subscription.planType === 'pro_yearly' ? 'border-primary' : ''}`}>
              <Badge variant="secondary" className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">Best Value</Badge>
              <div className="text-center">
                <h4 className="font-semibold mb-1">Yearly</h4>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-2xl font-bold">${PLANS.pro_yearly.price}</span>
                  <span className="text-sm text-muted-foreground">/year</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Save 67%</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleSelectPlan('pro_yearly')}
                  disabled={loadingPlan === 'pro_yearly' || subscription.planType === 'pro_yearly'}
                >
                  {loadingPlan === 'pro_yearly' ? 'Processing...' : subscription.planType === 'pro_yearly' ? 'Current' : 'Go Yearly'}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-6">Questions?</h2>
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-1">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Cancel anytime from your account settings. You'll keep Pro access until the end of your billing period.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold mb-1">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and PayPal through our secure Stripe payment system.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold mb-1">Is my payment information secure?</h4>
              <p className="text-sm text-muted-foreground">
                Absolutely. All payments are processed by Stripe. We never see or store your card details.
              </p>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Secure payments powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
