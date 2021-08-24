(({ Panel, Stats, Ticker }) => {



    // --------------------
    // Stats
    // --------------------

    const ms = new Panel('MS', '#0f0', '#020');
    const fps = new Panel('FPS', '#0ff', '#002');
    const mb = new Panel('MB', '#f08', '#002');
    const ram = new Panel('RAM', '#f0f', '#002');
    const cpu = new Panel('CPU', '#ff0', '#002');
    const stats = new Stats('body', { ms, fps, mb, ram, cpu });



    // --------------------
    // Ticker
    // --------------------

    let frame = 0;
    let time = 0;
    const MB = 1024 * 1024;
    const SEC = 1000;
    const ticker = new Ticker(tick);

    function tick (passed) {
        frame++;
        time += passed;
        ms.update(passed);
        if (time > SEC) {
            fps.update(Math.round(frame * SEC / time));
            mb.update(performance.memory.usedJSHeapSize / MB);
            frame = 0;
            time = 0;
        }
    }


    // --------------------
    // Message handlers
    // --------------------

    function updateConfig (config) {
        stats.use(config);
        stats.toggle();
    }

    function updateProcess (data) {
        ram.update(data.privateMemory / MB);
        cpu.update(data.cpu);
    }



    // --------------------
    // Listeners
    // --------------------

    chrome.runtime.onMessage.addListener(({ key, data }) => {
        if (key === 'config') return updateConfig(data);
        if (key === 'process') return updateProcess(data);
    })

    document.addEventListener('visibilitychange', () => {
        const active = document.visibilityState === 'visible';
        if (active) stats.toggle();
        else stats.toggle(false);
        ticker.toggle(active);
    });



})(TabStats);

