/**
 * Wassup Content Script
 * 1. Handles Right-Click universal fallback translations showing the pop-up widget.
 * 2. Implements a MutationObserver auto-injector on specific cam platforms.
 */

// ==========================================
// 1. UNIVERSAL RIGHT CLICK WIDGET FALLBACK
// ==========================================
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'show_toast') {
    showToast(request.message, request.type);
  } else if (request.action === 'show_translation') {
    removeToast();
    showTranslationWidget(request.result, request.ui);
  }
});

let activeToast: HTMLElement | null = null;
let activeWidget: HTMLElement | null = null;

function showToast(message: string, type: 'loading' | 'error' | 'success') {
  removeToast();
  
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 20px';
  toast.style.background = type === 'error' ? '#ef4444' : '#000';
  toast.style.color = '#fff';
  toast.style.borderRadius = '8px';
  toast.style.fontFamily = 'system-ui, sans-serif';
  toast.style.fontSize = '14px';
  toast.style.zIndex = '999999';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toast.innerText = message;
  
  document.body.appendChild(toast);
  activeToast = toast;
  
  if (type !== 'loading') {
    setTimeout(() => removeToast(), 4000);
  }
}

function removeToast() {
  if (activeToast) {
    activeToast.remove();
    activeToast = null;
  }
}

