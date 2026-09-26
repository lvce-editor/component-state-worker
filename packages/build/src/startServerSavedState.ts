import { join } from 'node:path'
import { root } from './root.ts'

process.argv.push('--link', join(root, 'node_modules', '@lvce-editor', 'explorer-view'))
process.argv.push('--link', join(root, 'node_modules', '@lvce-editor', 'source-control-worker'))
process.argv.push('--link', join(root, 'node_modules', '@lvce-editor', 'status-bar-worker'))
process.argv.push('--link', join(root, '.tmp', 'dist'), '--link', join(root, 'node_modules', '@lvce-editor', 'test-worker'))

await import('@lvce-editor/server-saved-state/bin/server.js')
