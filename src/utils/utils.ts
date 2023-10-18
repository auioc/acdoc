export function hashpath(path?: string) {
    if (path) {
        window.location.hash = path;
    }
    return window.location.hash.replace(/^#/, '');
}
export function percentage(a: number, b = 100, dp = 2) {
    return ((a / b) * 100).toFixed(dp);
}
export function formatTime(ts: number) {
    if (ts <= 0) {
        return '0';
    }
    return new Date(ts * 1000).toLocaleString(navigator.language, {
        weekday: 'narrow',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}

const _SIZE_PREFIX = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const SIZE_UNITS_IEC = _SIZE_PREFIX.map((s) => s + 'iB');
const SIZE_UNITS_SI = _SIZE_PREFIX.map((s) => s + 'B');

export function formatSize(bytes: number, iec = true, dp = 2) {
    const thresh = iec ? 1024 : 1000;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = iec ? SIZE_UNITS_IEC : SIZE_UNITS_SI;
    const r = 10 ** dp;
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );
    return bytes.toFixed(dp) + ' ' + units[u];
}

export function progress(received: number, length: number) {
    const s = formatSize(received) + (length ? ' / ' + formatSize(length) : '');
    const p = length ? '@ ' + percentage(received, length) + '%' : '';
    return `${s} ${p}`;
}

export function isAbsolute(path: string) {
    return /(:|(\/{2}))/g.test(path);
}

export function html<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    clazz?: string,
    children?: (HTMLElement | string)[]
) {
    const el = document.createElement(tag);
    if (clazz) {
        el.className = clazz;
    }
    if (children) {
        children.forEach((e) => el.append(e));
    }
    return el;
}

export function opHtml<E extends HTMLElement>(el: E, f: (el: E) => void) {
    f(el);
    return el;
}

export function htmlA(text: string, url?: string, clazz?: string) {
    const a = document.createElement('a');
    a.innerText = text;
    if (url) {
        a.href = url;
    }
    if (clazz) {
        a.className = clazz;
    }
    return a;
}

export function linkHash(title: string, path?: string, clazz?: string) {
    return htmlA(title, path ? '#/' + path : null, clazz);
}

export function addClass(el: HTMLElement, clazz: string) {
    el.classList.add(clazz);
}

export function removeClass(el: HTMLElement, clazz: string) {
    el.classList.remove(clazz);
}

export function toggleClass(el: HTMLElement, clazz: string) {
    if (el.classList.contains(clazz)) {
        removeClass(el, clazz);
    } else {
        addClass(el, clazz);
    }
}
