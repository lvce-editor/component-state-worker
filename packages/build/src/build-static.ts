import { cp, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { root } from './root.ts'

import.meta.resolve('@lvce-editor/static-server')
const sharedProcessUrl = import.meta.resolve('@lvce-editor/shared-process')
const sharedProcess = await import(sharedProcessUrl)

process.env.PATH_PREFIX = '/component-state-worker'
const { commitHash } = await sharedProcess.exportStatic({
  root,
  extensionPath: '',
})

const workerSourcePath = join(root, '.tmp', 'dist', 'dist', 'componentStateWorkerMain.js')
const workerTargetPath = join(root, 'dist', commitHash, 'packages', 'component-state-worker', 'dist', 'componentStateWorkerMain.js')

await mkdir(dirname(workerTargetPath), { recursive: true })
await cp(workerSourcePath, workerTargetPath)
await cp(join(root, 'dist'), join(root, '.tmp', 'static'), { recursive: true })
