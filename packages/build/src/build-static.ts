import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { downloadJsonLanguageFeatures, jsonLanguageFeaturesPath } from './downloadJsonLanguageFeatures.ts'
import { root } from './root.ts'

const sharedProcessPath = join(root, 'node_modules', '@lvce-editor', 'shared-process', 'index.js')
const sharedProcess = await import(pathToFileURL(sharedProcessPath).toString())

process.env.PATH_PREFIX = '/component-state-worker'
await downloadJsonLanguageFeatures()
const { commitHash } = await sharedProcess.exportStatic({
  extensionPath: '',
  extensionPaths: [jsonLanguageFeaturesPath],
  root,
  testPath: 'packages/e2e',
})

await cp(jsonLanguageFeaturesPath, join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-json'), { recursive: true })

const rendererWorkerPath = join(root, 'dist', commitHash, 'packages', 'renderer-worker', 'dist', 'rendererWorkerMain.js')
const content = await readFile(rendererWorkerPath, 'utf8')
const workerPath = join(root, '.tmp', 'dist', 'dist', 'componentStateWorkerMain.js')
const remoteUrl = `/remote/${pathToFileURL(workerPath).toString().slice(8)}`
const localWorker = `// const componentStateWorkerUrl = \`\${assetDir}/packages/component-state-worker/dist/componentStateWorkerMain.js\`;
const componentStateWorkerUrl = \`${remoteUrl}\`;`
const staticWorker = `const componentStateWorkerUrl = \`\${assetDir}/packages/component-state-worker/dist/componentStateWorkerMain.js\`;`
const newContent = content.includes(localWorker) ? content.replace(localWorker, staticWorker) : content
await writeFile(rendererWorkerPath, newContent)

const workerTargetPath = join(root, 'dist', commitHash, 'packages', 'component-state-worker', 'dist', 'componentStateWorkerMain.js')
await mkdir(dirname(workerTargetPath), { recursive: true })
await cp(workerPath, workerTargetPath)
await cp(join(root, 'dist'), join(root, '.tmp', 'static'), { recursive: true })
