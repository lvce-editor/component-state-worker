import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.edit-live-problems'

export const test: Test = async ({ Command, Editor, expect, Locator, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Command.execute('Layout.showPanel', 'Problems')
  const filter = Locator('.Panel .InputBox')
  await expect(filter).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Problems')
  if (!component?.editable) {
    throw new Error(`Expected an editable Problems component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Problems')
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
    throw new Error(`Expected Problems state uid ${component.uid}, got ${uid}`)
  }
  // Keep the filter inside the component so this also covers its compact layout.
  await Editor.setText(
    `${JSON.stringify({ ...state, filterValue: 'live state filter', inputSource: 2, smallWidthBreakPoint: 10_000 }, null, 2)}\n`,
  )

  const compactFilter = Locator('.Problems .InputBox')
  await expect(compactFilter).toBeVisible()
  await expect(compactFilter).toHaveValue('live state filter')

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.filterValue !== 'live state filter') {
    throw new Error(`Expected Problems filter to update, got ${updatedState.filterValue}`)
  }
}
