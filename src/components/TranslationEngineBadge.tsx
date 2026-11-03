import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Cpu, Download, Loader2, Sparkles } from 'lucide-react'
import { nativeEngineSupported, prepareTranslation } from '@/lib/translation'
import type { DecodeResult, TranslationEngine } from '@/lib/types'
import { cn } from '@/lib/utils'

const ENGINES: Record<
  Exclude<TranslationEngine, 'none'>,
  { label: string; className: string; Icon: typeof Cpu }
> = {
  'on-device': {
    label: 'On your device',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Icon: Cpu,
  },
  gemini: {
    label: 'Gemini',
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Icon: Sparkles,
  },
  dictionary: {
    label: 'Word lookup',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Icon: AlertCircle,
  },
}

/** Which engine translated this result, and the download it may still need. */
export function TranslationEngineBadge({ result }: { result: DecodeResult }) {
  const [progress, setProgress] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const engine = result.translationEngine
  if (!engine || engine === 'none') return null
  const { label, className, Icon } = ENGINES[engine]

  const from = result.sourceLanguage
  const canDownload =
    engine === 'dictionary' &&
    nativeEngineSupported() &&
    from !== result.targetLanguage &&
    from !== 'Auto-detect' &&
    from !== 'Unknown'

  async function download() {
    setError('')
    setProgress(0)
    const outcome = await prepareTranslation(from, result.targetLanguage, setProgress)
    if (outcome.ok) {
      setReady(true)
      return
    }
    setProgress(null)
    setError(
      outcome.reason === 'needs-activation'
        ? 'Your browser needs another click to allow the download.'
        : `The on-device model for ${from} → ${result.targetLanguage} is not available in this browser.`
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn('border text-[10px] font-bold px-1.5 h-5 gap-1', className)}>
          <Icon className="w-2.5 h-2.5" />
          {label}
        </Badge>
        {canDownload && (
          <Button
            size="sm"
            variant="outline"
            onClick={download}
            disabled={progress !== null}
            className="h-6 px-2 text-[10px] border-white/10 bg-[#0a0a0c] text-slate-400 hover:text-white"
          >
            {ready ? (
              'Model ready — decode again'
            ) : progress === null ? (
              <>
                <Download className="w-2.5 h-2.5 mr-1" />
                {from} → {result.targetLanguage}
              </>
            ) : (
              <>
                <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                {Math.round(progress * 100)}%
              </>
            )}
          </Button>
        )}
      </div>
      {result.translationNotice && (
        <p className="text-xs text-slate-500">{result.translationNotice}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
