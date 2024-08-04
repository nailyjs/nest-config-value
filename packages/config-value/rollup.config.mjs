import { extname, relative } from 'node:path'
import { defineConfig } from 'rollup'
import swc from '@naiable/rollup-config/swc'
import { sync } from 'glob'

/** @type {string[]} */
const paths = []
const input = Object.fromEntries(
  sync('src/**/*.ts', { absolute: true }).map((file) => {
    paths.push(file)
    return [
      // 这里将删除 `src/` 以及每个文件的扩展名。
      // 因此，例如 src/nested/foo.js 会变成 nested/foo
      relative('src', file.slice(0, file.length - extname(file).length)),
      // 这里可以将相对路径扩展为绝对路径，例如
      // src/nested/foo 会变成 /project/src/nested/foo.js
      file,
    ]
  }),
)

export default defineConfig({
  plugins: [swc()],
  external(id) {
    if (paths.includes(id))
      return false
    return true
  },
  input,
  output: [
    {
      format: 'commonjs',
      sourcemap: true,
      dir: 'lib/cjs',
      strict: true,
    },
    {
      format: 'module',
      sourcemap: true,
      dir: 'lib/esm',
      strict: true,
    },
  ],
})
