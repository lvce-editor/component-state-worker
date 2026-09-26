import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const testRunnerPath = fileURLToPath(
  new URL('../../node_modules/@lvce-editor/test-with-playwright/bin/test-with-playwright.js', import.meta.url),
)
const commonArgs = ['--only-extension=../../.tmp/extensions/builtin.language-features-json', '--headless']

const run = (args, env = process.env) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [testRunnerPath, ...commonArgs, ...args], { env, stdio: 'inherit' })
    child.on('error', (error) => {
      console.error(error)
      resolve(1)
    })
    child.on('exit', (code, signal) => resolve(signal ? 1 : (code ?? 1)))
  })

const legacyResult = await run(['--test-path=.', '--server-path=../build/src/startServer.ts'])
const savedStateResult = await run(['--test-path=saved-state', '--server-path=../build/src/startServerSavedState.ts'], {
  ...process.env,
  COMPONENT_STATE_SAVED_STATE_RUNTIME: '1',
})

process.exitCode = legacyResult === 0 && savedStateResult === 0 ? 0 : 1
