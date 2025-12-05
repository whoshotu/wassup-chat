/**
 * Forgot Password Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { authService } from '@/services/authService';
import { Sparkles, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setIsSubmitted(true);
      toast({
        title: 'Check your email',
        description: 'If an account exists, you will receive reset instructions.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Link to="/login" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to login</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              {isSubmitted ? (
                <CheckCircle className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isSubmitted ? 'Check Your Email' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {isSubmitted 
                ? 'We sent password reset instructions to your email.'
                : 'Enter your email and we\'ll send you reset instructions.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-4">
                <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Email sent to:</p>
                    <p className="text-muted-foreground">{email}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
                <Link to="/login">
                  <Button className="w-full h-11">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}

            {!isSubmitted && (
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Remember your password? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
