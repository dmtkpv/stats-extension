// --------------------
// Panel
// --------------------

class Panel {

    static length = 74;

    constructor () {
        Object.assign(this, new Stats.Panel(...arguments));
        this.values = [];
    }

    add (value) {
        this.values.push(value);
        if (this.values.length > Panel.length) this.values.shift();
        this.update(value, this.max);
    }

    get max () {
        return Math.max(...this.values);
    }

}



// --------------------
// MS
// --------------------

class MS extends Panel {

    constructor () {
        super('MS', ...arguments);
        this.time = performance.now();
        requestAnimationFrame(() => this.tick());
    }

    tick () {
        const time = performance.now();
        this.add(time - this.time);
        this.time = time;
        requestAnimationFrame(() => this.tick());
    }

}



// --------------------
// Initialization
// --------------------

const stats = new Stats();

const panels = {
    ms: new MS('#0f0', '#020'),
    ram: new Panel('MB', '#0ff', '#002'),
    cpu: new Panel('%', '#f08', '#201'),
}

for (const key in panels) {
    stats.addPanel(panels[key]);
}

for (const canvas of stats.dom.children) {
    const panel = Object.values(panels).find(panel => panel.dom === canvas);
    canvas.style.display = panel ? 'block' : 'none'
}

document.body.appendChild(stats.dom);



// --------------------
// Processes listener
// --------------------

chrome.runtime.sendMessage('processId', id => {
    chrome.runtime.onMessage.addListener(processes => {
        panels.cpu.add(processes[id].cpu);
        panels.ram.add(processes[id].privateMemory / 1024 / 1024);
    })
});

