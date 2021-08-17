// --------------------
// Set icon
// --------------------

function setIcon (stats = {}) {

    const size = 16;
    const bar = 2;
    const margin = 1;
    const height = size - margin * 2;

    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = stats.active ? '#3774E0' : '#3D4043';

    for (let x = margin; x < size; x += bar + margin) {
        const h = Math.sin(x / size * Math.PI) * height;
        const y = margin + height - h;
        ctx.fillRect(x, y, bar, h);
    }

    return chrome.action.setIcon({
        tabId: stats.tab,
        imageData: ctx.getImageData(0, 0, size, size)
    });

}

setIcon();



// --------------------
// Stats
// --------------------

class Stats {

    static store = {};

    static get (tab) {
        return Stats.store[tab];
    }

    static put (tab, stats) {
        Stats.store[tab] = stats;
    }

    static del (tab) {
        delete Stats.store[tab];
    }

    constructor (tab) {
        this.tab = tab;
        this.active = true;
        Stats.put(tab, this);
        chrome.processes.getProcessIdForTab(tab, process => {
            this.process = process;
            this.exec();
        });
    }

    exec () {
        console.log('exec')
        chrome.scripting.executeScript({
            target: { tabId: this.tab },
            files: ['scripts/stats.min.js', 'scripts/content.js'],
        })
    }

    toggle () {
        this.active = !this.active;
        chrome.tabs.sendMessage(this.tab, { key: this.state });
    }

    get state () {
        return this.active ? 'play' : 'stop'
    }

}



// --------------------
// Listeners
// --------------------

chrome.action.onClicked.addListener(({ id }) => {
    let stats = Stats.get(id);
    if (stats) stats.toggle();
    else stats = new Stats(id);
    setIcon(stats);
})

chrome.tabs.onRemoved.addListener(id => {
    Stats.del(id);
})

chrome.tabs.onUpdated.addListener((id, { status }) => {
    if (status !== 'complete') return;
    const stats = Stats.get(id);
    if (!stats) return;
    if (!stats.active) return Stats.del(id);
    stats.exec();
    setIcon(stats);
})

chrome.processes.onUpdatedWithMemory.addListener(processes => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        for (const { id } of tabs) {
            const stats = Stats.get(id);
            if (!stats || !stats.active) continue;
            const data = processes[stats.process];
            chrome.tabs.sendMessage(id, { key: 'process', data });
        }
    })
})