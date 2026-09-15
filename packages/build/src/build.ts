import { execa } from 'execa'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { bundleJs } from './bundleJs.ts'
import { root } from './root.ts'

const dist = join(root, '.tmp', 'dist')

const getVersion = async (): Promise<string> => {
  const configuredVersion = process.env.RG_VERSION || process.env.GIT_TAG
  if (configuredVersion) {
    return configuredVersion.startsWith('v') ? configuredVersion.slice(1) : configuredVersion
  }
  const result = await execa('git', ['describe', '--exact-match', '--tags'], { reject: false })
  return result.exitCode === 0 ? result.stdout.replace(/^v/, '') : '0.0.0-dev'
}

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await bundleJs()

const packageJsonPath = join(root, 'packages', 'component-state-worker', 'package.json')
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
delete packageJson.scripts
delete packageJson.devDependencies
delete packageJson.jest
packageJson.version = await getVersion()
packageJson.main = 'dist/componentStateWorkerMain.js'

await writeFile(join(dist, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')
await cp(join(root, 'README.md'), join(dist, 'README.md'))
await cp(join(root, 'LICENSE'), join(dist, 'LICENSE'))
await cp(join(root, 'packages', 'component-state-worker', 'settings.json'), join(dist, 'dist', 'settings.json'))

const staticRoot = join(root, 'node_modules/@lvce-editor/static-server/static')
const staticEntries = await readdir(staticRoot, { withFileTypes: true })
const commitDirectory = staticEntries.find((entry) => entry.isDirectory() && /^[a-f0-9]{7}$/.test(entry.name))
if (!commitDirectory) throw new Error('Server static assets are missing')
await cp(
  join(staticRoot, commitDirectory.name, 'js/lvce-editor-rpc.js'),
  join(root, 'packages/e2e/fixtures/sample.component-state-extension-names/rpc.js'),
)
