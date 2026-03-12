import React, { useState, useEffect } from 'react'
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
  Sun,
  Search,
  Star,
  Moon,
  Shield,
  HelpCircle
} from 'lucide-react'
import scaffolder from '@/services/scaffolderService'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

type DecodeResult = {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  toneTags: string[];
  vibeScore: number;
  suggestions: string[];
  timestamp: number;
  error?: string;
}

export function DecoderPage() {
  const { theme, toggleTheme } = useTheme()
  const [inputText, setInputText] = useState('')
  const [outputLang, setOutputLang] = useState('English')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [activeTab, setActiveTab] = useState('decode')
  const [history, setHistory] = useState<DecodeResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [urlWarning, setUrlWarning] = useState(false)

  // Check for configuration URL
  useEffect(() => {
    const url = (import.meta as any).env?.VITE_SCAFFOLDER_URL;
    if (url && url.includes('REPLACE_ME')) {
      setUrlWarning(true)
    }
  }, [])

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wassup_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse history', e)
      }
    }
  }, [])

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('wassup_history', JSON.stringify(history))
  }, [history])

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
      const newDecode: DecodeResult = {
        ...res,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      }
      setResult(newDecode)
      setHistory(prev => [newDecode, ...prev].slice(0, 50)) // Keep last 50
    } catch (e) {
      console.error(e)
      setResult({ 
        id: 'err',
        originalText: inputText,
        translatedText: '',
        sourceLanguage: 'Unknown',
        targetLanguage: outputLang,
        toneTags: ['error'],
        vibeScore: 0,
        suggestions: [],
        timestamp: Date.now(),
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

  const renderDecode = () => (
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
                        <div key={idx} className="bg-[#0a0a0c] p-3 rounded-lg text-sm text-slate-300 border border-white/5 hover:border-primary/30 transition-colors cursor-default">
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
  )

  const renderHistory = () => (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/20 p-2 rounded-lg">
          <History className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-white">Message History</h2>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            placeholder="Search messages..." 
            className="w-full bg-[#121216] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-slate-300 text-sm focus:outline-none focus:border-primary/50"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="border-white/5 bg-[#121216] text-slate-400">
          <Star className="w-4 h-4" />
        </Button>
      </div>

      <Card className="border-white/5 bg-[#121216] min-h-[400px] flex flex-col">
        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-[#0a0a0c] p-4 rounded-2xl mb-4 border border-white/5">
              <History className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No decoded messages yet</h3>
            <p className="text-slate-500 text-sm">Start by decoding your first message!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {history
              .filter(h => h.originalText.toLowerCase().includes(searchQuery.toLowerCase()) || h.translatedText.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(h => (
              <div key={h.id} className="p-4 hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-white/10 text-slate-500 uppercase">
                      {h.sourceLanguage}
                    </Badge>
                    <span className="text-[10px] text-slate-600">
                      {new Date(h.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    {[1,2,3,4,5].map(s => (
                      <Heart key={s} className={cn("w-2.5 h-2.5", s <= Math.round(h.vibeScore) ? "fill-primary text-primary" : "text-slate-800")} />
                    ))}
                  </div>
                </div>
                <p className="text-white font-medium mb-1 line-clamp-1">{h.translatedText}</p>
                <p className="text-slate-500 text-xs truncate italic">"{h.originalText}"</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>


      {/* Appearance */}
      <Card className="border-white/5 bg-[#121216]">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Globe className="w-3 h-3" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Theme</p>
                <p className="text-xs text-slate-500">Dark mode</p>
              </div>
            </div>
            <Button 
              onClick={toggleTheme}
              variant="outline" 
              size="sm" 
              className="bg-[#0a0a0c] border-white/10 text-white rounded-xl"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Language Preferences */}
      <Card className="border-white/5 bg-[#121216]">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
             <Globe className="w-3 h-3" /> Language Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Primary Language</label>
            <Select defaultValue="English">
              <SelectTrigger className="bg-[#0a0a0c] border-white/10 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#121216] border-white/10 text-slate-200">
                {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">This is the language you speak and understand</p>
          </div>
        </CardContent>
      </Card>

    </div>
  )

  const renderInfo = () => (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-white">Safety & Info</h2>
      </div>

      <Card className="border-white/5 bg-[#121216]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">Platform Rules & Guidelines</CardTitle>
              <CardDescription className="text-slate-500">Understanding your viewers is important, but always follow your platform's terms of service.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4 border-t border-white/5">
          {[
            'Always comply with your streaming platform\'s content policies',
            'Respect age restrictions and content ratings',
            'Report harassment or abusive behavior to platform moderators',
            'Never share personal information with viewers'
          ].map((rule, idx) => (
            <div key={idx} className="flex gap-3 text-sm text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {rule}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-[#121216]">
        <CardHeader className="pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <Heart className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">Building Positive Connections</CardTitle>
              <CardDescription className="text-slate-500">Use this tool to foster better relationships with your international audience.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {[
            'Acknowledge and appreciate viewers who are respectful and supportive',
            'Learn common greetings in your viewers\' languages',
            'Cultural differences exist - what\'s friendly in one culture might be different in another',
            'Building a positive community takes time and consistent boundaries'
          ].map((rule, idx) => (
            <div key={idx} className="flex gap-3 text-sm text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              {rule}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-[#121216]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0a0a0c] rounded-2xl border border-white/5">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">About Chat Decoder</CardTitle>
              <CardDescription className="text-slate-500">This tool is designed to help content creators understand international viewer messages quickly and accurately.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 border-t border-white/5 text-sm">
          <p className="text-slate-400">
            <strong className="text-slate-200">What we do:</strong> We analyze messages to detect language, explain slang, and identify tone to help you respond appropriately.
          </p>
          <p className="text-slate-400">
            <strong className="text-slate-200">What we don't do:</strong> We don't teach languages, translate for replies, or make decisions for you about how to engage with viewers.
          </p>
          <p className="text-slate-400">
            <strong className="text-slate-200">Privacy:</strong> Your decoded messages are stored locally on your device. We don't share your data with third parties.
          </p>
        </CardContent>
      </Card>

      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <HelpCircle className="w-6 h-6 text-primary" />
          <div>
            <p className="text-slate-200 font-bold">Need more help?</p>
            <p className="text-slate-500 text-sm">Check our detailed guide for more tips.</p>
          </div>
        </div>
        <Button variant="link" className="text-primary font-bold">View Guide</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex flex-col">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white gradient-text">Wassup</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-slate-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full pb-24 lg:pt-12">
        {/* Configuration Alert */}
        {urlWarning && (
          <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Config Required: Set <strong>VITE_SCAFFOLDER_URL</strong> in your Render dashboard to point to your backend service.</span>
          </div>
        )}

        {/* Dynamic Tab Rendering */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'decode' && renderDecode()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'info' && renderInfo()}
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
              "flex flex-col items-center gap-1 min-w-[60px] transition-all relative py-1",
              activeTab === tab.id ? "text-primary" : "text-slate-600 hover:text-slate-400"
            )}
          >
            {activeTab === tab.id && <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full -z-10" />}
            <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "fill-primary/20")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default DecoderPage
