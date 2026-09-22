import { readFile, writeFile } from 'node:fs/promises'

const path = 'node_modules/@lvce-editor/static-server/static/e271222/packages/source-control-worker/dist/sourceControlWorkerMain.js'
let source = await readFile(path, 'utf8')
const replaceOnce = (from, to) => {
  if (source.split(from).length !== 2) throw new Error(`Expected one capture target: ${from}`)
  source = source.replace(from, to)
}
replaceOnce('wrapCommand(i){return async(d,...g)=>{const m=s(d),{newState:h,oldState:C}=n[d],y=await i(h,...g);if(C===y||h===y||!c(d,m))return;', 'wrapCommand(i){return async(d,...g)=>{const m=s(d),{newState:h,oldState:C}=n[d],y=await i(h,...g);if(globalThis.__stateTrace.length<200)globalThis.__stateTrace.push({fn:i.name,uid:d,time:performance.now(),before:h.providerUnavailableMessage,current:n[d]?.newState.providerUnavailableMessage,result:y?.providerUnavailableMessage,changed:Object.keys(y||{}).filter(k=>y[k]!==h[k])});if(C===y||h===y||!c(d,m))return;')
replaceOnce('ii=e=>ie(e).newState,', 'ii=e=>({...ie(e).newState,__stateTrace:globalThis.__stateTrace}),')
source = 'globalThis.__stateTrace=[];\n' + source
await writeFile(path, source)
console.log(`Capturing Source Control state writes in ${path}`)
