import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShieldAlert, X, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { ToneType } from '@/types';

interface QuickReplyGuidanceProps {
  toneTags: ToneType[];
  compact?: boolean;
}

export function QuickReplyGuidance({ toneTags, compact = false }: QuickReplyGuidanceProps) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: 'Guidance',
      description: getActionGuidance(action),
    });
  };

  const getActionGuidance = (action: string): string => {
    const guidance: Record<string, string> = {
      thank: 'Smile and acknowledge their compliment with a warm thank you.',
      boundary: 'Politely but firmly set a boundary. Keep it respectful.',
      ignore: "It's okay to ignore messages that make you uncomfortable.",
      engage: 'Great opportunity to engage! Ask them a question.',
    };
    return guidance[action] || 'Choose how you want to respond.';
  };

  const hasPositiveTone = toneTags.some((tag) =>
    ['friendly', 'compliment', 'question', 'grateful', 'excited'].includes(tag)
  );
  const hasNegativeTone = toneTags.some((tag) =>
    ['negative', 'rude', 'insult', 'sexual'].includes(tag)
  );

  return (
    <Card className={compact ? 'p-2.5' : 'p-4'}>
      <h3 className={`font-semibold ${compact ? 'text-xs mb-2' : 'text-sm mb-3'}`}>
        Quick Reply Guidance
      </h3>
      <div className={`grid grid-cols-2 ${compact ? 'gap-1.5' : 'gap-2'}`}>
        {hasPositiveTone && (
          <>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1.5 justify-start ${compact ? 'h-9 text-xs' : 'h-10'} touch-target`}
              onClick={() => handleAction('thank')}
            >
              <Heart className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-emerald-400`} />
              <span>Thank</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1.5 justify-start ${compact ? 'h-9 text-xs' : 'h-10'} touch-target`}
              onClick={() => handleAction('engage')}
            >
              <MessageCircle className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-blue-400`} />
              <span>Engage</span>
            </Button>
          </>
        )}
        {hasNegativeTone && (
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-1.5 justify-start ${compact ? 'h-9 text-xs' : 'h-10'} touch-target`}
            onClick={() => handleAction('boundary')}
          >
            <ShieldAlert className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-orange-400`} />
            <span>Boundary</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1.5 justify-start ${compact ? 'h-9 text-xs' : 'h-10'} touch-target`}
          onClick={() => handleAction('ignore')}
        >
          <X className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
          <span>Ignore</span>
        </Button>
      </div>
    </Card>
  );
}
