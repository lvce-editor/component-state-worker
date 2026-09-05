import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.edit-live-extension-detail'

export const test: Test = async ({ Command, Editor, expect, ExtensionDetail, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await ExtensionDetail.open('builtin.language-features-json')
  const extensionName = Locator('.ExtensionDetailName')
  await expect(extensionName).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'ExtensionDetail')
  if (!component?.editable) {
    throw new Error(`Expected an editable ExtensionDetail component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('ExtensionDetail')
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
    throw new Error(`Expected ExtensionDetail state uid ${component.uid}, got ${uid}`)
  }
  await Editor.setText(`${JSON.stringify({ ...state, name: 'Live State Extension' }, null, 2)}\n`)

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.name !== 'Live State Extension') {
    throw new Error(`Expected ExtensionDetail name to update, got ${updatedState.name}`)
  }
  await ExtensionDetail.open('builtin.language-features-json')
  await expect(extensionName).toContainText('Live State Extension')
}
