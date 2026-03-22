import { decodeMessage } from '../../src/lib/decoder';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "wassup-translate",
    title: "Translate with Wassup",
    contexts: ["selection"]
  });
});

// Listener for Right-Click Context Menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "wassup-translate" && info.selectionText && tab?.id) {
    const storage = await chrome.storage.local.get(["wassupProKey", "wassupTargetLanguage"]);
    
    if (!storage.wassupProKey) {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'show_toast', 
        type: 'error',
        message: 'Please enter your Wassup Pro License key in the extension popup.' 
      });
      return;
    }

    try {
      chrome.tabs.sendMessage(tab.id, { action: 'show_toast', type: 'loading', message: 'Translating...' });
      
      const targetLang = storage.wassupTargetLanguage || 'English';
      const result = await decodeMessage(info.selectionText, targetLang);
      
      chrome.tabs.sendMessage(tab.id, { 
        action: 'show_translation', 
        result 
      });
      
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

// Listener for automatic script translation (MutationObserver from content.ts)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  void sender; // Quick fix for unused variable
  if (request.action === 'TRANSLATE_CHAT') {
    (async () => {
      // 1. Check for Active Paid Status
      const storage = await chrome.storage.local.get(["wassupProKey", "wassupTargetLanguage"]);
      if (!storage.wassupProKey) {
        sendResponse({ error: "No license key found" });
        return;
      }
      
      const targetLang = storage.wassupTargetLanguage || 'English';
      
      // 2. Decode the chat message
      try {
        const result = await decodeMessage(request.text, targetLang);
        sendResponse({ success: true, result });
      } catch (err) {
        console.error("[Wassup Worker Error]", err);
        sendResponse({ error: "Translation API failed" });
      }
    })();
    return true; // Need to return true to leave the port open for async sendResponse
  }
});
