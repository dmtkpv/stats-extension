const TabStats = {


    // --------------------
    // Storage
    // --------------------

    storage: {

        prefix: 'TabStats-',

        get (key) {
            return localStorage.getItem(TabStats.storage.prefix + key) || 0;
        },

        set (key, value) {
            localStorage.setItem(TabStats.storage.prefix + key, value);
        }

    },



    // --------------------
    // Panel
    // --------------------

    Panel: class {


        static PR = devicePixelRatio
        static W = 80 * devicePixelRatio
        static H = 48 * devicePixelRatio
        static TX = 3 * devicePixelRatio
        static TY = 2 * devicePixelRatio
        static GX = 3 * devicePixelRatio
        static GY = 15 * devicePixelRatio
        static GW = 74 * devicePixelRatio
        static GH = 30 * devicePixelRatio


        constructor (name, fg, bg) {

            const { W, H, PR, TX, TY, GX, GY, GW, GH } = TabStats.Panel;

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

            const { W, H, PR, TX, TY, GX, GY, GW, GH } = TabStats.Panel;

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

    },



    // --------------------
    // Stats
    // --------------------

    Stats: class {

        constructor (selector, panels = {}, config = {}) {

            this.panels = panels;
            this.config = config;
            this.drag = false;

            this.$el = document.createElement('div');
            this.$el.style.position = 'fixed';
            this.$el.style.left = TabStats.storage.get('left');
            this.$el.style.top = TabStats.storage.get('top');
            this.$el.style.zIndex = '2147483647';

            this.$el.addEventListener('mousedown', this.dragStart.bind(this));
            document.addEventListener('mousemove', this.dragMove.bind(this));
            document.addEventListener('mouseup', this.dragEnd.bind(this));
            document.addEventListener('mouseleave', this.dragEnd.bind(this));
            document.querySelector(selector).appendChild(this.$el);
            Object.values(panels).forEach(panel => this.$el.appendChild(panel.$el));

        }

        use (config) {
            this.config = config;
        }

        toggle (value = this.config) {
            for (const key in this.panels) {
                const active = typeof value === 'boolean' ? value : value[key];
                this.panels[key].toggle(active);
            }
        }

        dragStart (event) {
            const { clientX, clientY } = event;
            const { left, top } = this.$el.getBoundingClientRect();
            this.drag = { clientX, clientY, left, top }
        }

        dragMove (event) {
            if (!this.drag) return;
            const minmax = (value, min, max) => Math.max(min, Math.min(max, value));
            this.$el.style.left = minmax(this.drag.left + event.clientX - this.drag.clientX, 0, window.innerWidth - this.$el.offsetWidth) + 'px';
            this.$el.style.top = minmax(this.drag.top + event.clientY - this.drag.clientY, 0, window.innerHeight - this.$el.offsetHeight) + 'px';
        }

        dragEnd () {
            this.drag = false;
            TabStats.storage.set('left', this.$el.style.left);
            TabStats.storage.set('top', this.$el.style.top);
        }


    },



    // --------------------
    // Ticker
    // --------------------

    Ticker: class {

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



}