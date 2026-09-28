import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.show-saved-state'

export const test: Test = async ({ Command, ComponentState, ContextMenu, Developer, Editor, expect, FileSystem, Locator, SideBar }) => {
  await SideBar.open('Explorer')
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Explorer')
  if (!component) {
    throw new Error('Expected an Explorer component')
  }

  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  const view = await ComponentState.getComponent('ComponentState')
  await Command.execute('Viewlet.executeViewletCommand', view.uid, 'handleContextMenu', String(component.uid), 100, 100)
  const showSavedState = Locator('[role="menuitem"]', { hasText: 'Show Saved State' })
  await expect(showSavedState).toBeVisible()
  await ContextMenu.selectItem('Show Saved State')

  const savedStateUri = `live-component-state:///saved/${component.uid}.json`
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorState = JSON.parse(await Editor.getText())
  const savedState = await Command.execute('ComponentState.getSavedState', component.uid)
  const fileContents = await FileSystem.readFile(savedStateUri)
  if (JSON.stringify(editorState) !== JSON.stringify(savedState) || `${JSON.stringify(editorState, null, 2)}\n` !== fileContents) {
    throw new Error('Expected the saved-state document to show the component saveState output')
  }
  if (!(await Command.execute('FileSystem.isReadonly', savedStateUri))) {
    throw new Error('Expected saved-state JSON documents to be read-only')
  }
}
