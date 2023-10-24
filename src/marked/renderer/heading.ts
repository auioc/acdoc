import { marked } from 'marked';
import { parseOption } from './utils';

export function heading(
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    raw: string,
    slugger: marked.Slugger
) {
    const { str, option } = parseOption(text);

    const id = option.id ? 'heading-' + option.id : slugger.slug(str);

    return `<h${level} id="${id}">${str}</h${level}>`;
}
