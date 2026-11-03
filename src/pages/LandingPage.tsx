import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Globe, Heart, Shield, Zap, Chrome, MousePointer2, Languages, Eye, Cpu, MessageSquare, BookOpen } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden">
      {/* Top Announcement Bar */}
      <a
        href="https://ko-fi.com/s/443060ea79"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-300 transition-all duration-300 group"
      >
        <div className="flex items-center justify-center gap-3 px-4 py-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/30 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-black/50" />
          </span>
          <p className="text-black text-xs sm:text-sm font-bold tracking-tight text-center">
            🚀 <strong className="font-black">NEW:</strong> Wassup Decoder Pro auto-translates foreign chat on Chaturbate, Stripchat, and other sites with chat.
          </p>
          <span className="hidden sm:flex items-center gap-1 bg-black/15 hover:bg-black/25 transition-colors text-black text-xs font-black px-3 py-1 rounded-full shrink-0">
            Get it on Ko-fi
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
      </a>
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
          <a
            href="https://ko-fi.com/s/443060ea79"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Pro extension
          </a>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6"
            onClick={() => navigate("/decoder")}
          >
            Open Decoder
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Free decoder · No sign-up</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
          Decode what your <br /> 
          <span className="gradient-text">viewers are really saying.</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900">
          Paste any chat message and get the language, tone, vibe, and reply suggestions in seconds. It runs in your browser, needs no account, and works without any key.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Button 
            size="lg"
            className="h-14 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => navigate("/decoder")}
          >
            Try the Decoder
          </Button>
          <a
            href="https://ko-fi.com/s/443060ea79"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-14 px-10 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-lg transition-all"
          >
            Get the Pro extension
          </a>
        </div>

        <p className="text-xs text-slate-600 mt-6 max-w-xl mx-auto">
          Translation runs on your device in Chrome and Edge 138+. Other browsers fall back to an approximate word lookup until you add your own Gemini key, which also adds deeper slang analysis.
        </p>

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
                    "hola guapa!! te extrañé mucho <span className="text-primary font-bold">&lt;3</span>"
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
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Example decode</span>
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
                      {"hey beautiful!! I missed you so much <3"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['Spanish', 'Hype'].map(tag => (
                      <div key={tag} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
                        {tag}
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">Suggested Response</span>
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-sm text-slate-300">
                      "Yesss, I love your energy 🔥 What's your favorite part?"
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
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">More than a translator.</h2>
            <p className="text-slate-500">Tone, slang, and replies, not just words.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Slang and idiom lookup",
                desc: "A built-in list covers common internet slang like rizz, no cap and delulu, plus frequent idioms. A Gemini key explains anything it misses."
              },
              {
                icon: Heart,
                title: "Tone tags",
                desc: "Tags like hype, flirty, compliment, question, sarcastic, or negative, read from the message's keywords and punctuation. AI mode reads tone in the viewer's own language."
              },
              {
                icon: Zap,
                title: "Vibe score",
                desc: "A 0 to 5 score built from those tags, shown as hearts so you can sort a busy chat at a glance."
              },
              {
                icon: MessageSquare,
                title: "Suggested replies",
                desc: "Up to three short replies, shown in your language and the viewer's, so you can paste one straight into chat."
              },
              {
                icon: BookOpen,
                title: "Personal Dictionary",
                desc: "Teach it your community's slang once. It is stored in your browser and applied before every decode."
              },
              {
                icon: Shield,
                title: "Safety warnings",
                desc: "CSAM, animal abuse, trafficking, and threats are flagged on the original and the translation, entirely on your device."
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

      {/* Extension Pro Ad Section */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        {/* Background glow for this section */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-amber-500/5 blur-[140px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Section Label */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5">
              <Chrome className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Chrome extension · 30-day pass</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                  Translate live chat,{' '}
                  <span className="text-amber-400">without leaving the stream.</span>
                </h2>
              </div>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                <strong className="text-white">Wassup Decoder Pro</strong> sits in your browser and translates foreign chat as it arrives. It has dedicated handling for Chaturbate and Stripchat, and universal mode picks up foreign messages on other sites with chat. No copy-paste, no second tab.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  { icon: MousePointer2, label: 'Select text, right-click, translate' },
                  { icon: Languages, label: 'Auto-translates new chat messages' },
                  { icon: Eye, label: 'Translation inline, right in the chat' },
                  { icon: Cpu, label: 'Optional Gemini with your own key' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3">
                    <div className="bg-amber-500/15 p-2 rounded-xl shrink-0">
                      <f.icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a
                  href="https://ko-fi.com/s/443060ea79"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-14 px-8 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Chrome className="w-5 h-5" />
                  Get Decoder Pro on Ko-fi
                </a>
                <div className="flex flex-col justify-center gap-0.5">
                  <span className="text-xs text-slate-500 font-medium">30-day pass, one-time payment</span>
                  <span className="text-xs text-slate-600">Chrome, Brave and Edge. Installs from a ZIP. Claim your license key with your Ko-fi order ID and email, then paste it into the popup.</span>
                  <Link to="/claim" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                    Already bought? Claim your key →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Browser Chrome Mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-amber-500/10 blur-[60px] rounded-full opacity-40" />
              <div className="relative bg-[#121216] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                {/* Browser Bar */}
                <div className="bg-[#0a0a0c] px-5 py-3 border-b border-white/5 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg px-3 py-1 text-[11px] text-slate-600 font-mono">
                    chaturbate.com/yourroom
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">PRO</span>
                  </div>
                </div>

                {/* Simulated Chat Feed */}
                <div className="p-6 space-y-4 bg-gradient-to-b from-[#0d0d10] to-[#0a0a0c]">
                  {[
                    { user: 'mariela_mx', msg: 'eres increíble amiga!! 🔥', translated: '✨  you\'re incredible girl!!', badge: 'SPANISH' },
                    { user: 'kim_kr99', msg: '너무 재밌어요 ㅋㅋ', translated: '✨  so fun lol', badge: 'KOREAN' },
                    { user: 'mathieu_fr', msg: 'tu es trop belle ce soir', translated: '💕  you\'re so beautiful tonight', badge: 'FRENCH' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-primary">{item.user}</span>
                        <span className="text-sm text-slate-300">{item.msg}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="inline-block bg-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">{item.badge}</span>
                        <span className="text-xs text-slate-400 italic">{item.translated}</span>
                      </div>
                    </div>
                  ))}

                  {/* Widget Preview */}
                  <div className="mt-4 bg-white rounded-xl overflow-hidden shadow-xl border border-white/10 text-black text-sm">
                    <div className="bg-gradient-to-r from-black to-gray-900 px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-500 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white">W</div>
                        <span className="text-white text-xs font-bold">Wassup Decoder</span>
                      </div>
                      <span className="text-[9px] font-black text-white/50 bg-white/10 px-1.5 py-0.5 rounded-full border border-white/10">PRO</span>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm text-gray-900 mb-0.5">You are so beautiful tonight</p>
                      <p className="text-xs text-gray-400 italic mb-2">"tu es trop belle ce soir"</p>
                      <div className="flex gap-1.5">
                        <span className="bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full">FRENCH</span>
                        <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full">FLIRTY</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Utility Section */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-6">Built for camming <br />and adult chat.</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Viewers arrive in a dozen languages and half of them write in slang a translator will not know. Wassup keeps the language, tone, and reply in one place, and everything it stores stays in your browser.
            </p>
            <div className="space-y-4">
              {[
                "No account, no sign-up",
                "History and dictionary stay on your device",
                "AI is optional and uses your own key",
                "Illegal-content warnings built in"
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
            <h3 className="text-2xl font-bold mb-4">Start with one message.</h3>
            <p className="text-slate-400 mb-8">Paste a viewer message, pick your language, and decode. No account needed.</p>
            <Button 
              size="lg"
              className="h-14 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
              onClick={() => navigate("/decoder")}
            >
              Open the Decoder
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
        <p>&copy; 2026 Wassup. Free decoder in the browser. The Pro extension is a 30-day pass.</p>
      </footer>
    </div>
  );
}
