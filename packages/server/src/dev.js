import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
process.argv.push('--link', join(root, '.tmp', 'dist'), '--link', join(root, 'node_modules', '@lvce-editor', 'test-worker'))

await import('@lvce-editor/server/bin/server.js')
