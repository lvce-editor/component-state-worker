import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

const patch = async (path: string, before: string, after: string): Promise<void> => {
  const content = await readFile(path, 'utf8')
  if (content.includes(after)) {
    return
  }
  if (content.split(before).length !== 2) {
    throw new Error(`Expected one diagnostic target in ${path}: ${before}`)
  }
  await writeFile(path, content.replace(before, after))
}
const staticRoot = join(root, 'node_modules/@lvce-editor/static-server/static')
const entries = await readdir(staticRoot)
const commit = entries.find((entry) => /^[a-f0-9]+$/.test(entry))
if (!commit) {
  throw new Error('Missing static server commit directory')
}
const renderer = join(staticRoot, commit, 'packages/renderer-process/dist/rendererProcessMain.js')
await patch(
  renderer,
  'const handleMessage = event => {',
  `
const tabDiagnostic = (type, data = {}) => {
  (globalThis.__tabDiagnostic ||= []).push({ time: performance.now(), type, ...data });
};
let lastTab;
new MutationObserver(() => {
  const tab = document.querySelector('.MainTabSelected .TabTitle')?.textContent;
  if (tab !== lastTab) { lastTab = tab; tabDiagnostic('tab', { tab }); }
}).observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
document.addEventListener('click', event => {
  tabDiagnostic('click', { target: event.target?.className, uid: event.target?.closest('[data-uid]')?.dataset.uid });
}, true);
const handleMessage = event => {
  tabDiagnostic('rpc', { method: event.data?.method, id: event.data?.id });
`,
)
await patch(
  renderer,
  'const endTime = performance.now() + conditionTimeout;',
  `const endTime = performance.now() + conditionTimeout;
  tabDiagnostic('condition-start', { endTime });`,
)
await patch(
  renderer,
  '    if (check()) {',
  `    if (check()) {
      tabDiagnostic('condition-pass', { endTime });`,
)
await patch(
  renderer,
  '  return {\n    error: true\n  };',
  `  tabDiagnostic('condition-timeout', { endTime, finalCheck: check(), tab: document.querySelector('.MainTabSelected .TabTitle')?.textContent });
  return { error: true };`,
)
const runner = join(root, 'node_modules/@lvce-editor/test-with-playwright-worker/dist/workerMain.js')
await patch(
  runner,
  '  let failed = 0;\n  let passed = 0;\n  let skipped = 0;\n  for (const result of results) {',
  `  const diagnostic = await page.evaluate(() => globalThis.__tabDiagnostic || []);
  const fsDiagnostic = await import('node:fs/promises');
  await fsDiagnostic.mkdir('.tmp', { recursive: true });
  await fsDiagnostic.writeFile('.tmp/extension-tab-' + Date.now() + '.json', JSON.stringify({ results, diagnostic }, null, 2));
  let failed = 0;
  let passed = 0;
  let skipped = 0;
  for (const result of results) {`,
)