function showTranslationWidget(result: any, ui: any = {}) {
  if (!result || typeof result !== 'object') return;

  const strings = ui || {
    header: "Wassup Decoder", suggestions: "Smart Response Suggestions", 
    copied: "✓ Copied to clipboard!", unknown: "UNKNOWN"
  };

  const translatedText = typeof result.translatedText === 'string' ? result.translatedText : 'Translation unavailable';
  const originalText = typeof result.originalText === 'string' ? result.originalText : '';
  const toneTags = Array.isArray(result.toneTags) ? result.toneTags : [];
  const suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
  
  if (activeWidget) activeWidget.remove();
  
  const widget = document.createElement('div');
  widget.style.position = 'fixed';
  widget.style.bottom = '20px';
  widget.style.right = '20px';
  widget.style.width = '320px';
  widget.style.background = '#fff';
  widget.style.color = '#000';
  widget.style.borderRadius = '12px';
  widget.style.fontFamily = 'system-ui, sans-serif';
  widget.style.zIndex = '999999';
  widget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  widget.style.border = '1px solid #e5e7eb';
  widget.style.overflow = 'hidden';
  
  const header = document.createElement('div');
  header.style.background = '#f9fafb';
  header.style.padding = '12px 16px';
  header.style.borderBottom = '1px solid #e5e7eb';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('div');
  title.style.fontWeight = '600';
  title.style.fontSize = '14px';
  title.innerText = strings.header;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerText = '×';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#6b7280';
  closeBtn.onclick = () => widget.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  const content = document.createElement('div');
  content.style.padding = '16px';
  
  // The Headline: What it means (Translated)
  const translated = document.createElement('div');
  translated.style.fontSize = '18px';
  translated.style.fontWeight = '700';
  translated.style.margin = '0 0 4px 0';
  translated.style.color = '#111827';
  translated.innerText = translatedText;
  
  // The Sub-Headline: What they said (Original)
  const original = document.createElement('div');
  original.style.fontSize = '13px';
  original.style.color = '#6b7280';
  original.style.fontStyle = 'italic';
  original.style.marginBottom = '12px';
  original.style.lineHeight = '1.4';
  original.innerText = originalText ? `"${originalText}"` : '"Original message unavailable"';

  const meta = document.createElement('div');
  meta.style.display = 'flex';
  meta.style.gap = '8px';
  meta.style.marginBottom = '20px';
  
  const langBadge = document.createElement('span');
  langBadge.style.background = '#000';
  langBadge.style.color = '#fff';
  langBadge.style.padding = '2px 10px';
  langBadge.style.borderRadius = '12px';
  langBadge.style.fontSize = '11px';
  langBadge.style.fontWeight = 'bold';
  langBadge.innerText = (result.sourceLanguage || strings.unknown).toUpperCase();
  meta.appendChild(langBadge);
  
  toneTags.forEach((tag: string) => {
    const tagBadge = document.createElement('span');
    tagBadge.style.background = '#e5e7eb';
    tagBadge.style.color = '#374151';
    tagBadge.style.padding = '2px 8px';
    tagBadge.style.borderRadius = '12px';
    tagBadge.style.fontSize = '11px';
    tagBadge.style.fontWeight = '600';
    tagBadge.innerText = String(tag).toUpperCase();
    meta.appendChild(tagBadge);
  });
  
  const suggestionsTitle = document.createElement('div');
  suggestionsTitle.style.fontSize = '11px';
  suggestionsTitle.style.fontWeight = '800';
  suggestionsTitle.style.color = '#9ca3af';
  suggestionsTitle.style.marginBottom = '10px';
  suggestionsTitle.style.textTransform = 'uppercase';
  suggestionsTitle.style.letterSpacing = '0.05em';
  suggestionsTitle.innerText = strings.suggestions;
  
  content.appendChild(translated);
  content.appendChild(original);
  content.appendChild(meta);
  content.appendChild(suggestionsTitle);
  
  if (suggestions.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.fontSize = '13px';
    emptyState.style.color = '#6b7280';
    emptyState.style.padding = '8px 0';
    emptyState.innerText = 'No suggestions available for this message.';
    content.appendChild(emptyState);
  } else {
    suggestions.forEach((s: any) => {
      if (!s || typeof s !== 'object') return;
      const sugContainer = document.createElement('div');
      sugContainer.style.background = '#fff';
      sugContainer.style.border = '1px solid #f3f4f6';
      sugContainer.style.padding = '12px';
      sugContainer.style.borderRadius = '10px';
      sugContainer.style.marginBottom = '10px';
      sugContainer.style.cursor = 'pointer';
      sugContainer.style.transition = 'all 0.2s';
      sugContainer.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
      
      sugContainer.onmouseenter = () => sugContainer.style.borderColor = '#000';
      sugContainer.onmouseleave = () => sugContainer.style.borderColor = '#f3f4f6';

      const sugTarget = document.createElement('div');
      sugTarget.style.fontSize = '14px';
      sugTarget.style.fontWeight = '700';
      sugTarget.style.color = '#111827';
      sugTarget.style.marginBottom = '4px';
      sugTarget.innerText = typeof s.target === 'string' ? s.target : 'Suggestion unavailable';

      const sugSource = document.createElement('div');
      sugSource.style.fontSize = '12px';
      sugSource.style.color = '#6b7280';
      sugSource.innerText = typeof s.source === 'string' ? s.source : 'Reply unavailable';

      sugContainer.onclick = () => {
        navigator.clipboard.writeText(typeof s.source === 'string' ? s.source : '');
        const originalBg = sugContainer.style.background;
        sugContainer.style.background = '#dcfce7';
        const originalText = sugTarget.innerText;
        sugTarget.innerText = strings.copied;
        setTimeout(() => {
          sugContainer.style.background = originalBg;
          sugTarget.innerText = originalText;
        }, 1500);
      };
      
      sugContainer.appendChild(sugTarget);
      sugContainer.appendChild(sugSource);
      content.appendChild(sugContainer);
    });
  }
  
  widget.appendChild(header);
  widget.appendChild(content);
  document.body.appendChild(widget);
  activeWidget = widget;
}

// ==========================================
// 2. AUTO-TRANSLATE DOM OBSERVER
// ==========================================

const PLATFORM_CONFIGS = [
  {
    hostname: 'chaturbate.com',
    chatContainerSelector: '.chat-list',
    messageSelector: '.text'
  },
  {
    hostname: 'stripchat.com',
    chatContainerSelector: '.chat-messages, .messages-list',
    messageSelector: '.message, .msg-text'
  }
];

let observer: MutationObserver | null = null;
let currentConfig: any = null;

