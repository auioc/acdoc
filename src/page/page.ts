import { Manifest } from '../main';
import { html, htmlA, opHtml, toggleClass } from '../utils/utils';
import { Catalogue } from './catalogue';
import { Article } from './content';

export class Page {
    readonly manifest: Manifest;
    readonly catalogue: Catalogue;
    readonly pageElement: HTMLElement;
    readonly catalogueElement: HTMLElement;
    readonly articleElement: HTMLElement;
    readonly headerElement: HTMLElement;
    readonly footerElement: HTMLElement;
    article: Article;
    constructor(manifest: Manifest) {
        this.manifest = manifest;
        this.pageElement = html('div', 'page');
        this.catalogue = new Catalogue(manifest.chapters);
        this.catalogueElement = this.catalogue.html();
        this.articleElement = html('div', 'article');
        this.headerElement = html('header', 'header');
        this.footerElement = html('footer', 'footer');
        this.title();
    }

    public async loadContent(path: string, url: string, query: string) {
        this.article = new Article(this, path, url, query);
        this.articleElement.innerHTML = '';
        this.articleElement.append(...this.article.html());
        this.catalogue.highlight(path);
        this.article.start();
    }

    public title(s?: string) {
        document.title = (s ? s + ' - ' : '') + this.manifest.title;
    }

    public html() {
        this.headerElement.append(
            html('div', 'home-link', [
                htmlA(this.manifest.title, '#/index.md'),
            ]),
            html('div', 'sidebar-toggle', [
                opHtml(
                    html('button', 'sidebar-toggle-button', ['SIDEBAR']),
                    (el) => {
                        el.onclick = (ev) => {
                            toggleClass(this.catalogueElement, 'hide');
                        };
                    }
                ),
            ])
        );
        this.footerElement.append(
            html('div', 'powered-by', [
                'Powered by ',
                opHtml(html('a'), (a) => {
                    a.href = 'https://github.com/auioc/acdoc';
                    a.innerText = 'ACDOC';
                }),
            ])
        );
        this.pageElement.append(
            this.headerElement,
            html('div', 'content', [
                this.catalogueElement,
                this.articleElement,
            ]),
            this.footerElement
        );
        return this.pageElement;
    }
}
