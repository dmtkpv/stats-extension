import { Storage, Tabs, Icon } from './api.js'

chrome.tabs.onRemoved.addListener(async id => {
    await Storage.del(id);
})

chrome.tabs.onUpdated.addListener(async (id, { status }) => {
    if (status !== 'complete') return;
    const data = await Storage.get(id);
    if (!data) return;
    await Tabs.exec(id);
    await Icon.set(id, data);
    await Tabs.sendMessage(id, 'config', data);
})

chrome.runtime.onInstalled.addListener(async () => {
    await Icon.set();
    await Storage.clear();
});

chrome.processes && chrome.processes.onUpdatedWithMemory.addListener(async processes => {
    const id = await Tabs.getActive();
    const data = await Storage.get(id);
    if (!data) return;
    const process = processes[data.process];
    await Tabs.sendMessage(id, 'process', process);
})
