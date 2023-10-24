import { isAbsolute } from '../../utils/utils';
import { parseOption } from './utils';

export function link(href: string, _title: string, text: string, path: string) {
    const { str: title, option } = parseOption(_title);
    const attrs = [];

    if (title) attrs.push(`title=${title}`);

    if (option.nohash || isAbsolute(href)) {
        attrs.push('target=_blank');
    } else {
        let p = path;
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
}
