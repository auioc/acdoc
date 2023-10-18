import { Config, getConfig } from './config';
import { httpget } from './fetch/fetch';
import { Chapter } from './page/catalogue';
import { Page } from './page/page';
import { initHashRouter } from './router';

const langDefault = {
    source: 'Source',
};

export interface Manifest {
    title: string;
    version: string;
    lang?: { [k in keyof typeof langDefault]?: string };
    chapters: Chapter[];
}

export class ACDOC {
    readonly basePath: string;
    readonly targetElement: HTMLElement;
    page: Page;

    constructor(config: Config) {
        this.basePath = getConfig(config, 'basePath', '/docs/');
        this.targetElement = getConfig(config, 'targetElement', document.body);
        this.targetElement.classList.add('acdoc');
        console.debug('basePath:', this.basePath);
        window.acdoc = this;
        this.init();
    }

    private async init() {
        const manifest = (await httpget(this.basePath + 'manifest.json') //
            .then((s) => JSON.parse(s))) as Manifest;

        this.page = new Page(manifest);
        this.targetElement.innerHTML = '';
        this.targetElement.append(this.page.html());

        initHashRouter((path, query) => {
            this.page.loadContent(path, this.basePath + path, query);
        });
    }
}

export function version() {
    return '{version}';
}

declare global {
    interface Window {
        ACDOC: typeof ACDOC;
        acdoc: ACDOC;
    }
}

window.ACDOC = ACDOC;
