import { Marked } from 'marked';
import shiki from 'shiki';
import { Page } from '../page/page';
import { heading } from './renderer/heading';
import { initShiki, shikiHighlight } from './renderer/highlight';
import { link } from './renderer/link';
import { paragraph } from './renderer/paragraph';

export interface ArticleParser {
    render(text: string): Promise<string>;
}

export class MarkdownParser implements ArticleParser {
    private readonly marked: Marked;
    private readonly shiki: Promise<shiki.Highlighter>;
    constructor(page: Page) {
        this.shiki = initShiki(page.manifest);
        this.marked = new Marked(
            {
                renderer: {
                    link: (h, t, s) => link(h, t, s, page.path),
                    heading: heading,
                    paragraph: paragraph,
                    hr: () => `<hr/>`,
                    br: () => '<br/>',
                },
            },
            shikiHighlight(this.shiki, page)
        );
    }

    public async render(md: string) {
        return this.marked.parse(md);
    }
}
