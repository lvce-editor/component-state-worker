import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.edit-live-simple-browser'

// The standard e2e runner is browser-only; this view requires Electron WebContentsView.
export const skip = 1

export const test: Test = async ({ Command, Editor, expect, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Command.execute('Layout.showPreview', 'simple-browser://')
  const browser = Locator('.SimpleBrowser')
  await expect(browser).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'SimpleBrowser')
  if (!component?.editable) {
    throw new Error(`Expected an editable SimpleBrowser component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('SimpleBrowser')
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
    throw new Error(`Expected SimpleBrowser state uid ${component.uid}, got ${uid}`)
  }
  await Editor.setText(`${JSON.stringify({ ...state, inputValue: 'Live browser state' }, null, 2)}\n`)

  const addressInput = Locator('.SimpleBrowserHeader input.InputBox')
  await expect(addressInput).toHaveValue('Live browser state')

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.inputValue !== 'Live browser state') {
    throw new Error(`Expected SimpleBrowser input to update, got ${JSON.stringify(updatedState.inputValue)}`)
  }
}
