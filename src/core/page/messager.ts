import { html } from '../utils/utils';

export class Messager {
    readonly element: HTMLElement = html('div', 'messages');
    private map: { [k: string]: HTMLElement } = {};
    constructor() {}

    message(id: string, m: string) {
        m = `[${new Date().valueOf()}] ${m}`;
        const el = this.map[id];
        if (el) {
            el.innerHTML = m;
        } else {
            const newEl = html('div', 'message', [m], 'message-' + id);
            this.map[id] = newEl;
            this.element.append(newEl);
        }
    }

    clear() {
        this.element.innerHTML = '';
        this.map = {};
    }
}
