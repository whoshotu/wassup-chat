import type { SlangItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SlangListProps {
  slangItems: SlangItem[];
  compact?: boolean;
}

export function SlangList({ slangItems, compact = false }: SlangListProps) {
  if (slangItems.length === 0) {
    return null;
  }

  return (
    <Card className={compact ? 'p-2.5' : 'p-4'}>
      <div className="flex items-center gap-2 mb-2">
        <Info className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Slang & Phrases</h3>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {slangItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b-0">
            <AccordionTrigger className={`${compact ? 'py-2 text-xs' : 'py-2.5 text-sm'} font-medium hover:no-underline`}>
              <span className="text-primary">{item.term}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className={`space-y-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
                <div>
                  <span className="font-medium text-muted-foreground">Meaning: </span>
                  <span>{item.meaning}</span>
                </div>
                {item.region && (
                  <div>
                    <span className="font-medium text-muted-foreground">Region: </span>
                    <span className="text-muted-foreground">{item.region}</span>
                  </div>
                )}
                {item.notes && (
                  <div>
                    <span className="font-medium text-muted-foreground">Note: </span>
                    <span className="text-muted-foreground">{item.notes}</span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
