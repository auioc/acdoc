import { StringKV } from '../../utils/types';

export function parseOption(str: string) {
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
