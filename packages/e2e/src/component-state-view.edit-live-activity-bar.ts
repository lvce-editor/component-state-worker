import type { Test } from '@lvce-editor/test-with-playwright'

interface ActivityBarItem {
  readonly title: string
}

const updateTitle = (items: readonly ActivityBarItem[]): readonly ActivityBarItem[] =>
  items.map((item) => ({ ...item, title: item.title === 'Explorer' ? 'Live Activity Bar' : item.title }))

export const name = 'component-state-view.edit-live-activity-bar'

export const test: Test = async ({ ComponentState, Developer, Editor, expect, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  const activityBar = Locator('.ActivityBar')
  await expect(activityBar).toBeVisible()
  const originalItem = Locator('.ActivityBarItem[title="Explorer"]')
  await expect(originalItem).toBeVisible()
  await Developer.openComponentState()
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'ActivityBar')
  if (!component?.editable) {
    throw new Error(`Expected an editable ActivityBar component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('ActivityBar')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- the card click and its live editor subscription are the behavior under test
  await card.click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  const { activityBarItems, filteredItems, uid } = state
  if (uid !== component.uid) {
    throw new Error(`Expected ActivityBar state uid ${component.uid}, got ${uid}`)
  }
  await Editor.setText(
    `${JSON.stringify({ ...state, activityBarItems: updateTitle(activityBarItems), filteredItems: updateTitle(filteredItems) }, null, 2)}\n`,
  )

  const updatedItem = Locator('.ActivityBarItem[title="Live Activity Bar"]')
  await expect(updatedItem).toBeVisible()
  await expect(originalItem).toHaveCount(0)
}
