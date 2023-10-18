import { hashpath } from './utils/utils';

let CALLBACK: (p: string, q: string) => void;

async function hashChange() {
    const hash = hashpath();
    if (!hash) {
        console.debug('hashchange: set default');
        hashpath('/');
        return;
    }
    if (!hash.startsWith('/')) {
        hashpath('/' + hash);
        return;
    }

    console.debug('hashchange:', hash);
    const [_path, query] = hash.split('?');

    let flag = 0;
    let path = '' + _path.slice(1);
    if (_path.endsWith('/')) {
        path += 'index';
        flag++;
    }
    if (!_path.endsWith('.md')) {
        path += '.md';
        flag++;
    }
    if (flag) {
        hashpath(path);
        return;
    }
    CALLBACK(path, query);
}

export function initHashRouter(callback: (p: string, q: string) => void) {
    CALLBACK = callback;
    hashChange();
    window.addEventListener('hashchange', hashChange);
}
