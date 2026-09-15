import { activate, registerView } from '@lvce-editor/api'

await activate()
for (const title of ['Hetzner', 'Notes']) {
  const id = `sample.component-state-${title.toLowerCase()}`
  registerView({
    id,
    kind: 'virtualDom',
    createInitialState(context) {
      return { uid: context.uid, viewId: id }
    },
    render() {
      return []
    },
  })
}
