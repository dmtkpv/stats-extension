(({ Panel, Stats, Ticker }) => {



    // --------------------
    // Stats
    // --------------------

    const ms = new Panel('MS', '#0f0', '#020');
    const fps = new Panel('FPS', '#0ff', '#002');
    const ram = new Panel('MB', '#f08', '#002');
    const process_ram = new Panel('MB', '#f08', '#002');
    const process_cpu = new Panel('%', '#ff0', '#002');
    const stats = new Stats('body', { ms, fps, ram, process_ram, process_cpu });



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
            ram.update(performance.memory.usedJSHeapSize / MB);
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
        process_ram.update(data.privateMemory / MB);
        process_cpu.update(data.cpu);
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

