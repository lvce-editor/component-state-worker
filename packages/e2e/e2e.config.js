import { defineConfig } from '@lvce-editor/test-with-playwright'

export default defineConfig({
  onlyExtension: '../../.tmp/extensions/builtin.language-features-json',
  testPath: '.',
  serverPath: '../build/src/startServer.ts',
})
