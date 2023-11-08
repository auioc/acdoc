import { NotOkResponseError, httpget } from '../fetch/fetch';
import { MarkdownParser, fixNonMarkedError } from '../marked/parser';
import { BiStrConsumer } from '../utils/types';
import { html, htmlA, opHtml, progress } from '../utils/utils';
import { Chapter } from './catalogue';

export class Article {
    readonly parser: MarkdownParser;
    readonly chapter: Chapter;
    readonly message: BiStrConsumer;
    readonly url: string;
    readonly query: string;
    readonly body = html('article', 'article-body');
    readonly toc = html('div', 'article-toc');
    readonly info = html('div', 'article-info');

    constructor(
        chapter: Chapter,
        parser: MarkdownParser,
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
            this.message('fetching', 'Fetching markdown... ');
            const md = await httpget(this.url, {}, (r, l) =>
                this.message(
                    'fetching',
                    'Fetching markdown... ' + progress(r, l)
                )
            );
            this.message('rendering', 'Rendering ... ');
            const html = await this.parser.render(md);
            this.body.innerHTML = html;
            this.genToc();
            return true;
        } catch (err) {
            fixNonMarkedError(err);
            console.error(err);
            if (err instanceof NotOkResponseError) {
                this.message('fetch-error', err.toString() + ': ' + this.url);
            } else if (err.name === 'AbortError') {
            } else {
                this.message('unknown-error', err);
            }
            return false;
        }
    }

    private genInfo() {
        const d = this.chapter;
        if (d.source) {
            this._ip('Source:', htmlA(d.source, d.source));
        }
    }

    private genToc() {
        const toc = this.parser.getToc();
        for (const t of toc) {
            if (t.tocIgnore) {
                continue;
            }
            // TODO (WIP)
            this.toc.append(
                opHtml(htmlA(t.title, null, 'toc-item'), (el) => {
                    el.style.marginLeft = t.level + 'em';
                    el.title = t.title;
                    el.dataset.titleId = t.id;
                    el.onclick = (ev) => {
                        document
                            .getElementById(
                                (<HTMLElement>ev.target).dataset.titleId
                            )
                            .scrollIntoView({
                                block: 'start',
                                behavior: 'smooth',
                            });
                    };
                })
            );
        }
        this.body.prepend(this.toc);
    }

    public html() {
        return [this.body, this.info];
    }
}
