import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.open-state'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Settings, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  // Keep this component-state test independent of browser-specific font loading behavior.
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')

  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
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
