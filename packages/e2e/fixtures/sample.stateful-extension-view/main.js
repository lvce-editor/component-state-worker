import { activate as activateExtensionApi, registerView } from '@lvce-editor/api'

const textNode = (text) => ({
  childCount: 0,
  text,
  type: 4,
})

export const activate = async () => {
  await activateExtensionApi()
  registerView({
    createInitialState(context) {
      return {
        count: 1,
        uid: context.uid,
      }
    },
    id: 'sample.views.stateful',
    kind: 'virtualDom',
    render(state) {
      return [textNode(`Extension count: ${state.count}`)]
    },
  })
}
