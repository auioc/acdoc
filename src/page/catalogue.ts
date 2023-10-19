import { addClass, html, linkHash, removeClass } from '../utils/utils';

export interface Chapter {
    title: string;
    path: string;
    noindex?: boolean;
    notitle?: boolean;
    hide?: boolean;
    source?: string;
    chapters?: Chapter[];
}

function g(
    ch: Chapter,
    parentPath: string,
    f: (path: string, data: Chapter, link: HTMLElement) => void
) {
    let children: HTMLElement[] = [];
    let path = '';
    if (ch.chapters) {
        parentPath += ch.path + '/';
        path = ch.noindex ? null : parentPath + 'index.md';

        children = [
            linkHash(ch.title, path, 'section-link' + (path ? '' : ' nolink')),
            html(
                'ol',
                'section',
                ch.chapters.map((sub) => g(sub, parentPath, f))
            ),
        ];
    } else {
        path = parentPath + ch.path;
        children = [linkHash(ch.title, path)];
    }
    const li = html('li', 'chapter' + (ch.hide ? ' hide' : ''), children);
    if (path) {
        f(path, ch, li);
    }
    return li;
}

export class Catalogue {
    private readonly homepage: Chapter;
    private readonly chapters: Chapter[];
    private readonly map: {
        [path: string]: {
            chapter: Chapter;
            li: HTMLElement;
        };
    } = {};

    constructor(chapters: Chapter[], homepage?: Chapter) {
        this.chapters = chapters;
        this.homepage = homepage;
    }

    public addToMap(path: string, chapter: Chapter, link: HTMLElement) {
        this.map[path] = { chapter: chapter, li: link };
    }

    public get(path: string) {
        const d = this.map[path];
        return d ? d.chapter : null;
    }

    public highlight(path: string) {
        for (const [k, v] of Object.entries(this.map)) {
            if (k === path) {
                addClass(v.li, 'active');
                v.li.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth',
                });
            } else {
                removeClass(v.li, 'active');
            }
        }
    }

    public html() {
        const l = [];
        if (this.homepage) {
            const h = html('div', 'catalogue-homepage', [
                linkHash(this.homepage.title, this.homepage.path),
            ]);
            l.push(h);
            this.addToMap(this.homepage.path, this.homepage, h);
        }
        this.chapters.forEach((ch) =>
            l.push(g(ch, '', (p, c, l) => this.addToMap(p, c, l)))
        );
        return html('div', 'catalogue', [html('ol', 'catalogue-root', l)]);
    }
}
