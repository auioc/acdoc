import typescript from '@rollup/plugin-typescript';

const CI = process.env.CI === 'true' || false;

export default {
    input: 'src/main.ts',
    output: {
        file: 'public/acdoc.js',
        format: 'iife',
        name: 'acdoc',
        globals: { marked: 'marked', shiki: 'shiki' },
        sourcemap: !CI,
    },
    external: ['marked', 'shiki'],
    plugins: [typescript()],
};
