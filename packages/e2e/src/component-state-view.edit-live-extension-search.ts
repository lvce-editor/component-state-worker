import type { Test } from '@lvce-editor/test-with-playwright'
// eslint-disable-next-line e2e/no-imports -- rendering can complete before the state snapshot is committed
import { waitForState } from './_waitForState.ts'

export const name = 'component-state-view.edit-live-extension-search'

export const test: Test = async ({ Command, ComponentState, Developer, Editor, expect, ExtensionSearch, Locator, Settings }) => {
  await Command.execute('ExtensionManagement.activateByEvent', 'onLanguage:json')
  await Command.execute('Layout.handleExtensionsChanged')
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await ExtensionSearch.open()
  const searchInput = Locator('.Extensions [name="extensions"]')
  await expect(searchInput).toBeVisible()
  await Developer.openComponentState()
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Extensions')
  if (!component?.editable) {
    throw new Error(`Expected an editable Extensions component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Extensions')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- the card click and its live editor subscription are the behavior under test
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

  await expect(searchInput).toHaveValue('@disabled')

  await waitForState(
    async () => ComponentState.getState<{ readonly searchValue: string }>(component.uid),
    (value) => value.searchValue === '@disabled',
    'the live extension search value',
  )
}
