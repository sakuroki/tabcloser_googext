const MAX_DAYS_OPEN = 3; // number of days after which tabs are closed
const CHECK_INTERVAL_MINUTES = 60; // interval to check tabs

// Get stored tab timestamps
function getTabTimestamps(callback) {
  chrome.storage.local.get('tabTimestamps', (data) => {
    callback(data.tabTimestamps || {});
  });
}

// Save tab timestamps
function saveTabTimestamps(timestamps) {
  chrome.storage.local.set({ tabTimestamps: timestamps });
}

// Record creation time for a tab
function recordTab(tabId) {
  getTabTimestamps((timestamps) => {
    if (!timestamps[tabId]) {
      timestamps[tabId] = Date.now();
      saveTabTimestamps(timestamps);
    }
  });
}

// Remove record for closed tab
function removeTab(tabId) {
  getTabTimestamps((timestamps) => {
    if (timestamps[tabId]) {
      delete timestamps[tabId];
      saveTabTimestamps(timestamps);
    }
  });
}

// Check all tabs and close ones open for too long
function closeOldTabs() {
  getTabTimestamps((timestamps) => {
    chrome.tabs.query({}, (tabs) => {
      const now = Date.now();
      const limit = MAX_DAYS_OPEN * 24 * 60 * 60 * 1000;
      for (const tab of tabs) {
        const openTime = timestamps[tab.id];
        if (openTime && now - openTime > limit) {
          chrome.tabs.remove(tab.id);
          delete timestamps[tab.id];
        } else if (!openTime) {
          // Record timestamp for tabs we haven't seen
          timestamps[tab.id] = now;
        }
      }
      saveTabTimestamps(timestamps);
    });
  });
}

// On startup, record existing tabs
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    const now = Date.now();
    getTabTimestamps((timestamps) => {
      for (const tab of tabs) {
        if (!timestamps[tab.id]) {
          timestamps[tab.id] = now;
        }
      }
      saveTabTimestamps(timestamps);
    });
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    const now = Date.now();
    const timestamps = {};
    for (const tab of tabs) {
      timestamps[tab.id] = now;
    }
    saveTabTimestamps(timestamps);
  });
});

chrome.tabs.onCreated.addListener((tab) => {
  recordTab(tab.id);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  removeTab(tabId);
});

// Periodically check tabs
setInterval(closeOldTabs, CHECK_INTERVAL_MINUTES * 60 * 1000);

// Also run once on startup
closeOldTabs();
