import { Manifest } from '../main';
import { MarkdownParser } from '../marked/parser';
import {
    addClass,
    html,
    linkHash,
    opHtml,
    removeClass,
    toggleClass,
} from '../utils/utils';
import { Article } from './article';
import { Catalogue } from './catalogue';
import { Messager } from './messager';

export class Page {
    readonly manifest: Manifest;
    readonly messager: Messager;
    readonly parser: MarkdownParser;
    readonly catalogue: Catalogue;
    readonly pageElement: HTMLElement;
    readonly asideLeftElement: HTMLElement;
    readonly catalogueElement: HTMLElement;
    readonly articleElement: HTMLElement;
    readonly headerElement: HTMLElement;
    readonly footerElement: HTMLElement;
    article: Article;
    path: string;
    constructor(manifest: Manifest) {
        this.manifest = manifest;
        this.messager = new Messager();
        this.parser = new MarkdownParser(this);
        this.pageElement = html('div', 'page');
        this.asideLeftElement = html('aside');
        this.catalogue = new Catalogue(manifest.chapters, manifest.homepage);
        this.catalogueElement = this.catalogue.html();
        this.articleElement = html('div', 'article');
        this.headerElement = html('header', 'header');
        this.footerElement = html('footer', 'footer');
        this.title();
    }

    public async loadContent(path: string, url: string, query: string) {
        this.path = path;
        this.messager.clear();
        const chapter = this.catalogue.get(path);
        this.articleElement.innerHTML = '';
        if (chapter) {
            this.title(chapter.notitle ? null : chapter.title);
            if (chapter.url) {
                console.log('Alternative chapter: %s => %s', url, chapter.url);
                url = chapter.url;
            }
            this.article = new Article(
                chapter,
                this.parser,
                (id, m) => this.messager.message(id, m),
                url,
                query
            );
            this.articleElement.append(...this.article.html());
            this.catalogue.highlight(path);
            if (await this.article.start()) {
                this.messager.clear();
            }
        } else {
            const m = 'Unrecognized chapter: ' + path;
            this.messager.message('error-chapter', m);
            console.error(m);
        }
    }

    public title(s?: string) {
        document.title = (s ? s + ' - ' : '') + this.manifest.title;
    }

    public resize(width: number) {
        if (width < 880) {
            addClass(this.asideLeftElement, 'hide');
        } else {
            removeClass(this.asideLeftElement, 'hide');
        }
    }

    public html() {
        this.headerElement.append(
            html('div', 'header-title', [linkHash(this.manifest.title, '/')]),
            opHtml(html('div', 'toggle-aside-left', ['\u2630']), (el) => {
                el.onclick = (ev) => {
                    toggleClass(this.asideLeftElement, 'hide');
                };
            })
        );
        this.footerElement.append(
            html('div', 'manifest-version', [
                'doc version: ',
                this.manifest.version,
            ]),
            html('div', 'powered-by', [
                'Powered by ',
                opHtml(html('a'), (a) => {
                    a.href = 'https://github.com/auioc/acdoc';
                    a.innerText = 'ACDOC';
                }),
            ])
        );
        this.asideLeftElement.append(this.catalogueElement);
        this.pageElement.append(
            this.headerElement,
            html('div', 'content', [
                this.asideLeftElement,
                html('section', null, [
                    this.messager.element,
                    this.articleElement,
                ]),
            ]),
            this.footerElement
        );
        return this.pageElement;
    }
}
