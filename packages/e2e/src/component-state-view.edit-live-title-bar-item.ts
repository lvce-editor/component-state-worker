import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

interface Entry {
  readonly label: string
}

export const name = 'component-state-view.edit-live-title-bar-item'

export const test: Test = async ({ Command, Editor, expect, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  const originalEntry = Locator('.TitleBarTopLevelEntry', { hasText: 'File' })
  await expect(originalEntry).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'TitleBar')
  if (!component?.editable) {
    throw new Error(`Expected an editable TitleBar component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('TitleBar')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click -- the card click and its live editor subscription are the behavior under test
  await card.click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  const { titleBarEntries: originalTitleBarEntries, uid } = state
  if (uid !== component.uid) {
    throw new Error(`Expected TitleBar state uid ${component.uid}, got ${uid}`)
  }
  const titleBarEntries = (originalTitleBarEntries as readonly Entry[]).map((entry) =>
    entry.label === 'File' ? { ...entry, label: 'Live menu label' } : entry,
  )
  await Editor.setText(`${JSON.stringify({ ...state, titleBarEntries }, null, 2)}\n`)
  const updatedEntry = Locator('.TitleBarTopLevelEntry', { hasText: 'Live menu label' })
  await expect(updatedEntry).toBeVisible()
  await expect(originalEntry).toHaveCount(0)
}
