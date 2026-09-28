import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.edit-live-ports'

export const test: Test = async ({ Command, ComponentState, Developer, Editor, expect, Locator, Panel, Settings, Workspace }) => {
  await Command.execute('ExtensionManagement.activateByEvent', 'onLanguage:json')
  await Command.execute('Layout.handleExtensionsChanged')
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Workspace.setUri('remote-ssh://test/workspace')
  await Panel.open('Ports')
  const ports = Locator('.Ports')
  await expect(ports).toBeVisible()
  await Developer.openComponentState()
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Ports')
  if (!component?.editable) {
    throw new Error(`Expected an editable Ports component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Ports')
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
    throw new Error(`Expected Ports state uid ${component.uid}, got ${uid}`)
  }
  await Editor.setText(`${JSON.stringify({ ...state, addPortValue: '5123', editing: true }, null, 2)}\n`)
  const input = Locator('.Ports .AddPortInput')
  await expect(input).toBeVisible()
  await expect(input).toHaveValue('5123')
}
