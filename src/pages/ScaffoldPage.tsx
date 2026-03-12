import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import scaffolder from '@/services/scaffolderService'

type ScaffoldResult = any

export function ScaffoldPage() {
  const [inputText, setInputText] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [outputLang, setOutputLang] = useState('English')
  // bulk generation disabled for now
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScaffoldResult | null>(null)

  const languages = [
    'English','Spanish','French','German','Portuguese','Italian','Japanese','Korean','Hindi','Indonesian','Vietnamese','Thai'
  ]
  // Bulk generation removed for now; tenancy is client-side via header

  async function handleGenerate() {
    if (!inputText.trim()) return
    setLoading(true)
    try {
      const payload: any = {
        language: 'auto',
        targetLanguage: outputLang,
        sample: inputText,
        tenantId
      }
      // tenantId is sent in header; keep payload minimal for now
      const res = await scaffolder.generateProject(payload)
      setResult(res)
    } catch (e) {
      console.error(e)
      setResult({ error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Scaffold Generator</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <Textarea placeholder="Enter input text to analyze and scaffold" value={inputText} onChange={e => setInputText(e.target.value)} />
        </div>
        <div>
          <Select value={outputLang} onValueChange={setOutputLang}>
            <SelectTrigger className="h-10" id="output-language"><SelectValue placeholder="Output language" /></SelectTrigger>
            <SelectContent>
              {languages.map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12 }}>Tenant</label>
            <input value={tenantId} onChange={e => setTenantId(e.target.value)} placeholder="Tenant ID" style={{ height: 28, padding: '0 8px' }} />
          </div>
          <Button onClick={handleGenerate} disabled={loading || !inputText.trim()}>
            {loading ? 'Generating...' : 'Generate Scaffolding'}
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {result?.sourceLanguage && (
          <div className="text-sm text-muted-foreground" style={{ marginBottom: 8 }}>
            Detected input language: {result.sourceLanguage}
          </div>
        )}
        {result ? (
          <div>
            <h3>Scaffolding Result</h3>
            {result.scaffolds ? (
              Object.entries(result.scaffolds as Record<string, string>).map(([lang, content]) => (
                <div key={lang} style={{ marginBottom: 12 }}>
                  <strong>{lang}</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#eee', padding: 12 }}>
{content}
                  </pre>
                </div>
              ))
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#eee', padding: 12 }}>
{JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No scaffold generated yet.</div>
        )}
      </div>
    </div>
  )
}

export default ScaffoldPage
