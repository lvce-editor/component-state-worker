import { activate, registerCommand, registerSourceControlProvider } from '@lvce-editor/api'

await activate()
let badgeCount = 1
registerSourceControlProvider({
  id: 'source-control-save-badge',
  getBadgeCount() {
    return badgeCount
  },
  getFeatures() {
    return {}
  },
  getGroups() {
    return []
  },
  isActive(scheme) {
    return scheme === 'memfs'
  },
})
registerCommand({
  id: 'sourceControlSaveBadge.clear',
  execute() {
    badgeCount = 0
  },
})
