/**
 * Usage Indicator Component
 * Shows remaining decodes for free users
 */

import { useSubscription, PLANS } from '@/contexts/SubscriptionContext';
import { Zap } from 'lucide-react';

interface UsageIndicatorProps {
  compact?: boolean;
}

export function UsageIndicator({ compact = false }: UsageIndicatorProps) {
  const { isPro, getRemainingDecodes } = useSubscription();

  if (isPro) {
    return (
      <div className={`flex items-center gap-1.5 text-primary ${compact ? 'text-xs' : 'text-sm'}`}>
        <Zap className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        <span>Unlimited</span>
      </div>
    );
  }

  const remaining = getRemainingDecodes();
  const total = PLANS.free.decodesPerDay;
  const percentage = (remaining / total) * 100;

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className={`flex items-center gap-1.5 ${remaining === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
        <Zap className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        <span>{remaining}/{total} decodes left</span>
      </div>
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${remaining === 0 ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default UsageIndicator;
