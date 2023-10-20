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
                link: (href, title, text) => {
                    const { str, option } = parseOption(title);
                    // console.debug(str, option);
                    const attrs = [];
                    if (str) attrs.push(`title=${str}`);
                    if (isAbsolute(href)) {
                        attrs.push('target=_blank');
                    } else {
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
