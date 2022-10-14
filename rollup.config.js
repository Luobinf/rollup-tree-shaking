
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/bundle.cjs.js',
        format: 'cjs',  // es iife cjs umd amd
        name: 'bundleName'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
        })
    ],
    plugins: [nodeResolve(), commonjs()]
}

// exports