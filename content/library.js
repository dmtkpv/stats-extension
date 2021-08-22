// --------------------
// Panel
// --------------------

export class Panel {


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

        this.toggle(false);

    }


    update (value) {

        if (!this.active) return;

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


    toggle (value) {
        this.active = value;
        this.$el.style.display = value ? 'block' : 'none';
    }

}



// --------------------
// Stats
// --------------------

export class Stats {


    constructor (selector, panels = {}, config = {}) {

        this.panels = panels;
        this.config = config;

        this.$el = document.createElement('div');
        this.$el.style.position = 'fixed';
        this.$el.style.left = '0';
        this.$el.style.top = '0';

        Object.values(panels).forEach(panel => this.$el.appendChild(panel.$el));
        document.querySelector(selector).appendChild(this.$el);

    }


    toggle (value = this.config) {
        for (const key in this.panels) {
            const active = typeof value === 'boolean' ? value : value[key];
            this.panels[key].toggle(active);
        }
    }


    use (config) {
        this.config = config;
    }


}



// --------------------
// Ticker
// --------------------

export class Ticker {

    constructor (callback) {
        this.callback = callback;
        this.play();
    }

    tick () {
        const time = performance.now();
        this.callback(time - this.time)
        this.time = time;
        this.request = requestAnimationFrame(() => this.tick());
    }

    play () {
        if (this.active) return;
        this.active = true;
        this.time = performance.now()
        this.request = requestAnimationFrame(() => this.tick());
    }

    stop () {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.request);
    }

    toggle (value) {
        if (value) this.play();
        else this.stop();
    }

}