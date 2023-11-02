import { hashpath } from '../utils/utils';

export class NotOkResponseError extends Error {
    readonly status;
    readonly statusText;

    constructor(status: number, statusText: string) {
        super('Not 2xx Response');
        this.status = status;
        this.statusText = statusText;
    }

    public toString() {
        return this.status + ' ' + this.statusText;
    }
}

let ABORT_CONTROLLER = new AbortController();

export function abortFetch() {
    ABORT_CONTROLLER.abort();
}

let _acceptCompressed = false; // TODO

export function onFetchError(error: Error) {
    console.error(error, { error });
    if (error instanceof NotOkResponseError) {
        const m = error.status + ' ' + error.statusText + ' ' + hashpath();
    } else if (error.name === 'AbortError') {
    } else {
    }
}

function onFetchProgress(received: number, length: number) {}

export async function httpget(
    url: string,
    options: RequestInit = {},
    onprogress = onFetchProgress
) {
    ABORT_CONTROLLER = new AbortController();
    const inti = {
        ...{ signal: ABORT_CONTROLLER.signal },
        ...options,
    };
    if (!_acceptCompressed) {
        inti['headers'] = { ...inti['headers'], ...{ Range: 'bytes=0-' } };
    }
    const response = await fetch(url, inti);
    if (!response.ok) {
        throw new NotOkResponseError(response.status, response.statusText);
    }

    const reader = response.body.getReader();
    const length = response.headers.get('Content-Encoding')
        ? 0
        : +response.headers.get('Content-Length');

    let received = 0;
    let chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        onprogress(received, length);
    }

    let chunksAll = new Uint8Array(received);
    let position = 0;
    for (let chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }

    const text = new TextDecoder('utf-8').decode(chunksAll);
    return text;
}
