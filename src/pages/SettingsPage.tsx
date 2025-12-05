import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MobileNav } from '@/components/layout/MobileNav';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription, PLANS } from '@/contexts/SubscriptionContext';
import { decoderService } from '@/services/decoderService';
import { subscriptionService } from '@/services/subscriptionService';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, User, Settings, Moon, Sun, Globe, Crown, CreditCard, Zap } from 'lucide-react';

export function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { subscription, isPro } = useSubscription();
  const [primaryLanguage, setPrimaryLanguage] = useState(user?.primaryLanguage || 'English');
  const [viewerRegions, setViewerRegions] = useState<string[]>(user?.commonRegions || []);
  const navigate = useNavigate();
  const { toast } = useToast();

  const supportedLanguages = decoderService.getSupportedLanguages();
  const commonRegions = decoderService.getCommonRegions();

  const handleRegionToggle = (region: string) => {
    setViewerRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const handleSave = async () => {
    await updateProfile({
      primaryLanguage,
      commonRegions: viewerRegions,
    });
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const planDetails = PLANS[subscription.planType];
  const renewalText = subscriptionService.formatRenewalText(subscription);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-lg border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold">Settings</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl space-y-4">
        {/* Subscription Section */}
        <Card className={`p-4 sm:p-6 ${isPro ? 'bg-primary/5 border-primary/20' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </h2>
            <Badge className={isPro ? 'bg-primary/20 text-primary border-primary/30' : ''}>
              {isPro && <Crown className="h-3 w-3 mr-1" />}
              {planDetails.name}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className={subscription.isActive ? 'text-green-500' : 'text-muted-foreground'}>
                {subscription.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {isPro && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Billing</span>
                <span>{renewalText}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Decodes</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {isPro ? 'Unlimited' : `${planDetails.decodesPerDay}/day`}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Languages</span>
              <span>{isPro ? 'All 15+' : `${Array.isArray(planDetails.languages) ? planDetails.languages.length : 3} languages`}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            {isPro ? (
              <Button variant="outline" className="w-full" size="sm">
                Manage Billing
              </Button>
            ) : (
              <Link to="/pricing">
                <Button className="w-full" size="sm">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Profile Section */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Account Settings</p>
            </div>
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="p-4 sm:p-6">
          <h2 className="font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">Theme</p>
                <p className="text-xs text-muted-foreground">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="h-9">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </Card>

        {/* Language Settings */}
        <Card className="p-4 sm:p-6">
          <h2 className="font-semibold mb-4">Language Preferences</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Primary Language</Label>
              <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                <SelectTrigger id="language" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This is the language you speak and understand
              </p>
            </div>
          </div>
        </Card>

        {/* Viewer Countries */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Common Viewer Regions</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Select regions where most of your viewers are from
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto scrollbar-thin p-1">
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
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full h-11 text-base">
          Save Changes
        </Button>

        {/* Logout Button */}
        <Button onClick={handleLogout} variant="outline" className="w-full h-11">
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>

      <MobileNav />
    </div>
  );
}

export default SettingsPage;
