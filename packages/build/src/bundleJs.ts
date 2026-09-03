import pluginTypeScript from '@babel/preset-typescript'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { join } from 'node:path'
import { rollup, type RollupOptions } from 'rollup'
import { root } from './root.ts'

const options: RollupOptions = {
  external: ['electron', 'ws'],
  input: join(root, 'packages/component-state-worker/src/componentStateWorkerMain.ts'),
  preserveEntrySignatures: 'strict',
  treeshake: {
    propertyReadSideEffects: false,
  },
  output: {
    file: join(root, '.tmp/dist/dist/componentStateWorkerMain.js'),
    format: 'es',
    freeze: false,
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
    },
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [pluginTypeScript],
    }),
    nodeResolve(),
  ],
}

export const bundleJs = async (): Promise<void> => {
  const input = await rollup(options)
  // @ts-ignore Rollup accepts the configured single output object.
  await input.write(options.output)
}
