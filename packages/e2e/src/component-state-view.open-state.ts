import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.open-state'

export const test: Test = async ({ ComponentState, Developer, Editor, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  // Keep this component-state test independent of browser-specific font loading behavior.
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Developer.openComponentState()

  const components = await ComponentState.getComponents()
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer || !explorer.editable) {
    throw new Error(`Expected an editable Explorer component, got ${JSON.stringify(components)}`)
  }
  const explorerCard = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  // eslint-disable-next-line e2e/no-direct-click -- verifies that a rendered component card opens its live JSON state
  await explorerCard.click()

  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  const editor = Locator('.Editor')
  await expect(selectedTabTitle).toHaveText(`${explorer.uid}.json`)
  await expect(editor).toBeVisible()
  const content = await Editor.getText()
  const state = JSON.parse(content)
  const { uid } = state
  if (uid !== explorer.uid) {
    throw new Error(`Expected state uid ${explorer.uid}, got ${uid}`)
  }
}
