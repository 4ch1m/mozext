import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

function chunk(input, name) {
    return {
        input: input,
        output: {
            file: `./rollup_dist/${name}.min.js`,
            format: 'umd',
            name,
            compact: true,
        },
        plugins: [nodeResolve({browser: true}), terser()]
    };
}

export default [
    chunk('./node_modules/uuid/dist/v4.js', 'uuidv4')
];
