import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'

export default {
  input: 'index.js',
  output: {
    format: 'iife',
    file: 'index_dist.js'
  },
  plugins: [
    commonjs({
      include: 'node_modules/**'
    }),
    resolve({
      browser: true,
      preferBuiltins: false // for url npm module; otherwise rollup assumes node
    }),
    svelte({
      extensions: [ '.html' ],
      include: 'components/**/*.html'
    })
  ]
}
