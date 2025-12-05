import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ToneType } from '@/types';

interface ToneTagProps {
  tone: ToneType | string;
}

const toneConfig: Record<string, { color: string; label: string }> = {
  friendly: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Friendly' },
  compliment: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Compliment' },
  flirty: { color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', label: 'Flirty' },
  sexual: { color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', label: 'Sexual' },
  question: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Question' },
  request: { color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', label: 'Request' },
  joke: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Joke' },
  joking: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Joking' },
  sarcastic: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Sarcastic' },
  neutral: { color: 'bg-muted text-muted-foreground border-border', label: 'Neutral' },
  rude: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Rude' },
  insult: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Insult' },
  negative: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Negative' },
  confused: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Confused' },
  excited: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Excited' },
  grateful: { color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', label: 'Grateful' },
};

export function ToneTag({ tone }: ToneTagProps) {
  const config = toneConfig[tone.toLowerCase()] || toneConfig.neutral;

  return (
    <Badge variant="outline" className={cn('font-medium text-xs', config.color)}>
      {config.label}
    </Badge>
  );
}
