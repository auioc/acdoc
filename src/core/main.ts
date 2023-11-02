import { httpget } from './fetch/fetch';
import { Chapter } from './page/catalogue';
import { Page } from './page/page';
import { initHashRouter } from './utils/router';
import { getOrElse } from './utils/utils';

interface Config {
    basePath?: string;
    manifest?: string;
    targetElement?: HTMLElement;
}

export interface Manifest {
    title: string;
    version: string;
    shiki?: {
        cdn?: string;
        theme?: string;
    };
    homepage?: Chapter;
    chapters: Chapter[];
}

export class ACDOC {
    static readonly version = '{version}';
    readonly basePath: string;
    readonly manifestName: string;
    readonly targetElement: HTMLElement;
    page: Page;

    constructor(config: Config) {
        this.basePath = getOrElse(config, 'basePath', 'docs/');
        this.manifestName = getOrElse(config, 'manifest', 'manifest.json');
        this.targetElement = getOrElse(config, 'targetElement', document.body);
        this.targetElement.classList.add('acdoc');
        console.debug('basePath:', this.basePath);
        this.init();
    }

    private async init() {
        const manifest = await this.loadManifest();

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

    private async loadManifest() {
        try {
            const j = await httpget(this.basePath + this.manifestName);
            return JSON.parse(j) as Manifest;
        } catch (err) {
            this.targetElement.innerHTML = 'Failed to load manifest<br/>' + err;
            throw err;
        }
    }
}

declare global {
    interface Window {
        ACDOC: typeof ACDOC;
    }
}

window.ACDOC = ACDOC;
