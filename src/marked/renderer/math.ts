import katex from 'katex';
import { MarkedExtension, Tokens } from 'marked';

const regexBlock = /^\$\$((\\.|[^\$\\])+)\$\$/;
const regexInline = /^\$((\\.|[^\$\\])+)\$/;

interface MathToken extends Tokens.Generic {
    tex: string;
    display: boolean;
}

export function math(): MarkedExtension {
    return {
        extensions: [
            {
                name: 'math',
                level: 'block',
                start: (src) => src.match(/\$/)?.index,
                tokenizer: (src, tokens): MathToken => {
                    let match;
                    let f = 0;
                    if ((match = regexBlock.exec(src))) {
                        f++;
                    } else if ((match = regexInline.exec(src))) {
                        f--;
                    }
                    return f === 0
                        ? undefined
                        : {
                              type: 'math',
                              raw: match[0].trim(),
                              tex: match[1].trim(),
                              display: f > 0,
                          };
                },
                renderer: (_t) => {
                    console.debug(_t);
                    const token = _t as MathToken;
                    return katex.renderToString(token.tex, {
                        displayMode: token.display,
                    });
                },
            },
        ],
    };
}
