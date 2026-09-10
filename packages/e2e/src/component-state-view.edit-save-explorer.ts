import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.edit-save-explorer'

export const test: Test = async ({
  ComponentState,
  Developer,
  Editor,
  expect,
  FileSystem,
  Locator,
  Main,
  Settings,
  SideBar,
  Workspace,
}) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: 'first', uri: `${tmpDir}/a.txt` },
    { content: 'second', uri: `${tmpDir}/b.txt` },
  ])
  // Keep this component-state test independent of browser-specific font loading behavior.
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
  if (!explorer || !explorer.editable) {
    throw new Error(`Expected an editable Explorer component, got ${JSON.stringify(components)}`)
  }

  const explorerCard = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  await expect(explorerCard).toBeVisible()
  const explorerStateUri = `live-component-state:///${explorer.uid}.json`
  const fileContent = await FileSystem.readFile(explorerStateUri)
  const fileState = JSON.parse(fileContent)
  await Main.closeAllEditors()
  await Main.openUri(explorerStateUri)
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  const editor = Locator('.Editor')
  await expect(selectedTabTitle).toHaveText(`${explorer.uid}.json`)
  await expect(editor).toBeVisible()

  const state = JSON.parse(await Editor.getText())
  if (JSON.stringify(state) !== JSON.stringify(fileState)) {
    throw new Error('Expected the editor content to match the live file-system provider content')
  }
  await Editor.setText(`${JSON.stringify({ ...state, focusedIndex: 1 }, null, 2)}\n`)
  await Main.save()

  const updatedState = await ComponentState.getState<{ readonly focusedIndex: number }>(explorer.uid)
  if (updatedState.focusedIndex !== 1) {
    throw new Error(`Expected Explorer focusedIndex to be 1, got ${updatedState.focusedIndex}`)
  }
  await expect(secondExplorerItem).toHaveId('TreeItemActive')
}
