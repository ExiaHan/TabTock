// TabTock background script for manifest V3
console.log('TabTock background script loaded');

let activeTimers = new Map(); // tabId -> { timer, totalTime, originalTime, title, url }

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('TabTock extension installed');
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'startTimer':
            startTimer(request.duration, request.tabId);
            sendResponse({ success: true });
            break;
        case 'getTimerState':
            sendResponse({ 
                isActive: activeTimers.has(request.tabId),
                totalTime: activeTimers.get(request.tabId)?.totalTime || 0
            });
            break;
        case 'getAllTimers':
            sendResponse({ timers: getTimersList() });
            break;
        case 'closeTab':
            closeTab(request.tabId);
            sendResponse({ success: true });
            break;
        case 'stopTimer':
            stopTimer(request.tabId);
            sendResponse({ success: true });
            break;
        case 'switchToTab':
            switchToTab(request.tabId);
            sendResponse({ success: true });
            break;
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
    return true; // Keep the message channel open for async response
});

function startTimer(duration, tabId) {
    // Clear existing timer for this tab
    if (activeTimers.has(tabId)) {
        clearInterval(activeTimers.get(tabId).timer);
    }
    
    // Get tab info
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
            console.error('Error getting tab info:', chrome.runtime.lastError);
            return;
        }
        
        console.log(`Starting timer for tab ${tabId}: ${tab.title}`);
        
        const timerData = {
            totalTime: duration,
            originalTime: duration,
            title: tab.title,
            url: tab.url,
            timer: setInterval(() => {
                const data = activeTimers.get(tabId);
                if (data && data.totalTime > 0) {
                    data.totalTime--;
                    activeTimers.set(tabId, data);
                } else {
                    stopTimer(tabId);
                    closeTab(tabId);
                }
            }, 1000)
        };
        
        activeTimers.set(tabId, timerData);
    });
}

function stopTimer(tabId) {
    if (activeTimers.has(tabId)) {
        clearInterval(activeTimers.get(tabId).timer);
        activeTimers.delete(tabId);
        console.log(`Stopped timer for tab ${tabId}`);
    }
}

function closeTab(tabId) {
    chrome.tabs.remove(tabId, () => {
        if (chrome.runtime.lastError) {
            console.error('Error closing tab:', chrome.runtime.lastError);
        }
    });
    stopTimer(tabId);
}

function switchToTab(tabId) {
    chrome.tabs.update(tabId, { active: true }, (tab) => {
        if (chrome.runtime.lastError) {
            console.error('Error switching to tab:', chrome.runtime.lastError);
            return;
        }
        chrome.windows.update(tab.windowId, { focused: true }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error focusing window:', chrome.runtime.lastError);
            }
        });
    });
}

function updateTabInfo(tabId, newTitle, newUrl) {
    if (activeTimers.has(tabId)) {
        const timerData = activeTimers.get(tabId);
        const oldTitle = timerData.title;
        timerData.title = newTitle || timerData.title;
        timerData.url = newUrl || timerData.url;
        activeTimers.set(tabId, timerData);
        console.log(`Updated tab ${tabId} info: "${oldTitle}" -> "${timerData.title}"`);
    }
}

function getTimersList() {
    const timers = [];
    activeTimers.forEach((data, tabId) => {
        timers.push({
            tabId: tabId,
            totalTime: data.totalTime,
            originalTime: data.originalTime,
            title: data.title,
            url: data.url
        });
    });
    return timers;
}

// Listen for tab updates (title changes, URL changes, etc.)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(`Tab ${tabId} updated:`, changeInfo);
    console.log(`Active timers:`, Array.from(activeTimers.keys()));
    
    // Only update if we have an active timer for this tab
    if (activeTimers.has(tabId)) {
        console.log(`Tab ${tabId} has active timer, checking for updates...`);
        
        const currentData = activeTimers.get(tabId);
        let shouldUpdate = false;
        
        // Always update when we have a title or URL change
        if (changeInfo.title || changeInfo.url || changeInfo.status === 'complete') {
            console.log(`Tab ${tabId} - Title: ${tab.title}, URL: ${tab.url}`);
            shouldUpdate = true;
        }
        
        if (shouldUpdate) {
            updateTabInfo(tabId, tab.title, tab.url);
        }
    }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    console.log(`Tab ${tabId} removed`);
    stopTimer(tabId);
});