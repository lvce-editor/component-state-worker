import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.edit-live-extension-search'

export const test: Test = async ({ Command, Editor, expect, ExtensionSearch, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await ExtensionSearch.open()
  const searchInput = Locator('.Extensions [name="extensions"]')
  await expect(searchInput).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Extensions')
  if (!component?.editable) {
    throw new Error(`Expected an editable Extensions component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Extensions')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click -- the card click and its live editor subscription are the behavior under test
  await card.click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  const { uid } = state
  if (uid !== component.uid) {
    throw new Error(`Expected Extensions state uid ${component.uid}, got ${uid}`)
  }
  await Editor.setText(`${JSON.stringify({ ...state, inputSource: 2, searchValue: '@disabled' }, null, 2)}\n`)

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.searchValue !== '@disabled') {
    throw new Error(`Expected Extensions search value to update, got ${updatedState.searchValue}`)
  }
  await expect(searchInput).toHaveValue('@disabled')
}
