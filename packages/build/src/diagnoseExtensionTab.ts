import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

const patch = async (path: string, before: string, after: string): Promise<void> => {
  const content = await readFile(path, 'utf8')
  if (before.startsWith('  let failed = 0;') && content.includes('const fsDiagnostic = await import')) {
    return
  }
  if (before.startsWith('const getResponse$2 =') && content.includes('const workerDiagnostic = []')) {
    return
  }
  if (before.includes("'TestFrameWork.showTestResults': showTestResults,") && content.includes("'Diagnostic.worker':")) {
    return
  }
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
await patch(
  renderer,
  '  return handleJsonRpcMessage(event.target, event.data, actualExecute, event.target._resolve, preparePrettyError, logError$1, actualRequiresSocket);',
  `  return handleJsonRpcMessage(event.target, event.data, actualExecute, event.target._resolve, preparePrettyError, logError$1, actualRequiresSocket).finally(() => {
    tabDiagnostic('rpc-complete', { method: event.data?.method, id: event.data?.id });
  });`,
)
await patch(
  renderer,
  "  'TestFrameWork.showTestResults': showTestResults,",
  `  'Diagnostic.worker': entries => { globalThis.__workerDiagnostic = entries; },
  'TestFrameWork.showTestResults': showTestResults,`,
)
const worker = join(staticRoot, commit, 'packages/renderer-worker/dist/rendererWorkerMain.js')
await patch(
  worker,
  'const getResponse$2 = async (message, ipc, execute, preparePrettyError, logError, requiresSocket) => {',
  `const workerDiagnostic = [];
const getResponse$2 = async (message, ipc, execute, preparePrettyError, logError, requiresSocket) => {
  const startDiagnostic = performance.now();
  workerDiagnostic.push({ type: 'start', time: startDiagnostic, method: message.method, id: message.id, command: typeof message.params?.[0] === 'string' ? message.params[0] : undefined });`,
)
await patch(
  worker,
  '    const result = requiresSocket(message.method) ? await execute(message.method, ipc, ...message.params) : await execute(message.method, ...message.params);',
  `    const result = requiresSocket(message.method) ? await execute(message.method, ipc, ...message.params) : await execute(message.method, ...message.params);
    workerDiagnostic.push({ type: 'end', time: performance.now(), start: startDiagnostic, method: message.method, id: message.id });`,
)
await patch(
  worker,
  "const showTestResults = (...args) => {\n  return invoke$N('TestFrameWork.showTestResults', ...args);",
  `const showTestResults = async (...args) => {
  await state$G.rpc.invoke('Diagnostic.worker', workerDiagnostic);
  return invoke$N('TestFrameWork.showTestResults', ...args);`,
)
await patch(
  runner,
  'const diagnostic = await page.evaluate(() => globalThis.__tabDiagnostic || []);',
  'const diagnostic = await page.evaluate(() => [...(globalThis.__tabDiagnostic || []), { type: "worker", entries: globalThis.__workerDiagnostic || [] }]);',
)
await patch(
  worker,
  'const workerDiagnostic = [];',
  `const workerDiagnostic = [];
setInterval(() => {
  if (workerDiagnostic.length && state$G.rpc) {
    void state$G.rpc.invoke('Diagnostic.worker', workerDiagnostic.splice(0)).catch(() => {});
  }
}, 250);`,
)
await patch(
  renderer,
  "'Diagnostic.worker': entries => { globalThis.__workerDiagnostic = entries; },",
  "'Diagnostic.worker': entries => { (globalThis.__workerDiagnostic ||= []).push(...entries); },",
)
await patch(
  worker,
  'const execute$5 = (command, ...args) => {',
  `const execute$5 = (command, ...args) => {
  const start = performance.now();
  workerDiagnostic.push({ type: 'command-start', time: start, command });
  const result = executeDiagnosticOriginal(command, ...args);
  const finish = () => workerDiagnostic.push({ type: 'command-end', time: performance.now(), start, command });
  if (result && typeof result.then === 'function') { result.then(finish, finish); } else { finish(); }
  return result;
};
const executeDiagnosticOriginal = (command, ...args) => {`,
)
await patch(
  worker,
  '  Object.assign(commandMapRef, commandMap);',
  `  state$K.commands['Diagnostic.editor'] = entry => { workerDiagnostic.push(entry); };
  Object.assign(commandMapRef, commandMap);`,
)
const editor = join(staticRoot, commit, 'packages/editor-worker/dist/editorWorkerMain.js')
await patch(
  editor,
  'const loadContent = async (state, savedState) => {',
  `const loadContent = async (state, savedState) => {
  const editorDiagnostic = phase => { void invoke$a('Diagnostic.editor', { type: 'editor-phase', time: performance.now(), phase, id: state.id }).catch(() => {}); };
  editorDiagnostic('start');`,
)
await patch(editor, '} = await getEditorPreferences();', "} = await getEditorPreferences();\n  editorDiagnostic('preferences');")
await patch(
  editor,
  "  editorDiagnostic('preferences');\n  // TODO support overwriting language id by setting it explicitly or via settings\n  const charWidth = await measureCharacterWidth(fontWeight, fontSize, fontFamily, letterSpacing);",
  `  editorDiagnostic('preferences');
  // TODO support overwriting language id by setting it explicitly or via settings
  const charWidth = await measureCharacterWidth(fontWeight, fontSize, fontFamily, letterSpacing);
  editorDiagnostic('measureCharacterWidth');`,
)
await patch(editor, '  setTokenizePaths(languages);', "  editorDiagnostic('languages');\n  setTokenizePaths(languages);")
await patch(
  editor,
  '  await loadTokenizer(computedLanguageId, tokenizePath);',
  "  await loadTokenizer(computedLanguageId, tokenizePath);\n  editorDiagnostic('tokenizer');",
)
await patch(
  editor,
  '  const savedHistory = existingEditor ? undefined : getSavedHistory(savedState, content);',
  "  editorDiagnostic('readFile');\n  const savedHistory = existingEditor ? undefined : getSavedHistory(savedState, content);",
)
await patch(editor, '  const newEditor3WithBreadcrumbs = {', "  editorDiagnostic('breadcrumbs');\n  const newEditor3WithBreadcrumbs = {")
await patch(
  editor,
  '  } = await getVisible$1(newEditor3WithBreadcrumbs, syncIncremental);',
  "  } = await getVisible$1(newEditor3WithBreadcrumbs, syncIncremental);\n  editorDiagnostic('visible');",
)
const extensionManagement = join(staticRoot, commit, 'packages/extension-management-worker/dist/extensionManagementWorkerMain.js')
await patch(
  extensionManagement,
  'const getAllExtensionsWithState = async (extensionsState, assetDir, platform) => {',
  `const getAllExtensionsWithState = async (extensionsState, assetDir, platform) => {
  const diagnosticId = performance.now();
  const extensionDiagnostic = phase => { void invoke$4('Diagnostic.editor', { type: 'extension-phase', time: performance.now(), phase, id: diagnosticId, platform }).catch(() => {}); };
  extensionDiagnostic('start');`,
)
await patch(
  extensionManagement,
  '  const meta = extensionsState.webExtensions;',
  "  extensionDiagnostic('runtime');\n  const meta = extensionsState.webExtensions;",
)
await patch(
  extensionManagement,
  "  const local = await invoke$3('ExtensionManagement.getAllExtensions');\n  return getExtensionsWithState([...local, ...meta], extensionsState, resolvedPlatform);",
  `  extensionDiagnostic('shared-start');
  const local = await invoke$3('ExtensionManagement.getAllExtensions');
  extensionDiagnostic('shared-end');
  const result = await getExtensionsWithState([...local, ...meta], extensionsState, resolvedPlatform);
  extensionDiagnostic('enablement-end');
  return result;`,
)
