import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

import { name, version } from './package.json';

export default {
  input: 'index.js',
  output: [{
    file: 'dist/svg-optimizer.js',
    format: 'cjs',
    sourcemap: true,
    plugins: [terser({
      output: {
        // eslint-disable-next-line consistent-return
        comments: (node, comment) => {
          if (comment.type === 'comment2') {
            return /@preserve/.test(comment.value);
          }
        },
      },
    })],
    banner: `/* @preserve ${name} ${version} */`,
  }],
  plugins: [
    json(),
    commonjs(),
  ],
};
