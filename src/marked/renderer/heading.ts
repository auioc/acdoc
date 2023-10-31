import { parseOption } from './utils';

export function heading(text: string, level: number, raw: string) {
    const { str, option } = parseOption(text);

    // TODO heading id
    // const id = option.id ? 'heading-' + option.id : slugger.slug(str);

    return `<h${level}>${str}</h${level}>`;
}
