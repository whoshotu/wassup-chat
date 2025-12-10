/**
 * Wassup - Main decoding screen
 * Supports both full-page and overlay/narrow layouts
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileNav } from '@/components/layout/MobileNav';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ToneTag } from '@/components/decoder/ToneTag';
import { SlangList } from '@/components/decoder/SlangList';
import { QuickReplyGuidance } from '@/components/decoder/QuickReplyGuidance';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { UsageIndicator } from '@/components/subscription/UsageIndicator';
import { decoderService } from '@/services/decoderService';
import { historyService } from '@/services/historyService';
import { useLayout } from '@/hooks/useLayout';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Globe, Save, Sparkles, AlertCircle, RotateCcw, Copy, Check, Crown, Lock } from 'lucide-react';
import type { DecodeResponse, ToneType } from '@/types';

export function DecoderPage() {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecodeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { isOverlay, isNarrow } = useLayout();
  const { toast } = useToast();
  const { canDecode, recordDecode, isLanguageAvailable, promptUpgrade, isPro } = useSubscription();

  const handleDecode = useCallback(async () => {
    if (!inputText.trim()) {
      toast({
        title: 'No message to decode',
        description: 'Please paste a message first.',
        variant: 'destructive',
      });
      return;
    }

    // Check usage limits
    const usageCheck = canDecode();
    if (!usageCheck.allowed) {
      promptUpgrade(usageCheck.reason || 'Upgrade to Pro for unlimited decodes!');
      return;
    }

    // Check language availability
    if (selectedLanguage && selectedLanguage !== 'auto' && !isLanguageAvailable(selectedLanguage)) {
      promptUpgrade(`Upgrade to Pro to decode ${selectedLanguage} messages!`);
      return;
    }

    setIsDecoding(true);
    setError(null);
    
    try {
      const decoded = await decoderService.decodeMessage({
        text: inputText,
        sourceLang: selectedLanguage === 'auto' ? undefined : selectedLanguage,
        targetLang: 'English',
      });
      setResult(decoded);
      // Record usage after successful decode
      recordDecode();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decode message';
      setError(errorMessage);
      toast({
        title: 'Decoding failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDecoding(false);
    }
  }, [inputText, selectedLanguage, toast, canDecode, isLanguageAvailable, promptUpgrade, recordDecode]);

  const handleSave = useCallback(() => {
    if (result) {
      historyService.add(result);
      toast({
        title: 'Saved!',
        description: 'Message added to history.',
      });
    }
  }, [result, toast]);

  const handleCopyExplanation = useCallback(async () => {
    if (result?.plainExplanation) {
      await navigator.clipboard.writeText(result.plainExplanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleNewMessage = useCallback(() => {
    setInputText('');
    setResult(null);
    setSelectedLanguage('auto');
    setError(null);
  }, []);

  const supportedLanguages = decoderService.getSupportedLanguages();

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header - Compact for overlay mode */}
      <header className="bg-card/95 backdrop-blur-lg border-b border-border sticky top-0 z-10 safe-area-pt">
        <div className={`mx-auto px-3 py-2 ${isOverlay ? 'max-w-full' : 'container max-w-4xl'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`${isOverlay ? 'w-7 h-7' : 'w-8 h-8'} bg-primary rounded-lg flex items-center justify-center`}>
                <Sparkles className={`${isOverlay ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-primary-foreground`} />
              </div>
              <h1 className={`font-bold ${isOverlay ? 'text-base' : 'text-lg'}`}>Wassup</h1>
              <PlanBadge showIcon={false} className="ml-1" />
            </div>
            <div className="flex items-center gap-2">
              <UsageIndicator compact={isOverlay} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className={`flex-1 mx-auto px-3 py-3 w-full ${isOverlay ? 'max-w-full' : 'container max-w-4xl'}`}>
        {/* Upgrade banner for free users */}
        {!isPro && (
          <Card className="p-3 mb-3 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm">Unlock unlimited decodes & all languages</span>
              </div>
              <Link to="/pricing">
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  Upgrade
                </Button>
              </Link>
            </div>
          </Card>
        )}

        <div className={`${isNarrow ? 'space-y-3' : 'grid lg:grid-cols-2 gap-4'}`}>
          {/* Input Section */}
          <div className="space-y-3">
            <Card className={`${isOverlay ? 'p-3' : 'p-4'}`}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Paste Chat Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Paste the message you want to decode..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className={`${isOverlay ? 'min-h-[100px]' : 'min-h-[140px]'} text-base resize-none`}
                    disabled={isDecoding}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="language" className="text-sm font-medium">
                    Language (Optional)
                  </Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language" className="h-10">
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      {supportedLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleDecode}
                  disabled={isDecoding || !inputText.trim()}
                  className="w-full h-11 text-base font-medium touch-target"
                  size="lg"
                >
                  {isDecoding ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Decoding...
                    </>
                  ) : (
                    'Decode Message'
                  )}
                </Button>
              </div>
            </Card>

            {/* Error State */}
            {error && !isDecoding && (
              <Card className="p-3 border-destructive/50 bg-destructive/10 animate-fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive text-sm">Error</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-3">
            {result ? (
              <div className="space-y-3 animate-slide-up">
                {/* Language Detection */}
                <Card className={`${isOverlay ? 'p-2.5' : 'p-3'}`}>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="font-medium">{result.detectedLanguage}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{result.region}</span>
                  </div>
                </Card>

                {/* Translation - Most prominent section */}
                {result.detectedLanguage !== 'English' && result.translation && (
                  <Card className={`${isOverlay ? 'p-3' : 'p-4'} bg-blue-500/10 border-blue-500/30`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-blue-600 dark:text-blue-400">Translation</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 -mt-1 -mr-1"
                        onClick={async () => {
                          await navigator.clipboard.writeText(result.translation);
                          toast({ title: 'Copied!', description: 'Translation copied to clipboard.' });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                    <p className={`${isOverlay ? 'text-base' : 'text-lg'} font-medium leading-relaxed`}>
                      "{result.translation}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Original: "{result.originalText}"
                    </p>
                  </Card>
                )}

                {/* Tone Tags */}
                {result.toneTags.length > 0 && (
                  <Card className={`${isOverlay ? 'p-2.5' : 'p-3'}`}>
                    <h3 className="font-semibold text-sm mb-2">Tone</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.toneTags.map((tone: ToneType, index: number) => (
                        <ToneTag key={index} tone={tone} />
                      ))}
                    </div>
                  </Card>
                )}

                {/* Plain Explanation */}
                <Card className={`${isOverlay ? 'p-3' : 'p-4'} bg-primary/10 border-primary/20`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-primary">What They Mean</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 -mt-1 -mr-1"
                      onClick={handleCopyExplanation}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <div className={`${isOverlay ? 'text-sm' : 'text-base'} leading-relaxed space-y-3`}>
                    {result.plainExplanation.split('\n\n').map((paragraph, idx) => {
                      // Check if paragraph starts with **bold** markers
                      if (paragraph.startsWith('**')) {
                        const parts = paragraph.split('**').filter(Boolean);
                        return (
                          <div key={idx}>
                            {parts.map((part, partIdx) => (
                              partIdx % 2 === 0 ? (
                                <span key={partIdx} className="font-semibold text-primary">{part}</span>
                              ) : (
                                <span key={partIdx}>{part}</span>
                              )
                            ))}
                          </div>
                        );
                      }
                      return <p key={idx}>{paragraph}</p>;
                    })}
                  </div>
                </Card>

                {/* Slang List */}
                {result.slangItems.length > 0 && (
                  <SlangList slangItems={result.slangItems} compact={isOverlay} />
                )}

                {/* Suggested Responses */}
                {result.suggestedResponses && result.suggestedResponses.length > 0 && (
                  <Card className={`${isOverlay ? 'p-3' : 'p-4'} bg-green-500/10 border-green-500/30`}>
                    <h3 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-3">Suggested Responses</h3>
                    <div className="space-y-2">
                      {result.suggestedResponses.map((response, idx) => (
                        <button
                          key={idx}
                          onClick={async () => {
                            // Extract just the response text (after the colon if present)
                            const responseText = response.includes(':') 
                              ? response.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '')
                              : response;
                            await navigator.clipboard.writeText(responseText);
                            toast({ title: 'Copied!', description: 'Response copied to clipboard.' });
                          }}
                          className="w-full text-left p-2.5 rounded-lg bg-background hover:bg-accent transition-colors text-sm flex items-center gap-2 group"
                        >
                          <span className="flex-1">{response}</span>
                          <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Quick Reply Guidance */}
                <QuickReplyGuidance toneTags={result.toneTags} compact={isOverlay} />

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    variant="outline" 
                    className="flex-1 h-10 touch-target"
                  >
                    <Save className="mr-1.5 h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    onClick={handleNewMessage} 
                    className="flex-1 h-10 touch-target"
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    New
                  </Button>
                </div>
              </div>
            ) : (
              !isNarrow && (
                <Card className="p-6 text-center hidden lg:block">
                  <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1.5">Ready to Decode</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Paste a chat message and click "Decode Message" to see the translation and tone analysis.
                  </p>
                </Card>
              )
            )}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

export default DecoderPage;
