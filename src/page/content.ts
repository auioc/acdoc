import { NotOkResponseError, httpget } from '../fetch/fetch';
import { ArticleParser } from '../render/renderer';
import { html, htmlA, progress } from '../utils/utils';
import { Chapter } from './catalogue';

export class Article {
    readonly parser: ArticleParser;
    readonly chapter: Chapter;
    readonly url: string;
    readonly query: string;
    readonly body = html('article', 'article-body');
    readonly info = html('div', 'article-info');

    constructor(
        chapter: Chapter,
        parser: ArticleParser,
        url: string,
        query: string
    ) {
        this.chapter = chapter;
        this.parser = parser;
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
            this._a('Fetching... ' + progress(r, l) + '<br/>')
        )
            .then((md) => {
                this._a('Rendering...<br/>');
                return this.parser.render(md);
            })
            .then((html) => this._a(html))
            .catch((err: Error) => {
                console.error(err);
                if (err instanceof NotOkResponseError) {
                    this._ap(err.toString() + ': ' + this.url);
                } else if (err.name === 'AbortError') {
                } else {
                    this._ap(err.message);
                }
            });
    }

    private genInfo() {
        const d = this.chapter;
        if (d.source) {
            this._ip('Source:', htmlA(d.source, d.source));
        }
    }

    public html() {
        return [this.body, this.info];
    }

    public start() {
        this.genInfo();
        this.genArticle();
    }
}
