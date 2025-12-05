/**
 * Onboarding Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { decoderService } from '@/services/decoderService';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Loader2 } from 'lucide-react';

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [viewerRegions, setViewerRegions] = useState<string[]>([]);
  const { updateProfile, status } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const supportedLanguages = decoderService.getSupportedLanguages();
  const commonRegions = decoderService.getCommonRegions();

  const handleRegionToggle = (region: string) => {
    setViewerRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const handleComplete = async () => {
    const success = await updateProfile({
      primaryLanguage,
      commonRegions: viewerRegions,
    });
    
    if (success) {
      toast({
        title: 'Profile setup complete!',
        description: "You're all set to start decoding messages.",
      });
      navigate('/decoder');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-end safe-area-pt">
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of 2</span>
              <div className="flex gap-2">
                <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} />
                <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {step === 1 ? "What's your primary language?" : 'Where are your viewers from?'}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? 'This helps us provide better translations and explanations'
                : 'Select the regions where most of your viewers are located'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Primary Language</Label>
                  <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                    <SelectTrigger id="language" className="h-11">
                      <SelectValue placeholder="Select your language" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!primaryLanguage}
                  className="w-full h-11 text-base"
                >
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto scrollbar-thin p-1">
                  {commonRegions.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={region}
                        checked={viewerRegions.includes(region)}
                        onCheckedChange={() => handleRegionToggle(region)}
                      />
                      <label
                        htmlFor={region}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                    Back
                  </Button>
                  <Button onClick={handleComplete} className="flex-1 h-11" disabled={status.isLoading}>
                    {status.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OnboardingPage;
