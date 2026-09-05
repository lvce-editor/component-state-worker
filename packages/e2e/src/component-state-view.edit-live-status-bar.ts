import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.edit-live-status-bar'

export const test: Test = async ({ Command, Editor, expect, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  const statusBar = Locator('.StatusBar')
  await expect(statusBar).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'StatusBar')
  if (!component?.editable) {
    throw new Error(`Expected an editable StatusBar component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('StatusBar')
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
    throw new Error(`Expected StatusBar state uid ${component.uid}, got ${uid}`)
  }
  const statusBarItemsLeft = [
    {
      ariaLabel: 'Live status label',
      elements: [{ type: 'text', value: 'Live status label' }],
      name: 'component.state.test',
      tooltip: 'Live status label',
    },
  ]
  await Editor.setText(`${JSON.stringify({ ...state, statusBarItemsLeft }, null, 2)}\n`)
  const item = Locator('.StatusBarItem[name="component.state.test"]')
  await expect(item).toHaveText('Live status label')
}
