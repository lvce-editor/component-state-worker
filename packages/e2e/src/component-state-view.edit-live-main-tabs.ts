import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

interface Tab {
  readonly title: string
  readonly uri: string
}

interface Group {
  readonly tabs: readonly Tab[]
}

export const name = 'component-state-view.edit-live-main-tabs'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/original.txt`
  await FileSystem.writeFile(uri, 'original content')
  await Main.openUri(uri)
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText('original.txt')
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Main')
  if (!component?.editable) {
    throw new Error(`Expected an editable Main component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Main')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click -- the card click and its live editor subscription are the behavior under test
  await card.click()
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  const { layout: originalLayout, uid } = state
  if (uid !== component.uid) {
    throw new Error(`Expected Main state uid ${component.uid}, got ${uid}`)
  }
  const groups = (originalLayout.groups as readonly Group[]).map((group) => ({
    ...group,
    tabs: group.tabs.map((tab) => (tab.uri === uri ? { ...tab, title: 'Live tab label' } : tab)),
  }))
  await Editor.setText(`${JSON.stringify({ ...state, layout: { ...originalLayout, groups } }, null, 2)}\n`)
  const updatedTab = Locator('.Main .TabTitle', { hasText: 'Live tab label' })
  await expect(updatedTab).toBeVisible()
  const originalTab = Locator('.Main .TabTitle', { hasText: 'original.txt' })
  await expect(originalTab).toHaveCount(0)
}
