import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock authentication
    setTimeout(() => {
      setLoading(false);
      navigate("/decoder");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col justify-center items-center p-6 relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full" />
      </div>

      <Button 
        variant="ghost" 
        className="absolute top-8 left-8 text-slate-500 hover:text-white flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Landing
      </Button>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Wassup</h1>
          <p className="text-slate-500 mt-2">Create your free account to save history</p>
        </div>

        <Card className="border-white/10 bg-[#121216]/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="pb-2">
            <div className="flex p-1 bg-[#0a0a0c] rounded-xl mb-4 border border-white/5">
                <button 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
            </div>
            <CardTitle className="text-xl">{isLogin ? 'Welcome Back' : 'Get Started'}</CardTitle>
            <CardDescription className="text-slate-500">
                {isLogin ? 'Enter your details to access your account' : 'Join the community of creators today'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-400">Full Name</Label>
                  <Input id="name" placeholder="John Doe" className="bg-[#0a0a0c] border-white/10 h-11" required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-400">Email Address</Label>
                <Input id="email" type="email" placeholder="name@example.com" className="bg-[#0a0a0c] border-white/10 h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass" className="text-slate-400">Password</Label>
                <Input id="pass" type="password" placeholder="••••••••" className="bg-[#0a0a0c] border-white/10 h-11" required />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl mt-4"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Free Account')}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#121216] px-2 text-slate-600">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center gap-3 transition-colors"
              onClick={handleSubmit}
            >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
               </svg>
               Google
            </Button>

            <p className="text-center text-xs text-slate-600 mt-8">
                By continuing, you agree to our Terms and Privacy Policy. <br />
                Wassup is 100% free and unlimited.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
