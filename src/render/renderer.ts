import { Marked } from 'marked';
import shiki from 'shiki';
import { Page } from '../page/page';
import { StringKV } from '../utils/types';
import { getOrElse, isAbsolute } from '../utils/utils';
import { highlightExt } from './highlight';

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

// TODO move to new files
export class MarkdownParser implements ArticleParser {
    private readonly page: Page;
    private readonly marked: Marked;
    private readonly shiki: Promise<shiki.Highlighter>;
    constructor(page: Page) {
        this.page = page;
        const shikiOptions = getOrElse(page.manifest, 'shiki', {});
        shiki.setCDN(getOrElse(shikiOptions, 'cdn', '/shiki/'));
        this.shiki = shiki.getHighlighter({
            theme: getOrElse(shikiOptions, 'theme', 'light-plus'),
            langs: [],
        });
        this.marked = new Marked(
            {
                mangle: false,
                headerIds: false,
                renderer: {
                    link: (href, _title, text) => {
                        const { str: title, option } = parseOption(_title);
                        const attrs = [];

                        if (title) attrs.push(`title=${title}`);

                        if (option.nohash || isAbsolute(href)) {
                            attrs.push('target=_blank');
                        } else {
                            let p = this.page.path;
                            if (!href.startsWith('/')) {
                                if (!p.endsWith('/')) {
                                    const i = p.lastIndexOf('/');
                                    p = p.substring(
                                        0,
                                        i != -1 ? i + 1 : p.length
                                    );
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

                        return `<a href="${href}" ${attrs.join(
                            ' '
                        )}>${text}</a>`;
                    },
                    heading: (text, level, raw, slugger) => {
                        const { str, option } = parseOption(text);
                        // console.debug(str, option);

                        const id = option.id
                            ? 'heading-' + option.id
                            : slugger.slug(str);

                        return `<h${level} id="${id}">${str}</h${level}>`;
                    },
                    paragraph: (text) => {
                        if (text.startsWith('^')) {
                            let c = '';
                            const f = text.charAt(1);
                            if (f) {
                                c = {
                                    '~': 'success',
                                    '?': 'info',
                                    '!': 'warning',
                                    '*': 'danger',
                                }[f];
                                if (c) {
                                    return `<div class="${c}"><p>${text
                                        .slice(2)
                                        .trim()}</p></div>`;
                                }
                            }
                        }
                        return `<p>${text}</p>`;
                    },
                    code: (code, language, isEscaped) => {
                        console.log(code);
                        return `<pre>${code}</pre>`;
                    },
                },
            },
            highlightExt(
                async (code: string, lang: string) => {
                    const hl = await this.shiki;
                    if (!hl.getLoadedLanguages().includes(lang as shiki.Lang)) {
                        const bundles = shiki.BUNDLED_LANGUAGES.filter(
                            (bundle) => {
                                return (
                                    bundle.id === lang ||
                                    bundle.aliases?.includes(lang)
                                );
                            }
                        );
                        if (bundles.length > 0) {
                            await hl.loadLanguage(lang as shiki.Lang);
                        } else {
                            throw new Error(`Unknown language '${lang}'`);
                        }
                    }
                    return hl.codeToHtml(code, { lang: lang });
                },
                (code, lang) => {
                    return `<div class="codeblock language-${lang}">${code}</div>`;
                }
            )
        );
    }

    public async init() {}

    public render(md: string) {
        return this.marked.parse(md) as string;
    }
}
