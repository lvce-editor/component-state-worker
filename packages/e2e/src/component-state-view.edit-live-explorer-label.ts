import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

interface Item {
  readonly name: string
}

export const name = 'component-state-view.edit-live-explorer-label'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Settings, Workspace }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/original.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const originalItem = Locator('.Explorer .TreeItem[aria-label="original.txt"]')
  await expect(originalItem).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Explorer')
  if (!component?.editable) {
    throw new Error(`Expected an editable Explorer component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Explorer')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click -- the card click and its live editor subscription are the behavior under test
  await card.click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  const { items: originalItems, uid } = state
  if (uid !== component.uid) {
    throw new Error(`Expected Explorer state uid ${component.uid}, got ${uid}`)
  }
  const items = (originalItems as readonly Item[]).map((item) =>
    item.name === 'original.txt' ? { ...item, name: 'Live explorer label' } : item,
  )
  await Editor.setText(`${JSON.stringify({ ...state, items }, null, 2)}\n`)
  const updatedItem = Locator('.Explorer .TreeItem[aria-label="Live explorer label"]')
  await expect(updatedItem).toBeVisible()
  await expect(originalItem).toHaveCount(0)
}
