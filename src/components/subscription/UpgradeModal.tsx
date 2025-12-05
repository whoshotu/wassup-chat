/**
 * Upgrade Modal Component
 * Shows upgrade options when users hit limits
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PLANS } from '@/contexts/SubscriptionContext';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, upgradeReason } = useSubscription();
  const navigate = useNavigate();

  const handleViewPricing = () => {
    setShowUpgradeModal(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-center">
            {upgradeReason || 'Unlock unlimited decodes and all languages'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Quick comparison */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Pro Features
            </h4>
            <ul className="space-y-2">
              {PLANS.pro_monthly.features.slice(0, 4).map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Quick pricing options */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={handleViewPricing}>
              <p className="text-xs text-muted-foreground mb-1">Weekly</p>
              <p className="font-bold">${PLANS.pro_weekly.price}</p>
            </Card>
            <Card className="p-3 text-center cursor-pointer hover:border-primary/50 transition-colors border-primary/30" onClick={handleViewPricing}>
              <Badge className="text-[10px] px-1.5 py-0 mb-1">Popular</Badge>
              <p className="text-xs text-muted-foreground mb-1">Monthly</p>
              <p className="font-bold">${PLANS.pro_monthly.price}</p>
            </Card>
            <Card className="p-3 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={handleViewPricing}>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mb-1">Best Value</Badge>
              <p className="text-xs text-muted-foreground mb-1">Yearly</p>
              <p className="font-bold">${PLANS.pro_yearly.price}</p>
            </Card>
          </div>

          <Button onClick={handleViewPricing} className="w-full h-11" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            View All Plans
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeModal;
