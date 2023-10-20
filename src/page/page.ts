import { Manifest } from '../main';
import { ArticleParser, MarkdownParser } from '../render/renderer';
import {
    addClass,
    html,
    linkHash,
    opHtml,
    removeClass,
    toggleClass,
} from '../utils/utils';
import { Catalogue } from './catalogue';
import { Article } from './content';

export class Page {
    readonly manifest: Manifest;
    readonly parser: ArticleParser;
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
        this.parser = new MarkdownParser(this);
        this.pageElement = html('div', 'page');
        this.asideLeftElement = html('aside', 'aside-left');
        this.catalogue = new Catalogue(manifest.chapters, manifest.homepage);
        this.catalogueElement = this.catalogue.html();
        this.articleElement = html('div', 'article');
        this.headerElement = html('header', 'header');
        this.footerElement = html('footer', 'footer');
        this.title();
    }

    public async loadContent(path: string, url: string, query: string) {
        this.path = path;
        const chapter = this.catalogue.get(path);
        this.articleElement.innerHTML = '';
        if (chapter) {
            this.title(chapter.notitle ? null : chapter.title);
            this.article = new Article(chapter, this.parser, url, query);
            this.articleElement.append(...this.article.html());
            this.catalogue.highlight(path);
            this.article.start();
        } else {
            const m = 'Unrecognized Chapter: ' + path;
            console.error(m);
            this.articleElement.innerText = m;
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
                this.articleElement,
            ]),
            this.footerElement
        );
        return this.pageElement;
    }
}
