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
    const [path, query] = hash.split('?');
    CALLBACK(path, query);
}

export function initHashRouter(callback: (p: string, q: string) => void) {
    CALLBACK = callback;
    hashChange();
    window.addEventListener('hashchange', hashChange);
}
