import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const CI = process.env.CI === 'true' || false;

export default {
    input: 'src/core/main.ts',
    output: {
        file: 'dist/acdoc.js',
        format: 'iife',
        name: 'acdoc',
        globals: {
            marked: 'marked',
            shiki: 'shiki',
            katex: 'katex',
        },
        sourcemap: !CI,
    },
    external: ['marked', 'shiki', 'katex'],
    plugins: [
        typescript(),
        nodeResolve({ browser: true, resolveOnly: ['github-slugger'] }),
    ],
};
