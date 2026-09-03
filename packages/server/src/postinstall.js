import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(import.meta.dirname, '..', '..', '..')
const workerPath = join(root, '.tmp', 'dist', 'dist', 'componentStateWorkerMain.js')
const staticServerPackagePath = fileURLToPath(import.meta.resolve('@lvce-editor/static-server/package.json'))
const serverStaticPath = join(dirname(staticServerPackagePath), 'static')
const commitHashPattern = /^[a-z\d]{7}$/
const commitHash = (await readdir(serverStaticPath)).find((entry) => commitHashPattern.test(entry)) || ''
const rendererWorkerPath = join(serverStaticPath, commitHash, 'packages', 'renderer-worker', 'dist', 'rendererWorkerMain.js')
const content = await readFile(rendererWorkerPath, 'utf8')

if (!content.includes('// const componentStateWorkerUrl = ')) {
  const remoteUrl = `/remote/${pathToFileURL(workerPath).toString().slice(8)}`
  const staticWorker = `const componentStateWorkerUrl = \`\${assetDir}/packages/component-state-worker/dist/componentStateWorkerMain.js\`;`
  const localWorker = `// ${staticWorker}\nconst componentStateWorkerUrl = \`${remoteUrl}\`;`
  if (content.includes(staticWorker)) {
    await writeFile(rendererWorkerPath, content.replace(staticWorker, localWorker))
  }
}
