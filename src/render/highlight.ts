import { marked } from 'marked';

export function highlightExt(
    highlight: (code: string, lang: string) => Promise<string>,
    renderer: (code: string, lang: string) => string
): marked.MarkedExtension {
    return {
        async: true,
        async walkTokens(token) {
            if (token.type === 'code') {
                const lang = getLang(token.lang);
                const code = await highlight(token.text, lang); //
                if (typeof code === 'string' && code !== token.text) {
                    // @ts-expect-error
                    token.escaped = true;
                    token.text = code;
                }
            }
        },
        renderer: {
            code(code, info, escaped) {
                code = code.trimEnd();
                return renderer(
                    escaped ? code : escape(code, true),
                    getLang(info)
                );
            },
        },
    };
}

function getLang(s: string) {
    return (s || '').match(/\S*/)[0];
}

// Copied from marked
const escapeTest = /[&<>"']/;
const escapeReplace = new RegExp(escapeTest.source, 'g');
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
const escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
// @ts-expect-error
const getEscapeReplacement = (ch) => escapeReplacements[ch];
// @ts-expect-error
function escape(html, encode?: any) {
    if (encode) {
        if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
        }
    } else {
        if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
    }
    return html;
}
