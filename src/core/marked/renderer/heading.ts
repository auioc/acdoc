import GithubSlugger from 'github-slugger';
import { parseOption } from './utils';

export type TOC = {
    level: number;
    id: string;
    title: string;
    tocIgnore: boolean;
};

export function heading(
    text: string,
    level: number,
    raw: string,
    slugger: GithubSlugger,
    toc: TOC[]
) {
    const { str, option } = parseOption(text);

    const id = 'heading-' + (option.id ? option.id : slugger.slug(str));

    toc.push({
        level: level,
        id: id,
        title: str,
        tocIgnore: option.tocIgnore ? true : false,
    });

    return `<h${level} id="${id}">${str}</h${level}>`;
}
