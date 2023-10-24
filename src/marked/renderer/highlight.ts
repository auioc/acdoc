import shiki from 'shiki';
import { Manifest } from '../../main';
import { Page } from '../../page/page';
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

export function shikiHighlight(
    hlPromise: Promise<shiki.Highlighter>,
    page: Page
) {
    return highlightExt(
        async (code: string, lang: string) => {
            const hl = await hlPromise;
            if (!hl.getLoadedLanguages().includes(lang as shiki.Lang)) {
                const bundles = shiki.BUNDLED_LANGUAGES.filter((bundle) => {
                    return bundle.id === lang || bundle.aliases?.includes(lang);
                });
                if (bundles.length > 0) {
                    page.messager.message(
                        'shiki-load-lang-' + lang,
                        `[Shiki] Loading language '${lang}'...`
                    );
                    await hl.loadLanguage(lang as shiki.Lang);
                } else {
                    console.warn("[Shiki] Unknown language '%s'", lang);
                    return code;
                }
            }
            return hl.codeToHtml(code, { lang: lang });
        },
        (code, lang) => {
            return `<div class="codeblock language-${lang}">${code}</div>`;
        }
    );
}
