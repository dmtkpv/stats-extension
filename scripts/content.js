// --------------------
// Panel
// --------------------

class Panel {

    static length = 74;

    constructor () {
        Object.assign(this, new Stats.Panel(...arguments));
        this.values = [];
        this.dom.style.pointerEvents = 'none';
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
// MS Panel
// --------------------

class MS extends Panel {

    constructor () {
        super('MS', ...arguments);
        this.play();
    }

    tick () {
        const time = performance.now();
        this.add(time - this.time);
        this.play(time);
    }

    play (time) {
        this.time = time || performance.now();
        this.req = requestAnimationFrame(() => this.tick());
    }

    stop () {
        cancelAnimationFrame(this.req);
    }

}



// --------------------
// Cache position
// --------------------

const storage = {

    manifest: chrome.runtime.getManifest(),

    getKey (suffix) {
        return storage.manifest.name + storage.manifest.version + suffix;
    },

    get (suffix) {
        return localStorage.getItem(storage.getKey(suffix)) || 0;
    },

    set (suffix, value) {
        localStorage.setItem(storage.getKey(suffix), value);
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

stats.dom.addEventListener('click', event => event.stopPropagation(), true);
stats.dom.style.left = storage.get('left') + 'px';
stats.dom.style.top = storage.get('top') + 'px';
document.body.appendChild(stats.dom);



// --------------------
// Drag & drop
// --------------------

let drag = false;

function minmax (value, min, max) {
    return Math.max(min, Math.min(max, value));
}

stats.dom.addEventListener('mousedown', event => {
    const { clientX, clientY } = event;
    const { left, top } = stats.dom.getBoundingClientRect();
    drag = { clientX, clientY, left, top }
})

document.addEventListener('mousemove', event => {
    if (!drag) return;
    const left = minmax(drag.left + event.clientX - drag.clientX, 0, window.innerWidth - stats.dom.offsetWidth);
    const top = minmax(drag.top + event.clientY - drag.clientY, 0, window.innerHeight - stats.dom.offsetHeight)
    stats.dom.style.left = left + 'px';
    stats.dom.style.top = top + 'px';
    storage.set('left', left);
    storage.set('top', top);
})

document.addEventListener('mouseup', event => {
    drag = false;
})

document.addEventListener('mouseleave', event => {
    drag = false;
})



// --------------------
// Handlers
// --------------------

function play () {
    stats.dom.style.display = '';
    panels.ms.play();
}

function stop () {
    stats.dom.style.display = 'none';
    panels.ms.stop();
}

function update (data) {
    panels.cpu.add(data.cpu);
    panels.ram.add(data.privateMemory / 1024 / 1024);
}



// --------------------
// Listeners
// --------------------

chrome.runtime.onMessage.addListener(({ key, data }) => {
    switch (key) {
        case 'stop': return stop();
        case 'play': return play();
        case 'process': return update(data);
    }
})