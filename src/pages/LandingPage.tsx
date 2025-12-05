import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Globe, Zap, Shield, Languages, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-pt">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Wassup</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-10 md:py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Wassup - Decode What Your Viewers Are{' '}
            <span className="text-primary">Really Saying</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A chat decoder that helps performers understand what viewers are really saying in slang and foreign languages.
            No language barriers, just clear communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Example Decoded Message */}
        <Card className="max-w-2xl mx-auto p-4 sm:p-6 shadow-xl border-border/50">
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Original Message</p>
              <p className="text-base sm:text-lg font-medium">¡Hola hermosa! 😍 Eres increíble bb</p>
              <div className="flex items-center gap-2 mt-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Spanish • Latin America</span>
              </div>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Decoded Meaning</p>
              <p className="text-base text-foreground">
                This viewer is saying: "Hello beautiful! You're incredible baby". They're being
                friendly and complimentary. This is a common way Spanish-speaking viewers show
                appreciation.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                  Friendly
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                  Compliment
                </span>
                <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-medium">
                  Flirty
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Features Section */}
      <div className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Everything You Need to Understand Your Audience
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Decoding</h3>
              <p className="text-sm text-muted-foreground">
                Decode slang and foreign languages in seconds - understand what viewers really mean
              </p>
            </Card>
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Slang & Language Decoder</h3>
              <p className="text-sm text-muted-foreground">
                Decode regional phrases, internet slang, and foreign expressions performers encounter
              </p>
            </Card>
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Tone Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Know if they're being friendly, flirty, or crossing boundaries
              </p>
            </Card>
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Reply Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Get suggestions on how to respond appropriately
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Break Down Language Barriers?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Join content creators who are connecting better with their international audience
        </p>
        <Link to="/signup">
          <Button size="lg" className="h-12 px-8 text-base">Start Decoding Messages Now</Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Wassup. Built for performers worldwide.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
