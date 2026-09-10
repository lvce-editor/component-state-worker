import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.edit-live-explorer'

export const test: Test = async ({ ComponentState, Developer, Editor, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: 'first', uri: `${tmpDir}/a.txt` },
    { content: 'second', uri: `${tmpDir}/b.txt` },
  ])
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')

  const firstExplorerItem = Locator('.Explorer .TreeItem[aria-label="a.txt"]')
  const secondExplorerItem = Locator('.Explorer .TreeItem[aria-label="b.txt"]')
  await expect(firstExplorerItem).toBeVisible()
  await expect(secondExplorerItem).toBeVisible()

  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer?.editable) {
    throw new Error(`Expected an editable Explorer component, got ${JSON.stringify(components)}`)
  }

  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  const editor = Locator('.Editor')
  // eslint-disable-next-line e2e/no-direct-click -- verifies that opening a component state subscribes its editor to live updates
  await Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`).click()
  await expect(selectedTabTitle).toHaveText(`${explorer.uid}.json`)
  await expect(editor).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  await Editor.setText(`${JSON.stringify({ ...state, focusedIndex: 1 }, null, 2)}\n`)

  const updatedState = await ComponentState.getState<{ readonly focusedIndex: number }>(explorer.uid)
  if (updatedState.focusedIndex !== 1) {
    throw new Error(`Expected Explorer focusedIndex to update immediately, got ${updatedState.focusedIndex}`)
  }
  await expect(secondExplorerItem).toHaveId('TreeItemActive')
}
