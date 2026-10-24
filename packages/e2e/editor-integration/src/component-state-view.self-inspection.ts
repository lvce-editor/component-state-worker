import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.self-inspection'

export const test: Test = async ({ Command, ComponentState, Developer, Editor, expect, Locator, Settings }) => {
  await Settings.update({ 'componentStateView.showStateSize': true, 'editor.fontFamily': 'monospace' })
  await Developer.openComponentState()
  await Developer.openComponentState()
  const view = Locator('.ComponentStateView')
  await expect(view).toBeVisible()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'ComponentState')
  if (!component?.editable) {
    throw new Error(`Expected ComponentState with a live state API, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  const cardTitle = card.locator('.ComponentStateCardTitle')
  const cardStatus = card.locator('.ComponentStateCardStatus')
  const cardUid = card.locator('.ComponentStateCardUid')
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  const editor = Locator('.Editor')
  await expect(card).toBeVisible()
  await expect(cardTitle).toHaveText('ComponentState')
  await expect(cardStatus).toHaveText('Open JSON state')
  await expect(cardUid).toContainText('bytes')
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies the live self-inspection action
  await card.click()
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  await expect(editor).toBeVisible()
  const state = await Editor.getTextAsJson()
  const { columnCount, components: viewComponents, loaded, uid } = state
  if (uid !== component.uid || !Array.isArray(viewComponents) || typeof columnCount !== 'number' || typeof loaded !== 'boolean') {
    throw new Error(`Expected the ComponentState view state for uid ${component.uid}, got ${JSON.stringify(state)}`)
  }
  await Editor.setJsonAsText({ ...state, columnCount: columnCount + 1 })
  await expect(card).toBeVisible()
  const updatedState = await ComponentState.getState<{ readonly columnCount: number }>(component.uid)
  if (updatedState.columnCount !== columnCount + 1) {
    throw new Error(`Expected ComponentState columnCount to update from JSON, got ${JSON.stringify(updatedState)}`)
  }

  const refreshButton = Locator('.ComponentStateHeader .IconButton[title="Refresh"]')
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies manual refresh while inspecting ComponentState
  await refreshButton.click()
  await expect(card).toBeVisible()

  await Command.execute('Layout.openSecondarySideBarViewlet', 'Explorer')
  await expect(view).toHaveCount(0)
  await Developer.openComponentState()
  const reopenedComponents = await ComponentState.getComponents()
  const reopenedComponent = reopenedComponents.find((item) => item.moduleId === 'ComponentState')
  if (!reopenedComponent?.editable) {
    throw new Error(`Expected ComponentState to remain editable after disposal and reopen, got ${JSON.stringify(reopenedComponent)}`)
  }
  const reopenedCard = Locator(`.ComponentStateCard[data-uid="${reopenedComponent.uid}"]`)
  await expect(reopenedCard).toBeVisible()
}
