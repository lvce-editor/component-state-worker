import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.edit-live-source-control'

export const test: Test = async ({
  Command,
  ComponentState,
  Developer,
  Editor,
  expect,
  FileSystem,
  Locator,
  Settings,
  SideBar,
  Workspace,
}) => {
  await Command.execute('ExtensionManagement.activateByEvent', 'onLanguage:json')
  await Command.execute('Layout.handleExtensionsChanged')
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setUri(tmpDir)
  await SideBar.open('Source Control')
  const sourceControl = Locator('.SourceControl')
  await expect(sourceControl).toBeVisible()
  const message = Locator('.SourceControl .Message')
  await expect(message).toHaveText('No source control extensions are installed.')
  await Developer.openComponentState()
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Source Control')
  if (!component?.editable) {
    throw new Error(`Expected an editable Source Control component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  const cardTitle = card.locator('.ComponentStateCardTitle')
  await expect(cardTitle).toHaveText('Source Control')
  const cardStatus = card.locator('.ComponentStateCardStatus')
  await expect(cardStatus).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- the card click and its live editor subscription are the behavior under test
  await card.click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const state = await Editor.getTextAsJson()
  const { id } = state
  if (id !== component.uid) {
    throw new Error(`Expected Source Control state id ${component.uid}, got ${id}`)
  }
  await Editor.setJsonAsText({ ...state, providerUnavailableMessage: 'Live source control message' })

  await expect(message).toHaveText('Live source control message')

  const updatedState = await ComponentState.getState<{ readonly providerUnavailableMessage: string }>(component.uid)
  if (updatedState.providerUnavailableMessage !== 'Live source control message') {
    throw new Error(`Expected Source Control message to update, got ${updatedState.providerUnavailableMessage}`)
  }
}
