import { hashpath } from './utils';

let CALLBACK: (p: string, q: string) => void;

async function hashChange() {
    const hash = hashpath();
    if (!hash) {
        hashpath('/');
        return;
    }
    if (!hash.startsWith('/')) {
        hashpath('/' + hash);
        return;
    }
    const [path, query] = hash.split('?');
    CALLBACK(path, query);
}

export function initHashRouter(callback: (p: string, q: string) => void) {
    CALLBACK = callback;
    hashChange();
    window.addEventListener('hashchange', hashChange);
}
