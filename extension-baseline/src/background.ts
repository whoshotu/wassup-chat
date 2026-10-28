import { decodeMessage } from './lib/decoder';
import { getFreeGeminiModel } from './lib/geminiModels';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "wassup-translate",
    title: "Translate with Wassup",
    contexts: ["selection"]
  });
});

// Simple LRU-style cache for translations to avoid redundant API hits for repetitive text
class TranslationCache {
  private cache = new Map<string, any>();
  private maxSize = 200;

  get(text: string, lang: string) {
    return this.cache.get(`${lang}:${text}`);
  }

  set(text: string, lang: string, result: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(`${lang}:${text}`, result);
  }
}

const transCache = new TranslationCache();

// Listener for Right-Click Context Menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "wassup-translate" && info.selectionText && tab?.id) {
    const storage = await chrome.storage.local.get(["wassupProKey", "wassupTargetLanguage", "activationTime"]);
    
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const isExpired = !storage.activationTime || (Date.now() - storage.activationTime > THIRTY_DAYS);

    if (!storage.wassupProKey || isExpired) {
      if (isExpired && storage.wassupProKey) {
        await chrome.storage.local.remove(["wassupProKey", "activationTime"]);
      }
      chrome.tabs.sendMessage(tab.id, { 
        action: 'show_toast', 
        type: 'error',
        message: 'Your Wassup Pro License has expired or is missing. Please renew via the extension popup.' 
      });
      return;
    }

    try {
      const targetLang = storage.wassupTargetLanguage || 'English';
      
      // Check Cache First
      const cached = transCache.get(info.selectionText, targetLang);
      if (cached) {
        chrome.tabs.sendMessage(tab.id, { action: 'show_translation', result: cached });
        return;
      }
      
      chrome.tabs.sendMessage(tab.id, { action: 'show_toast', type: 'loading', message: 'Translating...' });
      const result = await decodeMessage(info.selectionText, targetLang);
      
      transCache.set(info.selectionText, targetLang, result);
      chrome.tabs.sendMessage(tab.id, { action: 'show_translation', result });
      
    } catch (err) {
      console.error(err);
      chrome.tabs.sendMessage(tab.id, { 
        action: 'show_toast', 
        type: 'error',
        message: 'Decoding failed. Please try again.' 
      });
    }
  }
});

const WIDGET_STRINGS: Record<string, any> = {
  English: {
    header: "Wassup Decoder", suggestions: "Smart Response Suggestions", 
    copied: "✓ Copied to clipboard!", unknown: "UNKNOWN"
  },
  Spanish: {
    header: "Decodificador Wassup", suggestions: "Sugerencias de Respuesta Inteligente", 
    copied: "✓ ¡Copiado al portapapeles!", unknown: "DESCONOCIDO"
  },
  French: {
    header: "Décodeur Wassup", suggestions: "Suggestions de Réponses Intelligentes", 
    copied: "✓ Copié dans le presse-papier !", unknown: "INCONNU"
  },
  German: {
    header: "Wassup-Decoder", suggestions: "Intelligente Antwortvorschläge", 
    copied: "✓ In die Zwischenablage kopiert!", unknown: "UNBEKANNT"
  },
  Portuguese: {
    header: "Decodificador Wassup", suggestions: "Sugestões de Respostas Inteligentes", 
    copied: "✓ Copiado para a área de transferência!", unknown: "DESCONHECIDO"
  },
  Russian: {
    header: "Декодер Wassup", suggestions: "Умные варианты ответов", 
    copied: "✓ Скопировано!", unknown: "НЕИЗВЕСТНО"
  },
  Chinese: {
    header: "Wassup 解码器", suggestions: "智能回复建议", 
    copied: "✓ 已复制到剪贴板！", unknown: "未知"
  },
  Japanese: {
    header: "Wassup デコーダー", suggestions: "スマートな返信の提案", 
    copied: "✓ クリップボードにコピーされました！", unknown: "不明"
  }
};

