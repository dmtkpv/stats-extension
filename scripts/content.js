/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {

    var mode = 0;

    var container = document.createElement( 'div' );
    container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';


    //

    function addPanel( panel ) {

        container.appendChild( panel.dom );
        return panel;

    }



    //

    var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

    var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
    var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

    if ( self.performance && self.performance.memory ) {

        var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

    }

    showPanel( 0 );

    return {

        REVISION: 16,

        dom: container,

        addPanel: addPanel,
        showPanel: showPanel,

        begin: function () {

            beginTime = ( performance || Date ).now();

        },

        end: function () {

            frames ++;

            var time = ( performance || Date ).now();

            msPanel.update( time - beginTime, 200 );

            if ( time >= prevTime + 1000 ) {

                fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

                prevTime = time;
                frames = 0;

                if ( memPanel ) {

                    var memory = performance.memory;
                    memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

                }

            }

            return time;

        },

        update: function () {

            beginTime = this.end();

        },

        // Backwards Compatibility

        domElement: container,
        setMode: showPanel

    };

};

Stats.Panel = function ( name, fg, bg ) {

    var min = Infinity, max = 0, round = Math.round;
    var PR = round( window.devicePixelRatio || 1 );

    var WIDTH = 80 * PR, HEIGHT = 48 * PR,
        TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
        GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
        GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

    var canvas = document.createElement( 'canvas' );
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = 'width:80px;height:48px';

    var context = canvas.getContext( '2d' );
    context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
    context.textBaseline = 'top';

    context.fillStyle = bg;
    context.fillRect( 0, 0, WIDTH, HEIGHT );

    context.fillStyle = fg;
    context.fillText( name, TEXT_X, TEXT_Y );
    context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

    return {

        dom: canvas,

        update: function ( value, maxValue ) {

            min = Math.min( min, value );
            max = Math.max( max, value );

            context.fillStyle = bg;
            context.globalAlpha = 1;
            context.fillRect( 0, 0, WIDTH, GRAPH_Y );
            context.fillStyle = fg;
            context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

            context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

            context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

            context.fillStyle = bg;
            context.globalAlpha = 0.9;
            context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

        }

    };

};

export { Stats as default };



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