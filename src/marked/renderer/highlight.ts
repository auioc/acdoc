import shiki from 'shiki';
import { Manifest } from '../../main';
import { getOrElse } from '../../utils/utils';
import { highlightExt } from './highlight.ext';

export function initShiki(manifest: Manifest) {
    const shikiOptions = getOrElse(manifest, 'shiki', {});
    shiki.setCDN(getOrElse(shikiOptions, 'cdn', '/shiki/'));
    return shiki.getHighlighter({
        theme: getOrElse(shikiOptions, 'theme', 'light-plus'),
        langs: [],
    });
}

export function shikiHighlight(hlPromise: Promise<shiki.Highlighter>) {
    return highlightExt(
        async (code: string, lang: string) => {
            const hl = await hlPromise;
            if (!hl.getLoadedLanguages().includes(lang as shiki.Lang)) {
                const bundles = shiki.BUNDLED_LANGUAGES.filter((bundle) => {
                    return bundle.id === lang || bundle.aliases?.includes(lang);
                });
                if (bundles.length > 0) {
                    await hl.loadLanguage(lang as shiki.Lang);
                } else {
                    throw new Error(`Unknown language '${lang}'`);
                }
            }
            return hl.codeToHtml(code, { lang: lang });
        },
        (code, lang) => {
            return `<div class="codeblock language-${lang}">${code}</div>`;
        }
    );
}
