/**
 * Plan Badge Component
 * Shows current plan status
 */

import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Crown, Sparkles } from 'lucide-react';

interface PlanBadgeProps {
  showIcon?: boolean;
  className?: string;
}

export function PlanBadge({ showIcon = true, className = '' }: PlanBadgeProps) {
  const { subscription, isPro } = useSubscription();

  if (isPro) {
    return (
      <Badge className={`bg-primary/20 text-primary border-primary/30 ${className}`}>
        {showIcon && <Crown className="h-3 w-3 mr-1" />}
        Pro
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      {showIcon && <Sparkles className="h-3 w-3 mr-1" />}
      Free
    </Badge>
  );
}

export default PlanBadge;
