import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  MessageSquare, 
  Globe, 
  Heart, 
  AlertCircle, 
  Sparkles, 
  History, 
  Settings, 
  Info,
  Zap,
  Crown,
  Sun
} from 'lucide-react'
import scaffolder from '@/services/scaffolderService'
import { cn } from '@/lib/utils'

type DecodeResult = {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  toneTags: string[];
  vibeScore: number;
  suggestions: string[];
  error?: string;
}

export function DecoderPage() {
  const [inputText, setInputText] = useState('')
  const [outputLang, setOutputLang] = useState('English')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [activeTab, setActiveTab] = useState('decode')

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Japanese', 'Korean', 'Hindi', 'Indonesian', 'Vietnamese', 'Thai'
  ]

  async function handleDecode() {
    if (!inputText.trim()) return
    setLoading(true)
    try {
      const payload: any = {
        language: 'auto',
        targetLanguage: outputLang,
        text: inputText,
      }
      const res = await scaffolder.generateProject(payload)
      setResult(res)
    } catch (e) {
      console.error(e)
      setResult({ 
        originalText: inputText,
        translatedText: '',
        sourceLanguage: 'Unknown',
        targetLanguage: outputLang,
        toneTags: ['error'],
        vibeScore: 0,
        suggestions: [],
        error: String(e) 
      })
    } finally {
      setLoading(false)
    }
  }

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'flirty': return 'bg-pink-500/20 text-pink-500 border-pink-500/50'
      case 'compliment': return 'bg-purple-500/20 text-purple-500 border-purple-500/50'
      case 'question': return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
      case 'negative': return 'bg-red-500/20 text-red-500 border-red-500/50'
      case 'excited': return 'bg-orange-500/20 text-orange-500 border-orange-500/50'
      case 'grateful': return 'bg-green-500/20 text-green-500 border-green-500/50'
      default: return 'bg-slate-500/20 text-slate-500 border-slate-500/50'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex flex-col">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Wassup</span>
          <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-xs text-white border-0 font-normal ml-1">Free</Badge>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
            <span>5/5 decodes left</span>
            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden ml-2">
              <div className="w-full h-full bg-primary" />
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Sun className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full pb-24">
        {/* Upgrade Banner */}
        <div className="mb-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Unlock unlimited decodes & all languages</p>
              <p className="text-xs text-slate-400">Upgrade to Pro for 24/7 priority support and more.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-white hover:bg-white/5">Upgrade</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-white/5 bg-[#121216]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-slate-200">Paste Chat Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Textarea 
                  placeholder="Paste the message you want to decode..." 
                  className="min-h-[150px] bg-[#0a0a0c] border-white/5 focus:ring-primary focus:border-primary/50 text-base placeholder:text-slate-600 resize-none h-40"
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)} 
                />
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Language (Optional)</label>
                  <Select value={outputLang} onValueChange={setOutputLang}>
                    <SelectTrigger className="w-full bg-[#0a0a0c] border-white/5 text-slate-300">
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121216] border-white/10 text-slate-200">
                      <SelectItem value="Auto-detect">Auto-detect</SelectItem>
                      {languages.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleDecode} 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-xl active:scale-[0.98] transition-all"
                  disabled={loading || !inputText.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Decoding...
                    </>
                  ) : 'Decode Message'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div>
            {result ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {result.error ? (
                  <Card className="border-red-500/20 bg-red-500/5">
                    <CardContent className="pt-6 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      {result.error}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-white/5 bg-[#121216] overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-0 text-[10px] font-bold uppercase tracking-tighter px-1.5 h-4">
                          {result.sourceLanguage}
                        </Badge>
                        <CardTitle className="text-sm font-medium text-slate-400">Interpretation</CardTitle>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Heart 
                            key={s} 
                            className={cn(
                              "w-3.5 h-3.5 transition-colors", 
                              s <= Math.round(result.vibeScore) ? "fill-primary text-primary" : "text-white/5"
                            )} 
                          />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-1">
                        <p className="text-2xl font-semibold text-white leading-tight">
                          {result.translatedText}
                        </p>
                        <p className="text-sm text-slate-500 italic">
                          "{result.originalText}"
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {result.toneTags.map(tone => (
                          <Badge key={tone} className={cn("px-2.5 py-0.5 rounded-full text-[10px] border font-bold uppercase tracking-wider", getToneColor(tone))}>
                            {tone}
                          </Badge>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-primary" />
                          Suggested Responses
                        </h4>
                        <div className="grid gap-2">
                          {result.suggestions.map((s, idx) => (
                            <div key={idx} className="bg-[#0a0a0c] p-3 rounded-lg text-sm text-slate-300 border border-white/5 hover:border-primary/30 transition-colors">
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#121216]/50 text-center p-8">
                <div className="bg-[#0a0a0c] p-5 rounded-3xl mb-6 shadow-inner border border-white/5">
                  <Globe className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Decode</h3>
                <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
                  Paste a chat message and click "Decode Message" to see the translation and tone analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-around z-50">
        {[
          { id: 'decode', label: 'Decode', icon: MessageSquare },
          { id: 'history', label: 'History', icon: History },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'info', label: 'Info', icon: Info },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[60px] transition-all",
              activeTab === tab.id ? "text-primary scale-110" : "text-slate-600 hover:text-slate-400"
            )}
          >
            <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "fill-primary/20")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default DecoderPage
