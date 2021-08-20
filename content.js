// --------------------
// Panel
// --------------------

class Panel {

    static PR = window.devicePixelRatio
    static W = 80 * Panel.PR
    static H = 48 * Panel.PR
    static TX = 3 * Panel.PR
    static TY = 2 * Panel.PR
    static GX = 3 * Panel.PR
    static GY = 15 * Panel.PR
    static GW = 74 * Panel.PR
    static GH = 30 * Panel.PR

    constructor (name, fg, bg) {
        const { W, H, PR, TX, TY, GX, GY, GW, GH } = Panel;
        this.fg = fg;
        this.bg = bg;
        this.name = name;
        this.min = Infinity;
        this.max = 0;
        this.$el = document.createElement('canvas');
        this.$el.width = W;
        this.$el.height = H;
        this.$el.style.width = W / PR + 'px';
        this.$el.style.height = H / PR + 'px';
        this.ctx = this.$el.getContext('2d');
        this.ctx.font = `bold ${9 * PR}px Helvetica, Arial, sans-serif`;
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, W, H);
        this.ctx.fillStyle = fg;
        this.ctx.fillText(name, TX, TY);
        this.ctx.fillRect(GX, GY, GW, GH);
        this.ctx.fillStyle = bg;
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillRect(GX, GY, GW, GH);
    }

    update (value) {
        const { W, H, PR, TX, TY, GX, GY, GW, GH } = Panel;
        this.min = Math.min(this.min, value);
        this.max = Math.max(this.max, value);
        this.ctx.fillStyle = this.bg;
        this.ctx.globalAlpha = 1;
        this.ctx.fillRect(0, 0, W, GY);
        this.ctx.fillStyle = this.fg;
        this.ctx.fillText(`${Math.round(value)} ${this.name} (${Math.round(this.min)} - ${Math.round(this.max)})`, TX, TY );
        this.ctx.drawImage(this.$el, GX + PR, GY, GW - PR, GH, GX, GY, GW - PR, GH);
        this.ctx.fillRect(GX + GW - PR, GY, PR, GH);
        this.ctx.fillStyle = this.bg;
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillRect(GX + GW - PR, GY, PR, Math.round(( 1 - (value / this.max)) * GH));
    }

}



// --------------------
// MS Panel
// --------------------

class MS extends Panel {

    constructor (...args) {
        super(...args);
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
// FPS Panel
// --------------------

class FPS extends Panel {

    constructor (...args) {
        super(...args);
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



let panels = {

}


function update (data) {

    for (const key in data) {
        if (data[key] && !panels[key]) panels[key] = new Panel();
        if (!data[key] && panels[key]) {
            panels[key].destroy();
            delete panels[key];
        }

    }

}


chrome.runtime.onMessage.addListener(({ key, data }) => {
    switch (key) {
        case 'update': return update(data);
    }
})