import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const staticRoot = 'packages/build/node_modules/@lvce-editor/static-server/static'
const entries = (await readdir(staticRoot)).filter((entry) => /^[a-f0-9]{7,40}$/.test(entry))
if (entries.length !== 1) throw new Error('Expected one pinned static runtime')
const path = join(staticRoot, entries[0], 'packages/activity-bar-worker/dist/activityBarWorkerMain.js')
const original = await readFile(path, 'utf8')
const needle = '\n        const newerState = await fn(newState, ...args);'
if (original.split(needle).length !== 2) throw new Error('Expected one ActivityBar command wrapper')
const prelude = `
const activityDiagnosticEvents = [];
const activityDiagnosticRecord = (phase, name, state) => {
  activityDiagnosticEvents.push({ phase, name, time: performance.now(), title: state?.activityBarItems?.find(item => item.id === 'Explorer')?.title });
  if (activityDiagnosticEvents.length > 20) activityDiagnosticEvents.shift();
};
const activityDiagnosticPost = MessagePort.prototype.postMessage;
MessagePort.prototype.postMessage = function(message, ...rest) {
  if (message?.method === 'Viewlet.queueCommands') {
    message = { ...message, activityDiagnosticEvents: [...activityDiagnosticEvents] };
  }
  return activityDiagnosticPost.call(this, message, ...rest);
};
`
const replacement = `
        activityDiagnosticRecord('start', fn.name, newState);
        const newerState = await fn(newState, ...args);
        activityDiagnosticRecord('finish', fn.name, newerState);`
await writeFile(path, prelude + original.replace(needle, replacement))
console.info('Instrumented pinned ActivityBar worker:', path)
