// --------------------
// Send processes
// --------------------

chrome.processes.onUpdatedWithMemory.addListener(processes => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, processes);
        }
    });
})



// --------------------
// Get process ID
// --------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'processId') {
        chrome.processes.getProcessIdForTab(sender.tab.id, sendResponse);
    }
    return true
});