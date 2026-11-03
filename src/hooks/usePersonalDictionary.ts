/**
 * Personal Dictionary: the user's own slang entries (term -> meaning).
 *
 * Single owner of both the entries and their storage key. Decoding reads
 * `entries`; the settings card calls `addEntry` / `removeEntry`. Nothing else
 * should read or write `wassup_custom_dict`.
 */

import { useState } from 'react';
import type { CustomDictionary } from '@/lib/types';

export const PERSONAL_DICTIONARY_KEY = 'wassup_custom_dict';

function readStoredDictionary(): CustomDictionary {
  const raw = localStorage.getItem(PERSONAL_DICTIONARY_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CustomDictionary;
  } catch (error) {
    console.error(error);
    return {};
  }
}

export interface PersonalDictionary {
  entries: CustomDictionary;
  addEntry: (term: string, meaning: string) => void;
  removeEntry: (term: string) => void;
}

export function usePersonalDictionary(): PersonalDictionary {
  const [entries, setEntries] = useState<CustomDictionary>(readStoredDictionary);

  const commit = (next: CustomDictionary) => {
    setEntries(next);
    try {
      localStorage.setItem(PERSONAL_DICTIONARY_KEY, JSON.stringify(next));
    } catch (error) {
      console.error(error);
    }
  };

  const addEntry = (term: string, meaning: string) => {
    const trimmedTerm = term.trim();
    const trimmedMeaning = meaning.trim();
    if (!trimmedTerm || !trimmedMeaning) return;
    commit({ ...entries, [trimmedTerm]: trimmedMeaning });
  };

  const removeEntry = (term: string) => {
    if (!(term in entries)) return;
    const next = { ...entries };
    delete next[term];
    commit(next);
  };

  return { entries, addEntry, removeEntry };
}
