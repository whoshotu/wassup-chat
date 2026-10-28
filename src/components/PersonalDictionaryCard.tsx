import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BookOpen, Trash2 } from 'lucide-react'
import type { CustomDictionary } from '@/lib/types'

interface PersonalDictionaryCardProps {
  entries: CustomDictionary
  onAdd: (term: string, meaning: string) => void
  onRemove: (term: string) => void
}

/**
 * Personal Dictionary settings card. Purely presentational: the entries and their
 * persistence live in usePersonalDictionary, so this file only holds the draft
 * input state and the markup.
 */
export function PersonalDictionaryCard({ entries, onAdd, onRemove }: PersonalDictionaryCardProps) {
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const canAdd = Boolean(term.trim() && meaning.trim())

  const handleAdd = () => {
    if (!canAdd) return
    onAdd(term, meaning)
    setTerm('')
    setMeaning('')
  }

  return (
    <Card className="border-white/5 bg-[#121216]">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <BookOpen className="w-3 h-3" /> Personal Dictionary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <p className="text-xs text-slate-500">
          Teach the decoder slang only your community uses. Entries are replaced with their meaning before translation and AI analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            placeholder="Slang word"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-xl py-2.5 px-4 text-slate-300 text-sm focus:outline-none focus:border-primary/50"
          />
          <input
            placeholder="Meaning"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-xl py-2.5 px-4 text-slate-300 text-sm focus:outline-none focus:border-primary/50"
          />
          <Button
            onClick={handleAdd}
            disabled={!canAdd}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl text-sm"
          >
            Add
          </Button>
        </div>
        {Object.keys(entries).length === 0 ? (
          <p className="text-xs text-slate-600">No custom entries yet.</p>
        ) : (
          <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-[#0a0a0c]">
            {Object.entries(entries).map(([entryTerm, entryMeaning]) => (
              <div key={entryTerm} className="flex items-center justify-between gap-3 px-3 py-2">
                <p className="text-sm truncate">
                  <span className="font-bold text-primary">{entryTerm}</span>
                  <ArrowRight className="inline w-3 h-3 mx-1.5 text-slate-600" />
                  <span className="text-slate-400">{entryMeaning}</span>
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 shrink-0 hover:bg-white/10"
                  onClick={() => onRemove(entryTerm)}
                  title="Remove entry"
                >
                  <Trash2 className="w-3 h-3 text-slate-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PersonalDictionaryCard
