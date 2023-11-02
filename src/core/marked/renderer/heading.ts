import GithubSlugger from 'github-slugger';
import { parseOption } from './utils';

export function heading(
    text: string,
    level: number,
    raw: string,
    slugger: GithubSlugger
) {
    const { str, option } = parseOption(text);

    const id = option.id ? option.id : slugger.slug(str);
    console.debug('[Slugger] %s =%s> %s', str, option.id ? 'x' : '', id);

    return `<h${level} id="heading-${id}">${str}</h${level}>`;
}
