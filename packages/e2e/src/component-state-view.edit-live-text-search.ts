import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.edit-live-text-search'

export const test: Test = async ({ Command, Editor, expect, Locator, Settings, SideBar }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await SideBar.open('Search')
  const searchInput = Locator('.SideBar textarea[name="SearchValue"]')
  await expect(searchInput).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Search')
  if (!component?.editable) {
    throw new Error(`Expected an editable Search component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Search')
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
    throw new Error(`Expected Search state uid ${component.uid}, got ${uid}`)
  }
  await Editor.setText(`${JSON.stringify({ ...state, inputSource: 2, value: 'live state query' }, null, 2)}\n`)

  await expect(searchInput).toHaveValue('live state query')

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.value !== 'live state query') {
    throw new Error(`Expected Search value to update, got ${updatedState.value}`)
  }
}
