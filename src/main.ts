import { httpget } from './fetch/fetch';
import { Chapter } from './page/catalogue';
import { Page } from './page/page';
import { initHashRouter } from './router';
import { getOrElse } from './utils/utils';

const langDefault = {
    source: 'Source',
};

interface Config {
    basePath?: string;
    targetElement?: HTMLElement;
}

export interface Manifest {
    title: string;
    version: string;
    lang?: { [k in keyof typeof langDefault]?: string };
    shikiCdn?: string;
    homepage?: Chapter;
    chapters: Chapter[];
}

export class ACDOC {
    readonly basePath: string;
    readonly targetElement: HTMLElement;
    page: Page;

    constructor(config: Config) {
        this.basePath = getOrElse(config, 'basePath', '/docs/');
        this.targetElement = getOrElse(config, 'targetElement', document.body);
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

        new ResizeObserver(() => {
            this.page.resize(this.targetElement.clientWidth);
        }).observe(this.targetElement);

        initHashRouter((path, query) => {
            let url = this.basePath + path.slice(1);
            if (path.endsWith('/')) {
                url += 'index';
            }
            if (!path.endsWith('.md')) {
                url += '.md';
            }
            this.page.loadContent(path, url, query);
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