async function callGeminiAI(text: string, targetLang: string, apiKey: string, model: unknown): Promise<any> {
    const modelId = getFreeGeminiModel(model);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;
    
    const prompt = `You are a chat interpreter and reply coach for a live creator. Identify the viewer's language from the full message, using script, grammar, and multiple words. Distinguish Spanish and Portuguese; if uncertain, use "Unknown". Translate naturally into the creator's language (${targetLang}) and preserve slang, intent, and tone.

    Suggest exactly 3 short, distinct, context-aware replies. Respond to what the viewer actually said, avoid generic filler, and keep the creator's voice casual, warm, and natural. If the viewer is hostile or explicit, suggest friendly boundary-setting replies. Each reply's source must be in the viewer's detected language and ready to paste; target must be that same reply in ${targetLang}. Return exactly this JSON shape:
    {
      "translatedText": "the main translation",
      "sourceLanguage": "detected language name, or Unknown",
      "suggestions": [
        { "source": "reply in viewer language", "target": "reply in creator language" },
        { "source": "reply in viewer language", "target": "reply in creator language" },
        { "source": "reply in viewer language", "target": "reply in creator language" }
      ]
    }

    Return ONLY the raw JSON.
    
    Message to translate: "${text}"`;

    const response = await fetch(url, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
    
    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean up potential markdown code blocks in Gemini output
    const jsonStr = rawContent.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
}

// Listener for automatic script translation (MutationObserver from content.ts)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  void sender; // Quick fix for unused variable
  if (request.action === 'TRANSLATE_CHAT') {
    (async () => {
      // 1. Check for Active Paid Status & Expiration Timer
      const storage = await chrome.storage.local.get(["wassupProKey", "wassupTargetLanguage", "activationTime"]);
      
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const isExpired = !storage.activationTime || (Date.now() - storage.activationTime > THIRTY_DAYS);
      
      if (!storage.wassupProKey || isExpired) {
        if (isExpired && storage.wassupProKey) {
          await chrome.storage.local.remove(["wassupProKey", "activationTime"]);
        }
        sendResponse({ error: "License expired or missing" });
        return;
      }
      
      const targetLang = storage.wassupTargetLanguage || 'English';
      
      // Check Cache
      const cached = transCache.get(request.text, targetLang);
      if (cached) {
        const ui = WIDGET_STRINGS[targetLang] || WIDGET_STRINGS.English;
        sendResponse({ success: true, result: cached, ui });
        return;
      }
      
      // 2. Decode the chat message
      try {
        const deepAI = await chrome.storage.local.get(["wassupDeepAI", "wassupGeminiKey", "wassupAiVerified", "wassupGeminiModel"]);
        
        let result: any;
        
        if (deepAI.wassupDeepAI && deepAI.wassupGeminiKey && deepAI.wassupAiVerified) {
            try {
                const aiResult = await callGeminiAI(request.text, targetLang, deepAI.wassupGeminiKey, deepAI.wassupGeminiModel);
                // Gemini returns suggested strings, we need to pair them for the widget
                const pairedSuggestions = Array.isArray(aiResult.suggestions)
                  ? aiResult.suggestions.filter((s: any) => s && typeof s.source === 'string' && typeof s.target === 'string').slice(0, 3)
                  : [];
                
                result = {
                    originalText: request.text,
                    translatedText: aiResult.translatedText,
                    sourceLanguage: aiResult.sourceLanguage || "Unknown",
                    targetLanguage: targetLang,
                    toneTags: ["AI"],
                    vibeScore: 4.5,
                    suggestions: pairedSuggestions,
                    status: 'ai_generated'
                };
            } catch (aiErr) {
                console.warn("[Wassup AI Fallback]", aiErr);
                result = await decodeMessage(request.text, targetLang);
            }
        } else {
            result = await decodeMessage(request.text, targetLang);
        }
        
        const ui = WIDGET_STRINGS[targetLang] || WIDGET_STRINGS.English;
        
        transCache.set(request.text, targetLang, result);
        sendResponse({ success: true, result, ui });
      } catch (err) {
        console.error("[Wassup Worker Error]", err);
        sendResponse({ error: "Translation API failed" });
      }
    })();
    return true; // Need to return true to leave the port open for async sendResponse
  }
  
  if (request.action === 'TRANSLATE_BATCH') {
    (async () => {
      const storage = await chrome.storage.local.get(["wassupProKey", "wassupTargetLanguage", "activationTime"]);
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const isExpired = !storage.activationTime || (Date.now() - storage.activationTime > THIRTY_DAYS);
      if (!storage.wassupProKey || isExpired) return sendResponse({ error: "License expired" });
      
      // Use target language from content script if provided, otherwise from storage
      const targetLang = request.targetLang || storage.wassupTargetLanguage || 'English';
      const textArray = request.texts as string[];
      if (!textArray || !textArray.length) return sendResponse({ success: true, translatedTexts: [] });
      
      // Check whole batch cache or individual items? 
      // Individual items is better for Universal mode where many UI elements repeat.
      const finalResults: string[] = [];
      const missedIndices: number[] = [];
      const missedTexts: string[] = [];

      textArray.forEach((txt, idx) => {
        const cached = transCache.get(txt, targetLang);
        if (cached && typeof cached.translatedText === 'string') {
          finalResults[idx] = cached.translatedText;
        } else {
          missedIndices.push(idx);
          missedTexts.push(txt);
        }
      });

      if (missedTexts.length === 0) {
        return sendResponse({ success: true, translatedTexts: finalResults });
      }

      // Batch string formatting using a distinct numeric separator to prevent Google from merging lines
      const DELIM = '\n---WAS---\n';
      const batchedString = missedTexts.join(DELIM);
      try {
        const result = await decodeMessage(batchedString, targetLang);
        
        // Split by the exact delimiter, allowing for minor whitespace changes by the API
        const translatedArray = result.translatedText.split(/---WAS---/).map((s: string) => s.trim().replace(/^[\n-]+|[\n-]+$/g, ''));
        
        if (translatedArray.length !== missedTexts.length) {
            console.warn(`[Wassup Worker] Batch boundary mismatch (${translatedArray.length} vs ${missedTexts.length}). Falling back to original.`);
            // Fill missed with originals
            missedTexts.forEach((txt, i) => {
                finalResults[missedIndices[i]] = txt;
            });
        } else {
            translatedArray.forEach((translated, i) => {
                const original = missedTexts[i];
                // Update cache for individual items found in batch
                transCache.set(original, targetLang, { translatedText: translated });
                finalResults[missedIndices[i]] = translated;
            });
        }
        
        sendResponse({ success: true, translatedTexts: finalResults });
      } catch (err) {
        console.error("[Wassup Worker Error]", err);
        sendResponse({ error: "Batch API failed" });
      }
    })();
    return true;
  }
});