function initAutoInjector() {
  // Always try universal mode first - works on ALL sites with chat
  // This auto-detects foreign language and translates to user's preferred language
  chrome.storage.local.get(["wassupUniversalToggle", "wassupTargetLanguage"], (res) => {
    const host = window.location.hostname;
    currentConfig = PLATFORM_CONFIGS.find(c => host.includes(c.hostname));
    
    // Default: Enable universal translator for ALL sites
    const enableUniversal = res.wassupUniversalToggle !== false; // Default true if undefined
    userTargetLang = res.wassupTargetLanguage || 'English';
    
    if (enableUniversal) {
      console.log(`[Wassup Decoder] Universal DOM Translation active (auto-detecting foreign chat).`);
      startUniversalObserver();
    } else if (currentConfig) {
      // Fallback to platform-specific if universal is disabled
      console.log(`[Wassup Decoder] Platform detected: ${currentConfig.hostname}. Booting chat injector.`);
      startObserving();
    } else {
      console.log(`[Wassup Decoder] Standard site detected. Ready for manual right-click translations.`);
    }
  });

  // Reactive settings listener
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.wassupUniversalToggle) {
      if (changes.wassupUniversalToggle.newValue && !uObserverVisible) {
        startUniversalObserver();
      } else if (!changes.wassupUniversalToggle.newValue && uObserverVisible) {
        // We don't easily stop the observer without a refresh due to nodeValue modifications,
        // but we can stop processing new ones. 
        uObserverVisible = false;
      }
    }
  });
}

function startObserving() {
  const container = document.querySelector(currentConfig.chatContainerSelector);
  if (!container) {
    // Retry finding the container if it hasn't loaded yet (e.g. React/Vue apps loading dynamically)
    setTimeout(startObserving, 2000);
    return;
  }
  
  console.log('[Wassup Decoder] Locked onto chat feed. Standing by for incoming messages.');
  
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          
          if (el.matches && el.matches(currentConfig.messageSelector)) {
            processNewMessage(el);
          } else {
            const nestedMsgs = el.querySelectorAll(currentConfig.messageSelector);
            nestedMsgs.forEach((msg) => processNewMessage(msg as HTMLElement));
          }
        }
      });
    });
  });
  
  observer.observe(container, { childList: true, subtree: true });
}

const PROCESSED_ATTR = 'data-wassup-processed';

async function processNewMessage(element: HTMLElement) {
  if (element.hasAttribute(PROCESSED_ATTR)) return;
  
  const rawText = element.innerText?.trim();
  if (!rawText || rawText.length < 3) return; // Ignore empty/tiny messages or pure unicode emotes
  
  element.setAttribute(PROCESSED_ATTR, 'true');
  
  // Hand off to background script for translation
  chrome.runtime.sendMessage({ action: 'TRANSLATE_CHAT', text: rawText }, (response) => {
    if (chrome.runtime.lastError || !response || response.error || !response.result || typeof response.result !== 'object') {
       // Silently fail to not ruin chat aesthetics on basic messages or if no license key exists.
       return;
    }
    
    // Safety check - If it's already in the target language, don't spam the chat by placing an identical block of text!
    const result = response.result;
    if (typeof result.sourceLanguage === 'string' && typeof result.targetLanguage === 'string' && result.sourceLanguage === result.targetLanguage) return;
    
    injectInlineTranslation(element, result);
  });
}

function getVibeEmoji(tags: string[] = []) {
  if (!Array.isArray(tags)) return '✨';
  if (tags.includes('hype')) return '🔥';
  if (tags.includes('flirty') || tags.includes('compliment')) return '💕';
  if (tags.includes('negative')) return '🚫';
  if (tags.includes('sarcastic')) return '🙄';
  if (tags.includes('question')) return '❓';
  if (tags.includes('supportive')) return '🫂';
  return '✨';
}

function injectInlineTranslation(element: HTMLElement, result: any) {
  if (!result || typeof result !== 'object') return;

  const pill = document.createElement('span');
  pill.style.display = 'inline-block';
  pill.style.marginLeft = '8px';
  pill.style.padding = '3px 6px';
  pill.style.borderRadius = '4px';
  pill.style.fontSize = '0.9em';
  pill.style.background = '#fef08a'; // Vibrant Tailwind Yellow 200
  pill.style.color = '#854d0e'; // Solid contrast text
  pill.style.fontWeight = '600';
  pill.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
  
  const toneTags = Array.isArray(result.toneTags) ? result.toneTags : [];
  const translatedText = typeof result.translatedText === 'string' ? result.translatedText : 'Translation unavailable';
  const emoji = getVibeEmoji(toneTags);
  pill.innerText = `${emoji} ${translatedText}`;
  
  element.appendChild(pill);
}

// ==========================================
// 3. UNIVERSAL FULL-PAGE TRANSLATOR
// ==========================================

