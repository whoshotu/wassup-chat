import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Globe, Heart, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white gradient-text">Wassup</span>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6"
            onClick={() => navigate("/decoder")}
          >
            Start Decoding
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Truly Free & Unlimited</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
          Decode what your <br /> 
          <span className="gradient-text">viewers are really saying.</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900">
          Understand international slang, detect hidden tones, and calculate the vibe of any chat message in seconds. No limits, no subscriptions, just pure decoding.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Button 
            size="lg"
            className="h-14 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => navigate("/decoder")}
          >
            Try the Decoder
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="h-14 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-lg transition-all"
            onClick={() => navigate("/auth")}
          >
            Create Free Account
          </Button>
        </div>

        {/* Mockup Preview */}
        <div className="mt-24 relative max-w-5xl mx-auto animate-in zoom-in duration-1000">
          <div className="absolute inset-0 bg-primary/30 blur-[100px] rounded-full opacity-20" />
          
          <div className="relative bg-[#121216]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 shadow-2xl overflow-hidden">
            <div className="bg-[#0a0a0c] rounded-[1.5rem] overflow-hidden border border-white/5 flex flex-col md:flex-row">
              {/* Left Side: Input Mockup */}
              <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  <span className="ml-2 text-[10px] uppercase tracking-widest font-bold text-slate-600">Decoder Input</span>
                </div>
                
                <div className="bg-[#121216] border border-white/5 rounded-2xl p-5 mb-6 shadow-inner">
                  <p className="text-slate-400 text-sm leading-relaxed italic">
                    "hola mi amor, te extrañé mucho!! <span className="text-primary font-bold">&lt;3</span>"
                  </p>
                </div>
                
                <div className="space-y-4 opacity-50">
                  <div className="h-2 w-1/3 bg-white/5 rounded-full" />
                  <div className="h-10 w-full bg-primary/20 rounded-xl border border-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary uppercase tracking-tighter">Decoding...</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Result Mockup */}
              <div className="w-full md:w-1/2 p-8 bg-black/20">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded-lg">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Live Demo</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Heart key={s} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Translation</span>
                    <p className="text-xl font-bold text-white leading-tight">
                      {"That's life, my friend! <3"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['French', 'Excited', 'Friendly'].map(tag => (
                      <div key={tag} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
                        {tag}
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">Suggested Response</span>
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-sm text-slate-300">
                      "Keep the energy up! Maybe ask what they like about the stream?"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Powerful insights for creators.</h2>
            <p className="text-slate-500">Everything you need to master your international chat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Auto-detect Slang",
                desc: "We decode internet slang and cultural idioms that traditional translators miss."
              },
              {
                icon: Heart,
                title: "Tone Analysis",
                desc: "Identify if a message is flirty, aggressive, or genuinely grateful instantly."
              },
              {
                icon: Zap,
                title: "Vibe Score",
                desc: "Get an mathematical calculation of the chat sentiment on a 5-heart scale."
              }
            ].map((f, i) => (
              <div key={i} className="bg-[#121216] border border-white/10 p-8 rounded-3xl hover:border-primary/50 transition-colors group">
                <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust/Utility Section */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-6">Designed for performers, <br />by creators.</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Managing a global audience is hard. Wassup makes it easier by giving you the context you need to build deeper connections with every viewer, anywhere in the world.
            </p>
            <div className="space-y-4">
              {[
                "100% Free Forever",
                "No Daily Limits",
                "Multi-language Support",
                "Privacy Focused"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-1 rounded-full">
                    <Shield className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
            <p className="text-slate-400 mb-8">Join the community of creators using Wassup today.</p>
            <Button 
              size="lg"
              className="h-14 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
              onClick={() => navigate("/decoder")}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 text-center text-slate-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
           <Sparkles className="w-4 h-4 opacity-40" />
           <span className="font-bold tracking-tighter uppercase text-slate-500">Wassup Decoder</span>
        </div>
        <p>&copy; 2026 Wassup. Truly free and unlimited.</p>
      </footer>
    </div>
  );
}
