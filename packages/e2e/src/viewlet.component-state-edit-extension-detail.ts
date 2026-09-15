import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-edit-extension-detail'

export const test: Test = async ({ Command, Editor, expect, ExtensionDetail, Locator, Main }) => {
  await ExtensionDetail.open('builtin.theme-atom-one-dark')
  const extensionName = Locator('.ExtensionDetailName')
  await expect(extensionName).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'ExtensionDetail')
  if (!component?.editable) {
    throw new Error(`Expected an editable ExtensionDetail component, got ${JSON.stringify(components)}`)
  }

  // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
  await Locator(`.ComponentStateCard[data-uid="${component.uid}"]`).click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('{')
  const state = JSON.parse(await Editor.getText())
  await Editor.setText(`${JSON.stringify({ ...state, name: 'Live State Extension' }, null, 2)}\n`)
  await Main.save()

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.name !== 'Live State Extension') {
    throw new Error(`Expected ExtensionDetail name to update, got ${updatedState.name}`)
  }
  await ExtensionDetail.open('builtin.theme-atom-one-dark')
  await expect(extensionName).toContainText('Live State Extension')
}
