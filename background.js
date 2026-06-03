// POE2 Purchase History - Service Worker (background.js)
// Minimal background script for Manifest V3

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[POE2PH] Extension installed. Welcome to POE2 Purchase History!');
    // Set default settings on install
    chrome.storage.local.set({
      poe2ph_settings: { language: 'en', panelPosition: 'right' },
      poe2ph_purchases: []
    });
  }
});

// Keep service worker alive for storage events (Manifest V3 safety)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ping') {
    sendResponse({ type: 'pong' });
  }
  return true;
});
