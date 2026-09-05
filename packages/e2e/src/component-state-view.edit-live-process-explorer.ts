import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.edit-live-process-explorer'

export const test: Test = async ({ Command, Editor, expect, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Command.execute('Developer.openProcessExplorer')
  await Command.execute('ProcessExplorer.setUpdateInterval', 0)
  const processExplorer = Locator('.ProcessExplorer')
  await expect(processExplorer).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'ProcessExplorer')
  if (!component?.editable) {
    throw new Error(`Expected an editable ProcessExplorer component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('ProcessExplorer')
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
    throw new Error(`Expected ProcessExplorer state uid ${component.uid}, got ${uid}`)
  }
  await Editor.setText(`${JSON.stringify({ ...state, errorMessage: 'Live State Error' }, null, 2)}\n`)

  await Command.execute('Developer.openProcessExplorer')
  const errorMessage = Locator('.ProcessExplorerError')
  await expect(errorMessage).toContainText('Live State Error')

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.errorMessage !== 'Live State Error') {
    throw new Error(`Expected ProcessExplorer error message to update, got ${updatedState.errorMessage}`)
  }
}
