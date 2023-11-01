import GithubSlugger from 'github-slugger';
import { Marked } from 'marked';
import shiki from 'shiki';
import { Page } from '../page/page';
import { heading } from './renderer/heading';
import { initShiki, shikiHighlight } from './renderer/highlight';
import { link } from './renderer/link';
import { math } from './renderer/math';
import { paragraph } from './renderer/paragraph';

export interface ArticleParser {
    render(text: string): Promise<string>;
}

export class MarkdownParser implements ArticleParser {
    private readonly marked: Marked;
    private readonly shiki: Promise<shiki.Highlighter>;
    private readonly slugger: GithubSlugger;

    constructor(page: Page) {
        this.shiki = initShiki(page.manifest);
        this.slugger = new GithubSlugger();
        this.marked = new Marked(
            {
                renderer: {
                    link: (h, t, s) => link(h, t, s, page.path),
                    heading: (t, l, r) => heading(t, l, r, this.slugger),
                    paragraph: paragraph,
                    hr: () => `<hr/>`,
                    br: () => '<br/>',
                },
            },
            shikiHighlight(this.shiki, page),
            math()
        );
    }

    public async render(md: string) {
        this.slugger.reset();
        return this.marked.parse(md);
    }
}

// TODO ?
export function fixNonMarkedError(err: Error) {
    if (!err.message.startsWith('marked()')) {
        err.message = err.message
            .replace(
                'Please report this to https://github.com/markedjs/marked.',
                ''
            )
            .trim();
    }
}
