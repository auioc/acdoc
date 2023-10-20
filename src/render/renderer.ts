import { Marked } from 'marked';
import { Page } from '../page/page';
import { StringKV } from '../utils/types';
import { isAbsolute } from '../utils/utils';

function parseOption(str: string) {
    const option: StringKV = {};
    if (str) {
        str = str
            .replace(/^('|")/, '')
            .replace(/('|")$/, '')
            .replace(/(?:^|\s)\^(\w+:?)=?(\w+)?/g, (s, k, v) => {
                if (k.indexOf('^') === -1) {
                    option[k] = (v && v.replace(/&quot;/g, '')) || true;
                    return '';
                }
                return s;
            })
            .trim();
    }
    return { str, option };
}
export interface ArticleParser {
    render(text: string): string;
}

export class MarkdownParser implements ArticleParser {
    private readonly page: Page;
    private readonly marked: Marked;

    constructor(page: Page) {
        this.page = page;
        this.marked = new Marked({
            mangle: false,
            headerIds: false,
            renderer: {
                link: (href, _title, text) => {
                    const { str: title, option } = parseOption(_title);
                    // console.debug(title, option);
                    const attrs = [];

                    if (title) attrs.push(`title=${title}`);

                    if (option.nohash || isAbsolute(href)) {
                        attrs.push('target=_blank');
                    } else {
                        let p = this.page.path;
                        console.log(p, href);
                        if (!href.startsWith('/')) {
                            if (!p.endsWith('/')) {
                                const i = p.lastIndexOf('/');
                                p = p.substring(0, i != -1 ? i + 1 : p.length);
                            }
                            if (href.startsWith('./')) {
                                href = href.slice(2);
                            }
                            href = p + href;
                        }
                        if (href.endsWith('.md')) {
                            href = href.slice(0, -3);
                        }
                        href = '#' + href;
                    }

                    return `<a href="${href}" ${attrs.join(' ')}>${text}</a>`;
                },
                heading: (text, level, raw, slugger) => {
                    const { str, option } = parseOption(text);
                    // console.debug(str, option);

                    // TODO header id prefix
                    const id = option.id
                        ? 'heading-' + option.id
                        : slugger.slug(str);

                    return `<h${level} id="${id}">${str}</h${level}>`;
                },
            },
        });
    }

    public render(md: string) {
        return this.marked.parse(md);
    }
}
