import { Storage, Tabs, Icon } from '../api.js'

(async () => {

    const id = await Tabs.getActive();
    const data = await Storage.get(id) || await create();

    async function create () {
        let data = {};
        data.process = await Tabs.getProcess(id);
        await Storage.set(id, data);
        await Tabs.exec(id);
        return data;
    }

    async function update () {
        const { name, checked } = this;
        data[name] = checked;
        await Storage.set(id, data);
        await Tabs.sendMessage(id, 'update', data);
    }

    const $form = document.forms[0];

    if (!chrome.processes) {
        $form.removeChild($form.cpu.parentNode);
    }

    for (const $input of  $form.elements) {
        $input.checked = data[$input.name];
        $input.addEventListener('change', update);
    }

    $form.active.addEventListener('change', () => {
        Icon.set(id, data);
    })

})()
