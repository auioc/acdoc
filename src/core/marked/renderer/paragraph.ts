export function paragraph(text: string) {
    if (text.startsWith('^')) {
        let c = '';
        const f = text.charAt(1);
        if (f) {
            c = {
                '~': 'success',
                '?': 'info',
                '!': 'warning',
                '*': 'danger',
            }[f];
            if (c) {
                return `<div class="${c}"><p>${text.slice(2).trim()}</p></div>`;
            }
        }
    }
    return `<p>${text}</p>`;
}
