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
    showTranslationWidget(request.result);
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

function showTranslationWidget(result: any) {
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
  title.innerText = 'Wassup Decoder';
  
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
  
  const translated = document.createElement('p');
  translated.style.fontSize = '16px';
  translated.style.margin = '0 0 12px 0';
  translated.innerText = result.translatedText;
  
  const meta = document.createElement('div');
  meta.style.display = 'flex';
  meta.style.gap = '8px';
  meta.style.marginBottom = '16px';
  
  const langBadge = document.createElement('span');
  langBadge.style.background = '#f3f4f6';
  langBadge.style.color = '#374151';
  langBadge.style.padding = '2px 8px';
  langBadge.style.borderRadius = '12px';
  langBadge.style.fontSize = '12px';
  langBadge.innerText = result.sourceLanguage;
  meta.appendChild(langBadge);
  
  result.toneTags.forEach((tag: string) => {
    const tagBadge = document.createElement('span');
    tagBadge.style.background = '#dbeafe';
    tagBadge.style.color = '#1e3a8a';
    tagBadge.style.padding = '2px 8px';
    tagBadge.style.borderRadius = '12px';
    tagBadge.style.fontSize = '12px';
    tagBadge.innerText = tag;
    meta.appendChild(tagBadge);
  });
  
  const suggestionsTitle = document.createElement('div');
  suggestionsTitle.style.fontSize = '12px';
  suggestionsTitle.style.fontWeight = '600';
  suggestionsTitle.style.color = '#6b7280';
  suggestionsTitle.style.marginBottom = '8px';
  suggestionsTitle.style.textTransform = 'uppercase';
  suggestionsTitle.innerText = 'Quick Replies';
  
  content.appendChild(translated);
  content.appendChild(meta);
  content.appendChild(suggestionsTitle);
  
  result.suggestions.forEach((s: any) => {
    const sugMap = document.createElement('div');
    sugMap.style.background = '#f9fafb';
    sugMap.style.padding = '8px';
    sugMap.style.borderRadius = '6px';
    sugMap.style.marginBottom = '8px';
    sugMap.style.fontSize = '13px';
    
    sugMap.style.cursor = 'pointer';
    sugMap.title = 'Click to copy original translation response';
    sugMap.onclick = () => {
      navigator.clipboard.writeText(s.source);
      const originalBg = sugMap.style.background;
      sugMap.style.background = '#dcfce7';
      setTimeout(() => sugMap.style.background = originalBg, 500);
    };
    
    sugMap.innerHTML = `<strong>${s.target}</strong><br/><span style="color:#6b7280">${s.source}</span>`;
    content.appendChild(sugMap);
  });
  
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
  const host = window.location.hostname;
  currentConfig = PLATFORM_CONFIGS.find(c => host.includes(c.hostname));
  
  if (currentConfig) {
    console.log(`[Wassup Decoder] Platform detected: ${currentConfig.hostname}. Booting DOM scanner.`);
    startObserving();
  } else {
    // We are on a non-supported site. The universal context menu fallback will still work perfectly here.
    console.log(`[Wassup Decoder] Standard site detected. Ready for manual right-click translations.`);
  }
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
  
  // Hand off safely to the background script instance where API CORS limits don't apply.
  chrome.runtime.sendMessage({ action: 'TRANSLATE_CHAT', text: rawText }, (response) => {
    if (chrome.runtime.lastError || !response || response.error) {
       // Silently fail to not ruin chat aesthetics on basic messages or if no license key exists.
       return;
    }
    
    // Safety check - If it's already in the target language, don't spam the chat by placing an identical block of text!
    const result = response.result;
    if (result.sourceLanguage === result.targetLanguage) return;
    
    injectInlineTranslation(element, result);
  });
}

function getVibeEmoji(tags: string[]) {
  if (tags.includes('hype')) return '🔥';
  if (tags.includes('flirty') || tags.includes('compliment')) return '💕';
  if (tags.includes('negative')) return '🚫';
  if (tags.includes('sarcastic')) return '🙄';
  if (tags.includes('question')) return '❓';
  if (tags.includes('supportive')) return '🫂';
  return '✨';
}

function injectInlineTranslation(element: HTMLElement, result: any) {
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
  
  const emoji = getVibeEmoji(result.toneTags);
  pill.innerText = `${emoji} ${result.translatedText}`;
  
  element.appendChild(pill);
}

// Ensure the page is ready before booting the boot sequence
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoInjector);
} else {
  initAutoInjector();
}