let pendingNodes: Node[] = [];
let batchTimer: any = null;
let uObserverVisible = false;
let userTargetLang = 'English';

// Foreign language detection patterns
const FOREIGN_PATTERNS = [
  /[\u3040-\u309f\u30a0-\u30ff]/,  // Japanese
  /[\uac00-\ud7af]/,              // Korean
  /[\u4e00-\u9fff]/,              // Chinese
  /[\u0600-\u06FF\u0750-\u077F]/,  // Arabic
  /[\u0400-\u04FF]/,              // Russian
  /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i, // French/Spanish accents
  /[äöüß]/i,                     // German
  /[ãõç]/i,                      // Portuguese
  /[àèìòù]/i,                    // Italian
  /[ćčđžšňťťł]/i,                  // Czech/Polish/Slovak
];

function looksForeign(text: string): boolean {
  // Check for non-English characters or common foreign phrases
  for (const pattern of FOREIGN_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  // Quick check for common foreign words
  const lower = text.toLowerCase();
  const foreignWords = ['hola', 'bonjour', 'ciao', 'gracias', 'merci', 'danke', 'grazie', 'obrigado', 'konnichiwa', 'anneyong', 'nihao', 'zdrasti', 'privet', 'saude', 'bom', 'algo'];
  for (const word of foreignWords) {
    if (lower.includes(word)) return true;
  }
  return false;
}

function processUniversalNode(node: Node) {
  if (!uObserverVisible) return;
  const val = node.nodeValue?.trim();
  if (!val || val.length < 2 || val.length > 1500) return; 
  
  const parent = node.parentElement;
  if (!parent) return;
  
  const tag = parent.tagName.toUpperCase();
  // Skip input fields, code, styles
  if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'INPUT', 'TEXTAREA', 'OPTION'].includes(tag)) return;
  if (parent.isContentEditable) return;
  if (parent.tagName === 'TEXTAREA') return;
  
  // Only process if it looks foreign (has non-English characters)
  if (!looksForeign(val)) return;
  
  // Track the last value we processed to avoid infinite loops
  if ((node as any)._wassupLastVal === val) return;
  
  (node as any)._wassupLastVal = val;
  pendingNodes.push(node);
  
  if (!batchTimer) {
    batchTimer = setTimeout(flushBatch, 600);
  }
}

async function flushBatch() {
  batchTimer = null;
  if (pendingNodes.length === 0) return;
  
  // Take up to 40 nodes to avoid massive payload size via Free API
  const batch = pendingNodes.splice(0, 40);
  if (pendingNodes.length > 0) {
     batchTimer = setTimeout(flushBatch, 800);
  }
  
  const texts = batch.map(n => n.nodeValue?.trim() || '');
  
  chrome.runtime.sendMessage({ action: 'TRANSLATE_BATCH', texts, targetLang: userTargetLang }, (response) => {
    if (chrome.runtime.lastError || !response || response.error) return;
    
    const translatedTexts = response.translatedTexts;
    if (translatedTexts && translatedTexts.length === batch.length) {
      for (let i = 0; i < batch.length; i++) {
        const orig = batch[i].nodeValue || "";
        if (translatedTexts[i] && translatedTexts[i] !== texts[i]) {
            const newVal = orig.replace(texts[i], translatedTexts[i]);
            (batch[i] as any)._wassupLastVal = newVal.trim();
            batch[i].nodeValue = newVal;
        }
      }
    }
  });
}

function startUniversalObserver() {
  if (uObserverVisible) return;
  uObserverVisible = true;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    processUniversalNode(node);
  }
  
  const uObserver = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.type === 'characterData') {
        processUniversalNode(m.target);
      } else if (m.type === 'childList') {
        m.addedNodes.forEach(n => {
          if (n.nodeType === Node.TEXT_NODE) {
            processUniversalNode(n);
          } else if (n.nodeType === Node.ELEMENT_NODE) {
            const el = n as HTMLElement;
            const subWalker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let childNode;
            while ((childNode = subWalker.nextNode())) {
              processUniversalNode(childNode);
            }
          }
        });
      }
    });
  });
  
  uObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
}

// Ensure the page is ready before booting the boot sequence
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoInjector);
} else {
  initAutoInjector();
}
