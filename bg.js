import { Storage, Tabs, Icon } from './api.js'



// --------------------
// Listeners
// --------------------

chrome.tabs.onRemoved.addListener(async id => {
    await Storage.del(id);
})

chrome.tabs.onUpdated.addListener(async (id, { status }) => {
    if (status !== 'complete') return;
    const data = await Storage.get(id);
    if (!data) return;
    if (!data.active) return await Storage.del(id);
    await Tabs.exec(id);
    await Tabs.sendMessage(id, 'update', data);
    await Icon.set(id, data);
})

chrome.runtime.onInstalled.addListener(async () => {
    await Icon.set()
    await Storage.clear();
});


// chrome.processes && chrome.processes.onUpdatedWithMemory.addListener(async processes => {
//     const tabs = await Tabs.getActive();
//     for (const { id } of tabs) {
//         const data = await Storage.get(id);
//         if (!data || !data.active) continue;
//         const process = processes[data.process];
//         await Tabs.sendMessage(id, 'process', process)
//     }
// })
//
//
//
// // --------------------
// // Listeners
// // --------------------
//

