import type { Test } from '@lvce-editor/test-with-playwright'
// eslint-disable-next-line e2e/no-imports -- wait for the live state edit to be applied
import { waitForState } from './_waitForState.ts'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-edit-settings'

export const test: Test = async ({ Command, Editor, expect, KeyBoard, Locator, Main }) => {
  await Command.execute('Preferences.openSettingsUi')
  const settingsView = Locator('.Settings')
  await expect(settingsView).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Settings')
  if (!component?.editable) {
    throw new Error(`Expected an editable Settings component, got ${JSON.stringify(components)}`)
  }

  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies the component state card, menu, or input interaction
  await Locator(`.ComponentStateCard[data-uid="${component.uid}"]`).click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('{')
  const state = JSON.parse(await Editor.getText())
  const { id } = state
  if (id !== component.uid) {
    throw new Error(`Expected Settings state id ${component.uid}, got ${id}`)
  }

  await Editor.setText(`${JSON.stringify({ ...state, searchValue: 'editor' }, null, 2)}\n`)
  await Main.save()

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.searchValue !== 'editor') {
    throw new Error(`Expected Settings search value to update, got ${updatedState.searchValue}`)
  }
  await Command.execute('Preferences.openSettingsUi')
  await expect(settingsView).toBeVisible()
  const settingsSearchInput = Locator('.SettingsSearchInput')
  await expect(settingsSearchInput).toBeVisible()
  const settingsSearch = Locator('[name="SettingsSearch"]')
  await expect(settingsSearch).toHaveValue('editor')
  const searchInput = Locator('[name="SettingsSearch"]')
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies the component state card, menu, or input interaction
  await searchInput.click()
  await KeyBoard.press('Control+A')
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- exercise live updates from the Settings input
  await searchInput.type('font')
  await waitForState(
    async () => Command.execute('ComponentState.getState', component.uid),
    (value) => value.searchValue === 'font',
    'Settings state to refresh after UI interaction',
  )
}
