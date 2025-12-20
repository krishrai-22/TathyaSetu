// Create the Context Menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verify-tathyasetu",
    title: "Verify with TathyaSetu",
    contexts: ["selection"]
  });
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "verify-tathyasetu" && info.selectionText) {
    // Save the selected text to storage
    chrome.storage.local.set({ "pending_verification": info.selectionText }, () => {
      // We cannot programmatically open the popup in Chrome Extensions V3.
      // We set a badge to let the user know data is ready.
      chrome.action.setBadgeText({ text: "1" });
      chrome.action.setBadgeBackgroundColor({ color: "#4F46E5" }); // Indigo
    });
  }
});

// Clear badge when popup is opened (handled in popup logic usually, or here via connect)
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup-open") {
    chrome.action.setBadgeText({ text: "" });
  }
});