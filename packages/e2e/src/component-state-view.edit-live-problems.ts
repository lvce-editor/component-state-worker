import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.edit-live-problems'

// The bundled renderer does not expose the compact Problems filter after this state edit.
// Already failing on main before DOM editing: https://github.com/lvce-editor/component-state-worker/actions/runs/33993176828
export const skip = 1

export const test: Test = async ({ ComponentState, Developer, Editor, expect, Locator, Panel, Settings }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Panel.open('Problems')
  const filter = Locator('.Panel .InputBox')
  await expect(filter).toBeVisible()
  await Developer.openComponentState()
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Problems')
  if (!component?.editable) {
    throw new Error(`Expected an editable Problems component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  const cardTitle = card.locator('.ComponentStateCardTitle')
  await expect(cardTitle).toHaveText('Problems')
  const cardStatus = card.locator('.ComponentStateCardStatus')
  await expect(cardStatus).toHaveText('Open JSON state')
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

  const updatedState = await ComponentState.getState<{ readonly filterValue: string }>(component.uid)
  if (updatedState.filterValue !== 'live state filter') {
    throw new Error(`Expected Problems filter to update, got ${updatedState.filterValue}`)
  }
}
