import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.edit-live-source-control'

export const test: Test = async ({ ComponentState, Developer, Editor, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
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
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Source Control')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click -- the card click and its live editor subscription are the behavior under test
  await card.click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  const { id } = state
  if (id !== component.uid) {
    throw new Error(`Expected Source Control state id ${component.uid}, got ${id}`)
  }
  await Editor.setText(`${JSON.stringify({ ...state, providerUnavailableMessage: 'Live source control message' }, null, 2)}\n`)

  await expect(message).toHaveText('Live source control message')

  const updatedState = await ComponentState.getState<{ readonly providerUnavailableMessage: string }>(component.uid)
  if (updatedState.providerUnavailableMessage !== 'Live source control message') {
    throw new Error(`Expected Source Control message to update, got ${updatedState.providerUnavailableMessage}`)
  }
}
