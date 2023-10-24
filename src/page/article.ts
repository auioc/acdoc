import { NotOkResponseError, httpget } from '../fetch/fetch';
import { ArticleParser } from '../marked/parser';
import { BiStrConsumer } from '../utils/types';
import { html, htmlA, progress } from '../utils/utils';
import { Chapter } from './catalogue';

export class Article {
    readonly parser: ArticleParser;
    readonly chapter: Chapter;
    readonly message: BiStrConsumer;
    readonly url: string;
    readonly query: string;
    readonly body = html('article', 'article-body');
    readonly info = html('div', 'article-info');

    constructor(
        chapter: Chapter,
        parser: ArticleParser,
        messager: BiStrConsumer,
        url: string,
        query: string
    ) {
        this.chapter = chapter;
        this.parser = parser;
        this.message = (id, m) => messager('article-' + id, m);
        this.url = url;
        this.query = query;
    }

    private _ip(...c: (string | HTMLElement)[]) {
        this.info.append(...c);
    }

    public async start() {
        this.genInfo();
        try {
            const md = await httpget(this.url, {}, (r, l) =>
                this.message(
                    'fetching',
                    'Fetching markdown... ' + progress(r, l)
                )
            );
            this.message('rendering', 'Rendering ... ');
            const html = await this.parser.render(md);
            this.body.innerHTML = html;
        } catch (err) {
            console.error(err);
            if (err instanceof NotOkResponseError) {
                this.message('fetch-error', err.toString() + ': ' + this.url);
            } else if (err.name === 'AbortError') {
            } else {
                this.message('unknown-error', err);
            }
            throw err;
        }
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
}
