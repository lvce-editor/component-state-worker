import type { Test } from '@lvce-editor/test-with-playwright'

interface Entry {
  readonly label: string
}

export const name = 'component-state-view.edit-live-title-bar-item'

export const test: Test = async ({ ComponentState, Developer, Editor, expect, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  const originalEntry = Locator('.TitleBarTopLevelEntry', { hasText: 'File' })
  await expect(originalEntry).toBeVisible()
  await Developer.openComponentState()
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'TitleBar')
  if (!component?.editable) {
    throw new Error(`Expected an editable TitleBar component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  const cardTitle = card.locator('.ComponentStateCardTitle')
  await expect(cardTitle).toHaveText('TitleBar')
  const cardStatus = card.locator('.ComponentStateCardStatus')
  await expect(cardStatus).toHaveText('Open JSON state')
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
