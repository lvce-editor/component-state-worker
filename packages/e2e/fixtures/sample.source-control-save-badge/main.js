import { WebWorkerRpcClient } from '../sample.component-state-extension-names/rpc.js'

let badgeCount = 1

const commandMap = {
  'ExtensionApi.executeCommand'() {
    badgeCount = 0
  },
  'ExtensionApi.executeSourceControlGetBadgeCount'() {
    return badgeCount
  },
  'ExtensionApi.executeSourceControlGetFeatures'() {
    return {}
  },
  'ExtensionApi.executeSourceControlGetGroups'() {
    return []
  },
  'ExtensionApi.executeSourceControlIsActive'(_id, scheme) {
    return scheme === 'memfs'
  },
  'ExtensionApi.getStatusBarItems'() {
    return []
  },
  'ExtensionApi.getSourceControlProviderRegistrySnapshot'() {
    return {
      providers: [
        {
          id: 'source-control-save-badge',
        },
      ],
    }
  },
  'ExtensionApi.getViewActions'() {
    return []
  },
  'ExtensionApi.getViewMenuEntries'() {
    return []
  },
  'ExtensionApi.getViewRegistrySnapshot'() {
    return {
      views: [],
    }
  },
}

await WebWorkerRpcClient.create({ commandMap })
