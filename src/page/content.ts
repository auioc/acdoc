import { NotOkResponseError, httpget } from '../fetch/fetch';
import { render } from '../render/renderer';
import { html, htmlA, progress } from '../utils/utils';
import { Page } from './page';

export class Article {
    private readonly page: Page;
    readonly path: string;
    readonly url: string;
    readonly query: string;
    readonly body = html('article', 'article-body');
    readonly info = html('div', 'article-info');

    constructor(page: Page, path: string, url: string, query: string) {
        this.page = page;
        this.path = path;
        this.url = url;
        this.query = query;
    }

    private _a(s: string) {
        this.body.innerHTML = s;
    }

    private _ap(...c: (string | HTMLElement)[]) {
        this.body.append(...c);
    }

    private _ip(...c: (string | HTMLElement)[]) {
        this.info.append(...c);
    }

    private async genArticle() {
        console.debug('fetch markdown:', this.url);
        httpget(this.url, {}, (r, l) =>
            this._a('Fetching... ' + progress(r, l))
        )
            .then((md) => render(md))
            .then((html) => this._a(html))
            .catch((err: Error) => {
                console.error(err, { error: err });
                if (err instanceof NotOkResponseError) {
                    this.page.title(err.toString());
                    this._ap(err.toString() + ': ' + this.url);
                } else if (err.name === 'AbortError') {
                } else {
                    this._ap(err.message);
                }
            });
    }

    private genInfo() {
        try {
            const data = this.page.catalogue.get(this.path);
            this.page.title(data.title);
            if (data.source) {
                this._ip('Source:', htmlA(data.source, data.source));
            }
            return true;
        } catch (error) {
            this.page.title(error.message);
            this._ap(error.message + ': ' + this.path);
            return false;
        }
    }

    public html() {
        return [this.body, this.info];
    }

    public start() {
        if (this.genInfo()) {
            this.genArticle();
        }
    }
}
