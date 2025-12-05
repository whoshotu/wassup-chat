import { MobileNav } from '@/components/layout/MobileNav';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Card } from '@/components/ui/card';
import { Shield, AlertTriangle, Heart, Info } from 'lucide-react';

export function SafetyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-lg border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Info className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold">Safety & Info</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl space-y-4">
        {/* Platform Rules */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg mb-1">Platform Rules & Guidelines</h2>
              <p className="text-sm text-muted-foreground">
                Understanding your viewers is important, but always follow your platform's terms of service and community guidelines.
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm ml-13">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Always comply with your streaming platform's content policies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Respect age restrictions and content ratings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Report harassment or abusive behavior to platform moderators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Never share personal information with viewers</span>
            </li>
          </ul>
        </Card>

        {/* Setting Boundaries */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg mb-1">Setting Boundaries</h2>
              <p className="text-sm text-muted-foreground">
                You have the right to set clear boundaries with your audience.
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>It's okay to ignore or block viewers who make you uncomfortable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>You don't owe anyone a response, especially to inappropriate messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>Use platform moderation tools to manage your chat</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>Trust your instincts - if something feels wrong, it probably is</span>
            </li>
          </ul>
        </Card>

        {/* Positive Engagement */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg mb-1">Building Positive Connections</h2>
              <p className="text-sm text-muted-foreground">
                Use this tool to foster better relationships with your international audience.
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>Acknowledge and appreciate viewers who are respectful and supportive</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>Learn common greetings in your viewers' languages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>Cultural differences exist - what's friendly in one culture might be different in another</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>Building a positive community takes time and consistent boundaries</span>
            </li>
          </ul>
        </Card>

        {/* About This Tool */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg mb-1">About Chat Decoder</h2>
              <p className="text-sm text-muted-foreground">
                This tool is designed to help content creators understand international viewer messages quickly and accurately.
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <p>
              <strong className="text-foreground">What we do:</strong>{' '}
              <span className="text-muted-foreground">We analyze messages to detect language, explain slang, and identify tone to help you respond appropriately.</span>
            </p>
            <p>
              <strong className="text-foreground">What we don't do:</strong>{' '}
              <span className="text-muted-foreground">We don't teach languages, translate for replies, or make decisions for you about how to engage with viewers.</span>
            </p>
            <p>
              <strong className="text-foreground">Privacy:</strong>{' '}
              <span className="text-muted-foreground">Your decoded messages are stored locally on your device. We don't share your data with third parties.</span>
            </p>
          </div>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}

export default SafetyPage;
