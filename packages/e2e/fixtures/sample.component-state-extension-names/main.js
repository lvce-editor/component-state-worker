import { WebWorkerRpcClient } from './rpc.js'

const views = [
  { icon: 'symbol-keyword', id: 'sample.component-state-hetzner', kind: 'virtualDom', stateful: true, title: 'Hetzner' },
  { icon: 'symbol-keyword', id: 'sample.component-state-notes', kind: 'virtualDom', stateful: true, title: 'Notes' },
]

const states = new Map()

const commandMap = {
  'ExtensionApi.createViewInstance'(viewId, uid) {
    states.set(uid, { uid, viewId })
    return { dom: [], type: 'setDom' }
  },
  'ExtensionApi.disposeViewInstance'(uid) {
    states.delete(uid)
  },
  'ExtensionApi.getStatusBarItems'() {
    return []
  },
  'ExtensionApi.getViewActions'() {
    return []
  },
  'ExtensionApi.getViewMenuEntries'() {
    return []
  },
  'ExtensionApi.getViewRegistrySnapshot'() {
    return { views }
  },
  'ExtensionApi.getViewInstanceState'(uid) {
    return states.get(uid)
  },
  'ExtensionApi.saveViewInstanceState'() {},
}

await WebWorkerRpcClient.create({ commandMap })
